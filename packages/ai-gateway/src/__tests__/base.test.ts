import { describe, it, expect } from 'vitest';
import { OpenAIProvider } from '../providers/openai.js';
import { AnthropicProvider } from '../providers/anthropic.js';
import { DeepSeekProvider } from '../providers/deepseek.js';

describe('AI Gateway Providers', () => {
  describe('OpenAIProvider', () => {
    const provider = new OpenAIProvider();

    it('should have correct name', () => {
      expect(provider.name).toBe('openai');
    });

    it('should support streaming', () => {
      expect(provider.supportsStreaming()).toBe(true);
    });

    it('should map model names correctly', () => {
      expect(provider.mapModelName('gpt-4')).toBe('gpt-4');
      expect(provider.mapModelName('gpt-4-turbo')).toBe('gpt-4-turbo');
      expect(provider.mapModelName('unknown-model')).toBe('unknown-model');
    });
  });

  describe('AnthropicProvider', () => {
    const provider = new AnthropicProvider();

    it('should have correct name', () => {
      expect(provider.name).toBe('anthropic');
    });

    it('should support streaming', () => {
      expect(provider.supportsStreaming()).toBe(true);
    });

    it('should map model names correctly', () => {
      expect(provider.mapModelName('claude-3')).toBe('claude-3-5-sonnet-20241022');
      expect(provider.mapModelName('claude-3-opus')).toBe('claude-3-opus-20240229');
    });
  });

  describe('DeepSeekProvider', () => {
    const provider = new DeepSeekProvider();

    it('should have correct name', () => {
      expect(provider.name).toBe('deepseek');
    });

    it('should support streaming', () => {
      expect(provider.supportsStreaming()).toBe(true);
    });

    it('should map model names correctly', () => {
      expect(provider.mapModelName('deepseek')).toBe('deepseek-chat');
    });
  });
});