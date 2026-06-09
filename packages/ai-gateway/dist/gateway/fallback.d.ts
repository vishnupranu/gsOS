import { AIProvider, AIProviderConfig, AIProviderAdapter, ChatCompletionRequest, ChatCompletionResponse, StreamingChunk, FallbackConfig } from '../types/index.js';
export declare class FallbackRouter {
    private providers;
    private fallbackStates;
    private fallbackConfig;
    constructor(providers: Map<AIProvider, AIProviderAdapter>, config: FallbackConfig);
    createCompletion(request: ChatCompletionRequest, configs: Map<AIProvider, AIProviderConfig>): Promise<ChatCompletionResponse>;
    createStreamingCompletion(request: ChatCompletionRequest, configs: Map<AIProvider, AIProviderConfig>): AsyncGenerator<StreamingChunk, void, unknown>;
    private recordFailure;
    private resetFailureCount;
    private extractStatusCode;
    private isRetryable;
    getProviderHealth(): Map<AIProvider, {
        failures: number;
        isOpen: boolean;
        lastFailure: Date | null;
    }>;
    resetProvider(provider: AIProvider): void;
    resetAllProviders(): void;
}
//# sourceMappingURL=fallback.d.ts.map