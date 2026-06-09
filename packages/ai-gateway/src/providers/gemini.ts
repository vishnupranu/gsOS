import type {
  AIProviderConfig,
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamingChunk,
} from '../types/index.js';
import type { AIProviderAdapter } from '../types/index.js';

export class GeminiProvider implements AIProviderAdapter {
  name: AIProvider = 'gemini';
  private readonly defaultBaseURL = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly defaultModel = 'gemini-1.5-pro';

  supportsStreaming(): boolean {
    return true;
  }

  mapModelName(model: string): string {
    const modelMap: Record<string, string> = {
      'gemini-pro': 'gemini-1.5-pro',
      'gemini-pro-vision': 'gemini-1.5-flash',
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash',
    };
    return modelMap[model] ?? model;
  }

  private buildUrl(config: AIProviderConfig): string {
    const model = config.defaultModel ?? this.defaultModel;
    return `${this.defaultBaseURL}/models/${model}:generateContent?key=${config.apiKey ?? ''}`;
  }

  private transformRequest(request: ChatCompletionRequest): Record<string, unknown> {
    const contents = request.messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    return {
      contents,
      generationConfig: {
        temperature: request.temperature,
        topP: request.topP,
        maxOutputTokens: request.maxTokens,
        stopSequences: request.stop,
      },
    };
  }

  private transformResponse(data: unknown): ChatCompletionResponse {
    const d = data as Record<string, unknown>;
    const candidates = d.candidates as Array<Record<string, unknown>>;
    const firstCandidate = candidates?.[0];
    const content = firstCandidate?.content as Record<string, unknown>;
    const parts = content?.parts as Array<Record<string, unknown>>;
    
    return {
      id: `gemini-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: (d.modelVersion as string) ?? this.defaultModel,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: parts?.[0]?.text as string ?? '',
          },
          finishReason: (firstCandidate?.finishReason as string) ?? 'stop',
        },
      ],
    };
  }

  private transformStreamingChunk(data: unknown): StreamingChunk {
    const d = data as Record<string, unknown>;
    const candidates = d.candidates as Array<Record<string, unknown>>;
    const firstCandidate = candidates?.[0];
    const content = firstCandidate?.content as Record<string, unknown>;
    const parts = content?.parts as Array<Record<string, unknown>>;
    
    return {
      id: d.promptTokenCount ? `gemini-${Date.now()}` : (d.name as string),
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: (d.modelVersion as string) ?? this.defaultModel,
      choices: [
        {
          index: 0,
          delta: parts?.[0] ? { content: parts[0].text as string } : {},
          finishReason: firstCandidate?.finishReason as string | undefined,
        },
      ],
    };
  }

  async createCompletion(
    request: ChatCompletionRequest,
    config: AIProviderConfig
  ): Promise<ChatCompletionResponse> {
    const url = this.buildUrl(config);
    const timeout = config.timeout ?? 60000;
    
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.transformRequest(request)),
    }, timeout);

    const data = await response.json();
    return this.transformResponse(data);
  }

  async *createStreamingCompletion(
    request: ChatCompletionRequest,
    config: AIProviderConfig
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    const url = this.buildUrl(config).replace('generateContent', 'streamGenerateContent');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.transformRequest(request)),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              yield this.transformStreamingChunk(parsed);
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}