import {
  AIProvider,
  AIProviderConfig,
  AIProviderAdapter,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamingChunk,
  FallbackConfig,
  FallbackState,
  AIProviderError,
} from '../types/index.js';

export class FallbackRouter {
  private providers: Map<AIProvider, AIProviderAdapter> = new Map();
  private fallbackStates: Map<AIProvider, FallbackState> = new Map();
  private fallbackConfig: FallbackConfig;

  constructor(
    providers: Map<AIProvider, AIProviderAdapter>,
    config: FallbackConfig
  ) {
    this.providers = providers;
    this.fallbackConfig = {
      enabled: config.enabled ?? true,
      providers: config.providers ?? [],
      retryDelayMs: config.retryDelayMs ?? 1000,
      maxRetries: config.maxRetries ?? 3,
      circuitBreakerThreshold: config.circuitBreakerThreshold ?? 5,
    };

    // Initialize fallback states
    for (const provider of this.fallbackConfig.providers) {
      this.fallbackStates.set(provider, {
        provider,
        failures: 0,
        lastFailure: null,
        isOpen: false,
      });
    }
  }

  async createCompletion(
    request: ChatCompletionRequest,
    configs: Map<AIProvider, AIProviderConfig>
  ): Promise<ChatCompletionResponse> {
    if (!this.fallbackConfig.enabled || this.fallbackConfig.providers.length === 0) {
      // Single provider mode
      const providerName = request.provider ?? 'openai';
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }
      return provider.createCompletion(request, configs.get(providerName) ?? {});
    }

    // Fallback mode - try providers in order
    const errors: AIProviderError[] = [];
    const attempts: AIProvider[] = [];

    for (const providerName of this.fallbackConfig.providers) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      const state = this.fallbackStates.get(providerName);
      
      // Skip if circuit breaker is open
      if (state?.isOpen) {
        continue;
      }

      attempts.push(providerName);

      try {
        const config = configs.get(providerName) ?? {};
        const response = await provider.createCompletion(request, config);
        
        // Reset failure count on success
        this.resetFailureCount(providerName);
        
        return response;
      } catch (error) {
        const err = error as Error;
        const providerError = new AIProviderError(
          err.message,
          providerName,
          this.extractStatusCode(err),
          this.isRetryable(err)
        );
        
        errors.push(providerError);
        this.recordFailure(providerName);
      }
    }

    // All providers failed
    throw new Error(`All providers failed. Last error: ${errors[errors.length - 1]?.message}`);
  }

  async *createStreamingCompletion(
    request: ChatCompletionRequest,
    configs: Map<AIProvider, AIProviderConfig>
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    if (!this.fallbackConfig.enabled || this.fallbackConfig.providers.length === 0) {
      const providerName = request.provider ?? 'openai';
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }
      yield* provider.createStreamingCompletion(request, configs.get(providerName) ?? {});
      return;
    }

    // Fallback mode for streaming
    for (const providerName of this.fallbackConfig.providers) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      const state = this.fallbackStates.get(providerName);
      if (state?.isOpen) continue;

      try {
        const config = configs.get(providerName) ?? {};
        yield* provider.createStreamingCompletion(request, config);
        this.resetFailureCount(providerName);
        return;
      } catch (error) {
        this.recordFailure(providerName);
        // Try next provider
      }
    }

    throw new Error('All streaming providers failed');
  }

  private recordFailure(provider: AIProvider): void {
    const state = this.fallbackStates.get(provider);
    if (!state) return;

    state.failures++;
    state.lastFailure = new Date();

    // Open circuit breaker if threshold exceeded
    if (state.failures >= (this.fallbackConfig.circuitBreakerThreshold ?? 5)) {
      state.isOpen = true;
      
      // Auto-reset after delay
      setTimeout(() => {
        this.resetFailureCount(provider);
      }, this.fallbackConfig.retryDelayMs ?? 10000);
    }
  }

  private resetFailureCount(provider: AIProvider): void {
    const state = this.fallbackStates.get(provider);
    if (state) {
      state.failures = 0;
      state.isOpen = false;
      state.lastFailure = null;
    }
  }

  private extractStatusCode(error: Error): number | undefined {
    const match = error.message.match(/(\d{3})/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private isRetryable(error: Error): boolean {
    // Retry on network errors and 5xx errors
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /econnreset/i,
      /econnrefused/i,
      /5\d{2}/,
      /429/,
    ];
    
    return retryablePatterns.some((pattern) => pattern.test(error.message));
  }

  getProviderHealth(): Map<AIProvider, { failures: number; isOpen: boolean; lastFailure: Date | null }> {
    const health = new Map();
    for (const [provider, state] of this.fallbackStates) {
      health.set(provider, {
        failures: state.failures,
        isOpen: state.isOpen,
        lastFailure: state.lastFailure,
      });
    }
    return health;
  }

  resetProvider(provider: AIProvider): void {
    this.resetFailureCount(provider);
  }

  resetAllProviders(): void {
    for (const provider of this.fallbackStates.keys()) {
      this.resetFailureCount(provider);
    }
  }
}