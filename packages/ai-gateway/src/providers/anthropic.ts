import { BaseProvider } from './base.js';
import type {
  AIProviderConfig,
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamingChunk,
} from '../types/index.js';

export class AnthropicProvider extends BaseProvider {
  name: AIProvider = 'anthropic';
  private readonly defaultBaseURL = 'https://api.anthropic.com/v1';
  private readonly defaultModel = 'claude-3-5-sonnet-20241022';
  private readonly apiVersion = '2023-06-01';

  supportsStreaming(): boolean {
    return true;
  }

  mapModelName(model: string): string {
    const modelMap: Record<string, string> = {
      'claude-3': 'claude-3-5-sonnet-20241022',
      'claude-3.5': 'claude-3-5-sonnet-20241022',
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307',
    };
    return modelMap[model] ?? model;
  }

  protected buildUrl(config: AIProviderConfig): string {
    const baseURL = config.baseURL ?? this.defaultBaseURL;
    return `${baseURL}/messages`;
  }

  protected transformRequest(request: ChatCompletionRequest): Record<string, unknown> {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const otherMessages = request.messages.filter((m) => m.role !== 'system');

    const anthropicMessages = otherMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    return {
      model: request.model ?? this.defaultModel,
      messages: anthropicMessages,
      system: systemMessage?.content,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature,
      stream: request.stream ?? false,
      stop_sequence: request.stop?.[0],
    };
  }

  protected transformResponse(data: unknown): ChatCompletionResponse {
    const d = data as Record<string, unknown>;
    const content = d.content as Array<Record<string, unknown>>;
    const usage = d.usage as Record<string, number> | undefined;
    
    return {
      id: `anthropic-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: d.model as string,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: content[0]?.text as string ?? '',
          },
          finishReason: (d.stop_reason as string) ?? 'stop',
        },
      ],
      usage: usage ? {
        promptTokens: usage.input_tokens ?? 0,
        completionTokens: usage.output_tokens ?? 0,
        totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
      } : undefined,
    };
  }

  protected transformStreamingChunk(data: unknown): StreamingChunk {
    const d = data as Record<string, unknown>;
    const content = d.content as Array<Record<string, unknown>>;
    
    return {
      id: d.id as string,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: d.model as string,
      choices: [
        {
          index: 0,
          delta: content[0] ? { content: content[0].text as string } : {},
          finishReason: d.stop_reason as string | undefined,
        },
      ],
    };
  }

  protected getHeaders(config: AIProviderConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey ?? '',
      'anthropic-version': this.apiVersion,
    };
    return headers;
  }
}