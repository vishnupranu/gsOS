import type {
  AIProvider,
  AIProviderConfig,
  ChatCompletionResponse,
  StreamingChunk,
  FallbackConfig,
  GatewayRequest,
} from '../types/index.js';
import type { AIProviderAdapter } from '../types/index.js';
import { FallbackRouter } from './fallback.js';

import {
  OpenAIProvider,
  AnthropicProvider,
  GeminiProvider,
  DeepSeekProvider,
  QwenProvider,
  OpenRouterProvider,
  OllamaProvider,
} from '../providers/index.js';

export interface GatewayConfig {
  providers: Map<AIProvider, AIProviderConfig>;
  fallback?: FallbackConfig;
  defaultProvider?: AIProvider;
}

export class AIGateway {
  private providers: Map<AIProvider, AIProviderAdapter> = new Map();
  private configs: Map<AIProvider, AIProviderConfig> = new Map();
  private fallbackRouter: FallbackRouter | null = null;
  private defaultProvider: AIProvider = 'openai';

  constructor(config: GatewayConfig) {
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

  private registerDefaultProviders(): void {
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('deepseek', new DeepSeekProvider());
    this.providers.set('qwen', new QwenProvider());
    this.providers.set('openrouter', new OpenRouterProvider());
    this.providers.set('ollama', new OllamaProvider());
  }

  configureProvider(provider: AIProvider, config: AIProviderConfig): void {
    this.configs.set(provider, config);
  }

  async createCompletion(
    request: GatewayRequest
  ): Promise<ChatCompletionResponse> {
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

  async *createStreamingCompletion(
    request: GatewayRequest
  ): AsyncGenerator<StreamingChunk, void, unknown> {
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

  getProviderHealth(): Map<AIProvider, { failures: number; isOpen: boolean; lastFailure: Date | null }> | null {
    return this.fallbackRouter?.getProviderHealth() ?? null;
  }

  resetProvider(provider: AIProvider): void {
    this.fallbackRouter?.resetProvider(provider);
  }

  resetAllProviders(): void {
    this.fallbackRouter?.resetAllProviders();
  }

  listProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }
}

// Factory function for easy creation
export function createAIGateway(config: GatewayConfig): AIGateway {
  return new AIGateway(config);
}