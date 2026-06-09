export * from './types/index.js';
export * from './providers/index.js';
export * from './gateway/index.js';
import type { AIProvider } from './types/index.js';
export declare const PROVIDERS: {
    readonly OPENAI: AIProvider;
    readonly ANTHROPIC: AIProvider;
    readonly GEMINI: AIProvider;
    readonly DEEPSEEK: AIProvider;
    readonly QWEN: AIProvider;
    readonly OPENROUTER: AIProvider;
    readonly OLLAMA: AIProvider;
};
export declare const DEFAULT_FALLBACK_ORDER: AIProvider[];
export declare function createGateway(options?: {
    openaiKey?: string;
    anthropicKey?: string;
    geminiKey?: string;
    deepseekKey?: string;
    qwenKey?: string;
    openrouterKey?: string;
    ollamaUrl?: string;
    fallback?: boolean;
}): any;
//# sourceMappingURL=index.d.ts.map