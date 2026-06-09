import type { AIProviderAdapter, AIProviderConfig, ChatCompletionRequest, ChatCompletionResponse, StreamingChunk, AIProvider } from '../types/index.js';
export declare abstract class BaseProvider implements AIProviderAdapter {
    abstract name: AIProvider;
    abstract supportsStreaming(): boolean;
    abstract mapModelName(model: string): string;
    protected getHeaders(config: AIProviderConfig): Record<string, string>;
    protected getTimeout(config: AIProviderConfig): number;
    protected getMaxRetries(config: AIProviderConfig): number;
    createCompletion(request: ChatCompletionRequest, config: AIProviderConfig): Promise<ChatCompletionResponse>;
    createStreamingCompletion(request: ChatCompletionRequest, config: AIProviderConfig): AsyncGenerator<StreamingChunk, void, unknown>;
    protected abstract buildUrl(config: AIProviderConfig): string;
    protected abstract transformRequest(request: ChatCompletionRequest): Record<string, unknown>;
    protected abstract transformResponse(data: unknown): ChatCompletionResponse;
    protected abstract transformStreamingChunk(data: unknown): StreamingChunk;
    private fetchWithTimeout;
    private delay;
}
//# sourceMappingURL=base.d.ts.map