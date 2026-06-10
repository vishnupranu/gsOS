import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, data: any) {
    return this.prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        model: data.model || 'gpt-4-turbo',
        prompt: data.prompt,
        tools: data.tools || [],
        memoryType: data.memory?.type,
        vectorStore: data.memory?.vectorStore,
        retentionDays: data.memory?.retentionDays,
        temperature: data.settings?.temperature,
        maxTokens: data.settings?.maxTokens,
        topP: data.settings?.topP,
        frequencyPenalty: data.settings?.frequencyPenalty,
        presencePenalty: data.settings?.presencePenalty,
        organizationId,
        createdById: userId,
      },
    });
  }

  async findById(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async list(organizationId: string, params: { page?: number; limit?: number; type?: string }) {
    const { page = 1, limit = 20, type } = params;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (type) where.type = type;

    const [agents, total] = await Promise.all([
      this.prisma.agent.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.agent.count({ where }),
    ]);

    return { data: agents, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: any) {
    return this.prisma.agent.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.prompt && { prompt: data.prompt }),
        ...(data.tools && { tools: data.tools }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async delete(id: string) {
    await this.prisma.agent.delete({ where: { id } });
    return { success: true };
  }

  async run(id: string, input: any) {
    const agent = await this.findById(id);
    const run = await this.prisma.agentRun.create({
      data: {
        agentId: id,
        input,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // In production, this would trigger the actual agent execution
    // For now, we just create the run record
    setTimeout(async () => {
      await this.prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'COMPLETED',
          output: { result: 'Agent execution completed' },
          endedAt: new Date(),
        },
      });
    }, 1000);

    return run;
  }
}