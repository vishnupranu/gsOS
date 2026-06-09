import type { AIProvider, AIProviderConfig, ChatCompletionResponse, StreamingChunk, FallbackConfig, GatewayRequest } from '../types/index.js';
export interface GatewayConfig {
    providers: Map<AIProvider, AIProviderConfig>;
    fallback?: FallbackConfig;
    defaultProvider?: AIProvider;
}
export declare class AIGateway {
    private providers;
    private configs;
    private fallbackRouter;
    private defaultProvider;
    constructor(config: GatewayConfig);
    private registerDefaultProviders;
    configureProvider(provider: AIProvider, config: AIProviderConfig): void;
    createCompletion(request: GatewayRequest): Promise<ChatCompletionResponse>;
    createStreamingCompletion(request: GatewayRequest): AsyncGenerator<StreamingChunk, void, unknown>;
    getProviderHealth(): Map<AIProvider, {
        failures: number;
        isOpen: boolean;
        lastFailure: Date | null;
    }> | null;
    resetProvider(provider: AIProvider): void;
    resetAllProviders(): void;
    listProviders(): AIProvider[];
}
export declare function createAIGateway(config: GatewayConfig): AIGateway;
//# sourceMappingURL=index.d.ts.map