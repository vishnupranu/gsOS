import { BaseProvider } from './base.js';
import type {
  AIProviderConfig,
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamingChunk,
} from '../types/index.js';

export class QwenProvider extends BaseProvider {
  name: AIProvider = 'qwen';
  private readonly defaultBaseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  private readonly defaultModel = 'qwen-plus';

  supportsStreaming(): boolean {
    return true;
  }

  mapModelName(model: string): string {
    const modelMap: Record<string, string> = {
      'qwen-turbo': 'qwen-turbo',
      'qwen-plus': 'qwen-plus',
      'qwen-max': 'qwen-max',
      'qwen-max-longcontext': 'qwen-max-longcontext',
    };
    return modelMap[model] ?? model;
  }

  protected buildUrl(config: AIProviderConfig): string {
    const baseURL = config.baseURL ?? this.defaultBaseURL;
    return `${baseURL}/chat/completions`;
  }

  protected transformRequest(request: ChatCompletionRequest): Record<string, unknown> {
    return {
      model: request.model ?? this.defaultModel,
      messages: request.messages,
      temperature: request.temperature,
      top_p: request.topP,
      max_tokens: request.maxTokens,
      stream: request.stream ?? false,
      stop: request.stop,
      presence_penalty: request.presencePenalty,
      frequency_penalty: request.frequencyPenalty,
    };
  }

  protected transformResponse(data: unknown): ChatCompletionResponse {
    const d = data as Record<string, unknown>;
    return {
      id: d.id as string,
      object: d.object as string,
      created: d.created as number,
      model: d.model as string,
      choices: (d.choices as Array<Record<string, unknown>>).map((choice, index) => ({
        index,
        message: choice.message as { role: string; content: string },
        finishReason: choice.finish_reason as string,
      })),
      usage: d.usage as {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      },
    };
  }

  protected transformStreamingChunk(data: unknown): StreamingChunk {
    const d = data as Record<string, unknown>;
    return {
      id: d.id as string,
      object: 'chat.completion.chunk',
      created: d.created as number,
      model: d.model as string,
      choices: (d.choices as Array<Record<string, unknown>>).map((choice) => ({
        index: choice.index as number,
        delta: choice.delta as Partial<{ role: string; content: string }>,
        finishReason: choice.finish_reason as string | undefined,
      })),
    };
  }
}