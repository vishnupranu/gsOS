import { FallbackRouter } from './fallback.js';
import { OpenAIProvider, AnthropicProvider, GeminiProvider, DeepSeekProvider, QwenProvider, OpenRouterProvider, OllamaProvider, } from '../providers/index.js';
export class AIGateway {
    providers = new Map();
    configs = new Map();
    fallbackRouter = null;
    defaultProvider = 'openai';
    constructor(config) {
        this.registerDefaultProviders();
        // Apply custom configs
        for (const [provider, providerConfig] of config.providers) {
            this.configureProvider(provider, providerConfig);
        }
        // Setup fallback router
        if (config.fallback) {
            this.fallbackRouter = new FallbackRouter(this.providers, config.fallback);
        }
        if (config.defaultProvider) {
            this.defaultProvider = config.defaultProvider;
        }
    }
    registerDefaultProviders() {
        this.providers.set('openai', new OpenAIProvider());
        this.providers.set('anthropic', new AnthropicProvider());
        this.providers.set('gemini', new GeminiProvider());
        this.providers.set('deepseek', new DeepSeekProvider());
        this.providers.set('qwen', new QwenProvider());
        this.providers.set('openrouter', new OpenRouterProvider());
        this.providers.set('ollama', new OllamaProvider());
    }
    configureProvider(provider, config) {
        this.configs.set(provider, config);
    }
    async createCompletion(request) {
        const provider = request.provider ?? this.defaultProvider;
        const enrichedRequest = { ...request, provider };
        if (this.fallbackRouter) {
            return this.fallbackRouter.createCompletion(enrichedRequest, this.configs);
        }
        const adapter = this.providers.get(provider);
        if (!adapter) {
            throw new Error(`Provider ${provider} not registered`);
        }
        const config = this.configs.get(provider) ?? {};
        return adapter.createCompletion(request, config);
    }
    async *createStreamingCompletion(request) {
        const provider = request.provider ?? this.defaultProvider;
        const enrichedRequest = { ...request, provider };
        if (this.fallbackRouter) {
            yield* this.fallbackRouter.createStreamingCompletion(enrichedRequest, this.configs);
            return;
        }
        const adapter = this.providers.get(provider);
        if (!adapter) {
            throw new Error(`Provider ${provider} not registered`);
        }
        const config = this.configs.get(provider) ?? {};
        yield* adapter.createStreamingCompletion(request, config);
    }
    getProviderHealth() {
        return this.fallbackRouter?.getProviderHealth() ?? null;
    }
    resetProvider(provider) {
        this.fallbackRouter?.resetProvider(provider);
    }
    resetAllProviders() {
        this.fallbackRouter?.resetAllProviders();
    }
    listProviders() {
        return Array.from(this.providers.keys());
    }
}
// Factory function for easy creation
export function createAIGateway(config) {
    return new AIGateway(config);
}
//# sourceMappingURL=index.js.map