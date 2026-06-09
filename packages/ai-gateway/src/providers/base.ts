import type {
  AIProviderAdapter,
  AIProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamingChunk,
  AIProvider,
} from '../types/index.js';

export abstract class BaseProvider implements AIProviderAdapter {
  abstract name: AIProvider;

  abstract supportsStreaming(): boolean;

  abstract mapModelName(model: string): string;

  protected getHeaders(config: AIProviderConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    return headers;
  }

  protected getTimeout(config: AIProviderConfig): number {
    return config.timeout ?? 60000;
  }

  protected getMaxRetries(config: AIProviderConfig): number {
    return config.maxRetries ?? 3;
  }

  async createCompletion(
    request: ChatCompletionRequest,
    config: AIProviderConfig
  ): Promise<ChatCompletionResponse> {
    const url = this.buildUrl(config);
    const headers = this.getHeaders(config);
    const timeout = this.getTimeout(config);
    const maxRetries = this.getMaxRetries(config);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          url,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(this.transformRequest(request)),
          },
          timeout
        );

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        return this.transformResponse(data);
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError;
  }

  async *createStreamingCompletion(
    request: ChatCompletionRequest,
    config: AIProviderConfig
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    if (!this.supportsStreaming()) {
      throw new Error(`Provider ${this.name} does not support streaming`);
    }

    const url = this.buildUrl(config);
    const headers = this.getHeaders(config);
    headers['Accept'] = 'text/event-stream';
    headers['Cache-Control'] = 'no-cache';
    headers['Connection'] = 'keep-alive';

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(this.transformRequest(request)),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

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
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              yield this.transformStreamingChunk(parsed);
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  protected abstract buildUrl(config: AIProviderConfig): string;
  protected abstract transformRequest(request: ChatCompletionRequest): Record<string, unknown>;
  protected abstract transformResponse(data: unknown): ChatCompletionResponse;
  protected abstract transformStreamingChunk(data: unknown): StreamingChunk;

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
