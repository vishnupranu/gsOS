import { AIProviderError, } from '../types/index.js';
export class FallbackRouter {
    providers = new Map();
    fallbackStates = new Map();
    fallbackConfig;
    constructor(providers, config) {
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
    async createCompletion(request, configs) {
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
        const errors = [];
        const attempts = [];
        for (const providerName of this.fallbackConfig.providers) {
            const provider = this.providers.get(providerName);
            if (!provider)
                continue;
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
            }
            catch (error) {
                const err = error;
                const providerError = new AIProviderError(err.message, providerName, this.extractStatusCode(err), this.isRetryable(err));
                errors.push(providerError);
                this.recordFailure(providerName);
            }
        }
        // All providers failed
        throw new Error(`All providers failed. Last error: ${errors[errors.length - 1]?.message}`);
    }
    async *createStreamingCompletion(request, configs) {
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
            if (!provider)
                continue;
            const state = this.fallbackStates.get(providerName);
            if (state?.isOpen)
                continue;
            try {
                const config = configs.get(providerName) ?? {};
                yield* provider.createStreamingCompletion(request, config);
                this.resetFailureCount(providerName);
                return;
            }
            catch (error) {
                this.recordFailure(providerName);
                // Try next provider
            }
        }
        throw new Error('All streaming providers failed');
    }
    recordFailure(provider) {
        const state = this.fallbackStates.get(provider);
        if (!state)
            return;
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
    resetFailureCount(provider) {
        const state = this.fallbackStates.get(provider);
        if (state) {
            state.failures = 0;
            state.isOpen = false;
            state.lastFailure = null;
        }
    }
    extractStatusCode(error) {
        const match = error.message.match(/(\d{3})/);
        return match ? parseInt(match[1], 10) : undefined;
    }
    isRetryable(error) {
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
    getProviderHealth() {
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
    resetProvider(provider) {
        this.resetFailureCount(provider);
    }
    resetAllProviders() {
        for (const provider of this.fallbackStates.keys()) {
            this.resetFailureCount(provider);
        }
    }
}
//# sourceMappingURL=fallback.js.map