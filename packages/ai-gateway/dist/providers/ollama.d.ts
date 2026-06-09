import type { AIProviderConfig, AIProvider, ChatCompletionRequest, ChatCompletionResponse, StreamingChunk } from '../types/index.js';
import type { AIProviderAdapter } from '../types/index.js';
export declare class OllamaProvider implements AIProviderAdapter {
    name: AIProvider;
    private readonly defaultBaseURL;
    private readonly defaultModel;
    supportsStreaming(): boolean;
    mapModelName(model: string): string;
    private buildUrl;
    private transformRequest;
    private transformResponse;
    private transformStreamingChunk;
    createCompletion(request: ChatCompletionRequest, config: AIProviderConfig): Promise<ChatCompletionResponse>;
    createStreamingCompletion(request: ChatCompletionRequest, config: AIProviderConfig): AsyncGenerator<StreamingChunk, void, unknown>;
    private fetchWithTimeout;
}
//# sourceMappingURL=ollama.d.ts.map