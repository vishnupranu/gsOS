import type {
  AIProviderConfig,
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamingChunk,
} from '../types/index.js';
import type { AIProviderAdapter } from '../types/index.js';

export class OllamaProvider implements AIProviderAdapter {
  name: AIProvider = 'ollama';
  private readonly defaultBaseURL = 'http://localhost:11434';
  private readonly defaultModel = 'llama3';

  supportsStreaming(): boolean {
    return true;
  }

  mapModelName(model: string): string {
    // Ollama uses model tags like "llama3", "mistral", "codellama"
    const modelMap: Record<string, string> = {
      'llama3': 'llama3',
      'llama3.1': 'llama3.1',
      'llama3.2': 'llama3.2',
      'mistral': 'mistral',
      'mixtral': 'mixtral',
      'codellama': 'codellama',
      'phi3': 'phi3',
      'qwen2': 'qwen2',
      'deepseek-coder': 'deepseek-coder',
    };
    return modelMap[model] ?? model;
  }

  private buildUrl(config: AIProviderConfig): string {
    const baseURL = config.baseURL ?? this.defaultBaseURL;
    return `${baseURL}/api/chat`;
  }

  private transformRequest(request: ChatCompletionRequest): Record<string, unknown> {
    return {
      model: request.model ?? this.defaultModel,
      messages: request.messages,
      stream: request.stream ?? false,
      options: {
        temperature: request.temperature,
        top_p: request.topP,
        num_predict: request.maxTokens,
        stop: request.stop,
      },
    };
  }

  private transformResponse(data: unknown): ChatCompletionResponse {
    const d = data as Record<string, unknown>;
    const message = d.message as Record<string, unknown>;
    
    return {
      id: `ollama-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: d.model as string,
      choices: [
        {
          index: 0,
          message: {
            role: message.role as string,
            content: message.content as string,
          },
          finishReason: d.done ? 'stop' : 'length',
        },
      ],
      usage: d.eval_count ? {
        promptTokens: d.prompt_eval_count as number ?? 0,
        completionTokens: d.eval_count as number ?? 0,
        totalTokens: ((d.prompt_eval_count as number) ?? 0) + ((d.eval_count as number) ?? 0),
      } : undefined,
    };
  }

  private transformStreamingChunk(data: unknown): StreamingChunk {
    const d = data as Record<string, unknown>;
    const message = d.message as Record<string, unknown>;
    
    return {
      id: `ollama-${Date.now()}`,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: d.model as string,
      choices: [
        {
          index: 0,
          delta: { content: message.content as string },
          finishReason: d.done ? 'stop' : undefined,
        },
      ],
    };
  }

  async createCompletion(
    request: ChatCompletionRequest,
    config: AIProviderConfig
  ): Promise<ChatCompletionResponse> {
    const url = this.buildUrl(config);
    const timeout = config.timeout ?? 120000; // Ollama may need more time
    
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.transformRequest(request)),
    }, timeout);

    const data = await response.json();
    return this.transformResponse(data);
  }

  async *createStreamingCompletion(
    request: ChatCompletionRequest,
    config: AIProviderConfig
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    const url = this.buildUrl(config);
    const body = this.transformRequest({ ...request, stream: true });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              yield this.transformStreamingChunk(parsed);
              if (parsed.done) return;
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