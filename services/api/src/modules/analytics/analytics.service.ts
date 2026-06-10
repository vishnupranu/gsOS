import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(data: {
    name: string;
    properties?: Record<string, any>;
    userId?: string;
    organizationId?: string;
    sessionId?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        action: data.name,
        entityType: 'event',
        metadata: data.properties,
        userId: data.userId,
        organizationId: data.organizationId,
      },
    });
  }

  async getDashboardData(organizationId: string, params: { startDate?: Date; endDate?: Date }) {
    const where: any = { organizationId };
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [
      totalConversations,
      totalMessages,
      totalAgents,
      totalWorkflows,
      usageByType,
    ] = await Promise.all([
      this.prisma.conversation.count({ where }),
      this.prisma.message.count({
        where: { conversation: { organizationId } },
      }),
      this.prisma.agent.count({ where }),
      this.prisma.workflow.count({ where }),
      this.prisma.usageRecord.groupBy({
        by: ['type'],
        where,
        _sum: { quantity: true, cost: true },
      }),
    ]);

    return {
      overview: {
        conversations: totalConversations,
        messages: totalMessages,
        agents: totalAgents,
        workflows: totalWorkflows,
      },
      usage: usageByType.map(u => ({
        type: u.type,
        quantity: u._sum.quantity || 0,
        cost: u._sum.cost || 0,
      })),
    };
  }

  async getUserActivity(organizationId: string, userId: string) {
    const [conversations, messages] = await Promise.all([
      this.prisma.conversation.count({
        where: { organizationId, createdById: userId },
      }),
      this.prisma.message.count({
        where: { createdById: userId },
      }),
    ]);

    return { conversations, messages };
  }

  async getRetentionMetrics(organizationId: string) {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      select: { id: true, createdAt: true },
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeUsers = users.filter(u => {
      return new Date(u.createdAt) <= now;
    }).length;

    return {
      totalUsers: users.length,
      activeLast30Days: activeUsers,
      retentionRate: users.length > 0 ? (activeUsers / users.length) * 100 : 0,
    };
  }
}