import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { aiRouter } from './routes/ai';
import { modelsRouter } from './routes/models';

const fastify = Fastify({
  logger: true,
});

async function start() {
  await fastify.register(cors, { origin: true });
  await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await fastify.register(websocket);

  fastify.get('/health', async () => ({ status: 'ok', service: 'ai-gateway' }));

  fastify.register(aiRouter, { prefix: '/api/v1/ai' });
  fastify.register(modelsRouter, { prefix: '/api/v1/models' });

  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log('AI Gateway running on port 3002');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();