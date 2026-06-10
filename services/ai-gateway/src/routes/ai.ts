import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const chatSchema = z.object({
  model: z.string(),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  stream: z.boolean().optional(),
});

export async function aiRouter(fastify: FastifyInstance) {
  fastify.post('/chat/completions', async (request, reply) => {
    const body = chatSchema.parse(request.body);

    if (body.stream) {
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const chunks = ['Hello', ', I\'m', ' here', ' to help', ' you', '!'];
      for (const chunk of chunks) {
        reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`);
        await new Promise(r => setTimeout(r, 100));
      }
      reply.raw.write('data: [DONE]\n\n');
      reply.raw.end();
      return;
    }

    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Date.now(),
      model: body.model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content: 'Simulated response - routes to appropriate AI provider in production.' },
        finish_reason: 'stop',
      }],
      usage: { prompt_tokens: 20, completion_tokens: 30, total_tokens: 50 },
    };
  });
}