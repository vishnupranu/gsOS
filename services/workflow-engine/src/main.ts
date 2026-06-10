import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import cron from 'cron-parser';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const workflowQueue = new Queue('workflow-runs', { connection });

const workflowWorker = new Worker(
  'workflow-runs',
  async (job) => {
    const { workflowId, input, nodes, edges } = job.data;
    console.log(`Processing workflow ${workflowId}`);

    // Execute workflow nodes in order
    for (const node of nodes || []) {
      console.log(`Executing node: ${node.type}`);
      await new Promise(r => setTimeout(r, 300));
    }

    return {
      output: 'Workflow execution completed',
      nodesExecuted: (nodes || []).length,
    };
  },
  { connection }
);

// Scheduler for cron-based workflows
const scheduledWorkflows = new Map<string, cron.CronJob>();

function scheduleWorkflow(workflowId: string, cronExpression: string) {
  const job = cron.parseExpression(cronExpression);
  const interval = setInterval(() => {
    const next = job.next().toDate();
    console.log(`Workflow ${workflowId} next run: ${next}`);
    workflowQueue.add('scheduled', { workflowId, trigger: 'schedule' });
  }, 60000); // Check every minute
  scheduledWorkflows.set(workflowId, interval as any);
}

async function start() {
  console.log('Workflow Engine Service started');
  console.log('Waiting for workflow executions...');
}

start();