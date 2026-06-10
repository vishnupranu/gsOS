import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, data: any) {
    return this.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        nodes: data.nodes,
        edges: data.edges,
        triggerType: data.trigger?.type || 'manual',
        triggerConfig: data.trigger?.config || {},
        timeout: data.settings?.timeout,
        retryAttempts: data.settings?.retryAttempts,
        retryDelay: data.settings?.retryDelay,
        concurrency: data.settings?.concurrency,
        organizationId,
        createdById: userId,
      },
    });
  }

  async findById(id: string) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id } });
    if (!workflow) throw new NotFoundException('Workflow not found');
    return workflow;
  }

  async list(organizationId: string, params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (status) where.status = status;

    const [workflows, total] = await Promise.all([
      this.prisma.workflow.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.workflow.count({ where }),
    ]);

    return { data: workflows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: any) {
    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.nodes && { nodes: data.nodes }),
        ...(data.edges && { edges: data.edges }),
        ...(data.status && { status: data.status }),
      },
    });
  }

  async delete(id: string) {
    await this.prisma.workflow.delete({ where: { id } });
    return { success: true };
  }

  async run(id: string, input: any) {
    const workflow = await this.findById(id);
    const run = await this.prisma.workflowRun.create({
      data: {
        workflowId: id,
        input,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Update workflow last run
    await this.prisma.workflow.update({
      where: { id },
      data: { lastRunAt: new Date() },
    });

    // Simulate workflow execution
    setTimeout(async () => {
      await this.prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: 'COMPLETED',
          output: { result: 'Workflow completed successfully' },
          endedAt: new Date(),
        },
      });
    }, 2000);

    return run;
  }

  async getRuns(id: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [runs, total] = await Promise.all([
      this.prisma.workflowRun.findMany({
        where: { workflowId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workflowRun.count({ where: { workflowId: id } }),
    ]);

    return { data: runs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}