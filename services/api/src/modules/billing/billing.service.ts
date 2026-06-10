import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getSubscription(organizationId: string) {
    return this.prisma.subscription.findUnique({
      where: { organizationId },
    });
  }

  async createSubscription(organizationId: string, data: {
    plan: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }) {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    return this.prisma.subscription.create({
      data: {
        plan: data.plan as any,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        organizationId,
      },
    });
  }

  async updateSubscription(id: string, data: { plan?: string; status?: string }) {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...(data.plan && { plan: data.plan as any }),
        ...(data.status && { status: data.status as any }),
      },
    });
  }

  async recordUsage(organizationId: string, userId: string | null, data: {
    type: string;
    quantity: number;
    cost: number;
    metadata?: any;
  }) {
    return this.prisma.usageRecord.create({
      data: {
        type: data.type as any,
        quantity: data.quantity,
        cost: data.cost,
        metadata: data.metadata,
        organizationId,
        userId,
      },
    });
  }

  async getUsage(organizationId: string, params: { startDate?: Date; endDate?: Date; type?: string }) {
    const where: any = { organizationId };
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }
    if (params.type) where.type = params.type;

    return this.prisma.usageRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUsageSummary(organizationId: string) {
    const records = await this.prisma.usageRecord.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const summary: Record<string, { quantity: number; cost: number }> = {};
    for (const record of records) {
      if (!summary[record.type]) {
        summary[record.type] = { quantity: 0, cost: 0 };
      }
      summary[record.type].quantity += record.quantity;
      summary[record.type].cost += record.cost;
    }

    return summary;
  }
}