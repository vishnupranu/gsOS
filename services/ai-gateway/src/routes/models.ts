import { FastifyInstance } from 'fastify';

const MODELS = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000, inputCost: 0.01, outputCost: 0.03 },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai', contextWindow: 8192, inputCost: 0.03, outputCost: 0.06 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', contextWindow: 16385, inputCost: 0.0005, outputCost: 0.0015 },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', contextWindow: 200000, inputCost: 0.015, outputCost: 0.075 },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic', contextWindow: 200000, inputCost: 0.003, outputCost: 0.015 },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', contextWindow: 32768, inputCost: 0.000125, outputCost: 0.0005 },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', contextWindow: 16384, inputCost: 0.00014, outputCost: 0.00028 },
];

export async function modelsRouter(fastify: FastifyInstance) {
  fastify.get('/list', async () => ({
    object: 'list',
    data: MODELS,
  }));

  fastify.get('/:modelId', async (request, reply) => {
    const { modelId } = request.params as { modelId: string };
    const model = MODELS.find(m => m.id === modelId);
    if (!model) {
      reply.status(404);
      return { error: 'Model not found' };
    }
    return model;
  });

  fastify.post('/estimate-cost', async (request) => {
    const { modelId, inputTokens, outputTokens } = request.body as any;
    const model = MODELS.find(m => m.id === modelId);
    if (!model) return { error: 'Model not found' };
    const inputCost = (model.inputCost / 1000) * inputTokens;
    const outputCost = (model.outputCost / 1000) * outputTokens;
    return {
      model: model.id,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCost: inputCost + outputCost,
      currency: 'USD',
    };
  });
}