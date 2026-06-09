import { BaseProvider } from './base.js';
import type { AIProviderConfig, AIProvider, ChatCompletionRequest, ChatCompletionResponse, StreamingChunk } from '../types/index.js';
export declare class DeepSeekProvider extends BaseProvider {
    name: AIProvider;
    private readonly defaultBaseURL;
    private readonly defaultModel;
    supportsStreaming(): boolean;
    mapModelName(model: string): string;
    protected buildUrl(config: AIProviderConfig): string;
    protected transformRequest(request: ChatCompletionRequest): Record<string, unknown>;
    protected transformResponse(data: unknown): ChatCompletionResponse;
    protected transformStreamingChunk(data: unknown): StreamingChunk;
}
//# sourceMappingURL=deepseek.d.ts.map