import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIGateway, createAIGateway } from '../gateway/index.js';

describe('AIGateway', () => {
  let gateway: AIGateway;

  beforeEach(() => {
    gateway = createAIGateway({
      providers: new Map([
        ['openai', { apiKey: 'test-key' }],
      ]),
      defaultProvider: 'openai',
    });
  });

  it('should be created successfully', () => {
    expect(gateway).toBeDefined();
  });

  it('should list available providers', () => {
    const providers = gateway.listProviders();
    expect(providers).toContain('openai');
    expect(providers).toContain('anthropic');
    expect(providers).toContain('gemini');
  });

  it('should allow configuring providers', () => {
    gateway.configureProvider('anthropic', { apiKey: 'test-key' });
    const health = gateway.getProviderHealth();
    expect(health).toBeNull(); // No fallback enabled
  });

  it('should allow resetting providers', () => {
    // This should not throw
    expect(() => gateway.resetAllProviders()).not.toThrow();
  });
});

describe('createAIGateway', () => {
  it('should create a gateway with default providers', () => {
    const gateway = createAIGateway({
      providers: new Map(),
    });
    expect(gateway.listProviders().length).toBeGreaterThan(0);
  });

  it('should allow setting a default provider', () => {
    const gateway = createAIGateway({
      providers: new Map(),
      defaultProvider: 'anthropic',
    });
    expect(gateway).toBeDefined();
  });
});