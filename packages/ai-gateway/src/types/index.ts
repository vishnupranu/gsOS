// AI Provider types
export type AIProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'gemini' 
  | 'deepseek' 
  | 'qwen' 
  | 'openrouter' 
  | 'ollama';

export interface AIProviderConfig {
  apiKey?: string;
  baseURL?: string;
  maxRetries?: number;
  timeout?: number;
  defaultModel?: string;
}

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: string;
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
  stop?: string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  provider?: AIProvider;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finishReason: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamingChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: Partial<ChatMessage>;
    finishReason?: string;
  }>;
}

// Fallback routing types
export interface FallbackConfig {
  enabled: boolean;
  providers: AIProvider[];
  retryDelayMs?: number;
  maxRetries?: number;
  circuitBreakerThreshold?: number;
}

export interface FallbackState {
  provider: AIProvider;
  failures: number;
  lastFailure: Date | null;
  isOpen: boolean;
}

// Unified gateway request
export interface GatewayRequest extends ChatCompletionRequest {
  provider?: AIProvider;
  fallback?: FallbackConfig;
}

// Provider adapter interface
export interface AIProviderAdapter {
  name: AIProvider;
  createCompletion(
    request: ChatCompletionRequest,
    config: AIProviderConfig
  ): Promise<ChatCompletionResponse>;
  createStreamingCompletion(
    request: ChatCompletionRequest,
    config: AIProviderConfig
  ): AsyncGenerator<StreamingChunk, void, unknown>;
  supportsStreaming(): boolean;
  mapModelName(model: string): string;
}

// Error types
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public statusCode?: number,
    public isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class AIGatewayError extends Error {
  constructor(
    message: string,
    public errors: AIProviderError[],
    public attempts: AIProvider[]
  ) {
    super(message);
    this.name = 'AIGatewayError';
  }
}
