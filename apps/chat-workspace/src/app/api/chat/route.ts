import { NextRequest, NextResponse } from 'next/server';

// Message format for AI providers
interface ChatMessage {
  role: string;
  content: string;
}

// Request body
interface ChatRequest {
  messages: ChatMessage[];
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// API configurations per provider
const PROVIDER_CONFIGS: Record<string, { baseURL: string; headers: (apiKey: string) => Record<string, string> }> = {
  openai: {
    baseURL: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
  },
  anthropic: {
    baseURL: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    }),
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
  },
};

// Map messages to provider-specific format
function transformMessagesForProvider(messages: ChatMessage[], provider: string): Record<string, unknown> {
  switch (provider) {
    case 'anthropic':
      const systemMessage = messages.find((m) => m.role === 'system');
      const otherMessages = messages.filter((m) => m.role !== 'system');
      return {
        model: 'claude-3-5-sonnet-20241022',
        messages: otherMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        system: systemMessage?.content,
        max_tokens: 4096,
        stream: true,
      };
    
    default:
      return {
        model: 'gpt-4o',
        messages,
        stream: true,
      };
  }
}

// Extract content from provider response
function extractContentFromChunk(data: unknown, provider: string): string {
  if (provider === 'anthropic') {
    const d = data as Record<string, unknown>;
    const content = d.content as Array<Record<string, unknown>> | undefined;
    return (content?.[0]?.text as string) ?? '';
  }
  
  const d = data as Record<string, unknown>;
  const choices = d.choices as Array<Record<string, unknown>> | undefined;
  const delta = choices?.[0]?.delta as Record<string, unknown> | undefined;
  return (delta?.content as string) ?? '';
}

// Check if streaming is complete
function isChunkDone(data: unknown, provider: string): boolean {
  if (provider === 'anthropic') {
    return Boolean((data as Record<string, unknown>).type === 'message_stop');
  }
  const d = data as Record<string, unknown>;
  const choices = d.choices as Array<Record<string, unknown>> | undefined;
  return Boolean(choices?.[0]?.finish_reason);
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { 
      messages, 
      provider = 'openai', 
      model,
      temperature = 0.7,
      maxTokens = 4096,
    } = body;

    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required. Provide via x-api-key header.' },
        { status: 401 }
      );
    }

    const providerConfig = PROVIDER_CONFIGS[provider];
    if (!providerConfig) {
      return NextResponse.json(
        { error: `Provider ${provider} not supported` },
        { status: 400 }
      );
    }

    const transformedBody = transformMessagesForProvider(messages, provider);
    if (model) {
      (transformedBody as Record<string, unknown>).model = model;
    }
    (transformedBody as Record<string, unknown>).temperature = temperature;
    (transformedBody as Record<string, unknown>).max_tokens = maxTokens;

    // Create streaming response
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(providerConfig.baseURL, {
            method: 'POST',
            headers: providerConfig.headers(apiKey),
            body: JSON.stringify(transformedBody),
          });

          if (!response.ok) {
            const error = await response.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error })}\n\n`));
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                  break;
                }

                try {
                  const data = JSON.parse(dataStr);
                  const content = extractContentFromChunk(data, provider);
                  const done = isChunkDone(data, provider);

                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content, done })}\n\n`)
                    );
                  }

                  if (done) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                    break;
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          reader.releaseLock();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}