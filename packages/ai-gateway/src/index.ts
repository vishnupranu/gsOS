// AI Gateway Package
// A unified interface for multiple AI providers with fallback routing

export * from './types/index.js';
export * from './providers/index.js';
export * from './gateway/index.js';

// Provider types for convenience
import type { AIProvider } from './types/index.js';

// Re-export provider names for easy configuration
export const PROVIDERS = {
  OPENAI: 'openai' as AIProvider,
  ANTHROPIC: 'anthropic' as AIProvider,
  GEMINI: 'gemini' as AIProvider,
  DEEPSEEK: 'deepseek' as AIProvider,
  QWEN: 'qwen' as AIProvider,
  OPENROUTER: 'openrouter' as AIProvider,
  OLLAMA: 'ollama' as AIProvider,
} as const;

// Default fallback chain
export const DEFAULT_FALLBACK_ORDER: AIProvider[] = [
  'openai',
  'anthropic',
  'deepseek',
  'qwen',
];

// Convenience function to create a gateway with common defaults
export function createGateway(options?: {
  openaiKey?: string;
  anthropicKey?: string;
  geminiKey?: string;
  deepseekKey?: string;
  qwenKey?: string;
  openrouterKey?: string;
  ollamaUrl?: string;
  fallback?: boolean;
}) {
  const { createAIGateway } = require('./gateway/index.js');
  
  const providers = new Map();
  
  if (options?.openaiKey) {
    providers.set('openai', { apiKey: options.openaiKey });
  }
  if (options?.anthropicKey) {
    providers.set('anthropic', { apiKey: options.anthropicKey });
  }
  if (options?.geminiKey) {
    providers.set('gemini', { apiKey: options.geminiKey });
  }
  if (options?.deepseekKey) {
    providers.set('deepseek', { apiKey: options.deepseekKey });
  }
  if (options?.qwenKey) {
    providers.set('qwen', { apiKey: options.qwenKey });
  }
  if (options?.openrouterKey) {
    providers.set('openrouter', { apiKey: options.openrouterKey });
  }
  if (options?.ollamaUrl) {
    providers.set('ollama', { baseURL: options.ollamaUrl });
  }

  return createAIGateway({
    providers,
    fallback: options?.fallback ? {
      enabled: true,
      providers: DEFAULT_FALLBACK_ORDER,
    } : undefined,
  });
}