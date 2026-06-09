// Error types
export class AIProviderError extends Error {
    provider;
    statusCode;
    isRetryable;
    constructor(message, provider, statusCode, isRetryable = true) {
        super(message);
        this.provider = provider;
        this.statusCode = statusCode;
        this.isRetryable = isRetryable;
        this.name = 'AIProviderError';
    }
}
export class AIGatewayError extends Error {
    errors;
    attempts;
    constructor(message, errors, attempts) {
        super(message);
        this.errors = errors;
        this.attempts = attempts;
        this.name = 'AIGatewayError';
    }
}
//# sourceMappingURL=index.js.map