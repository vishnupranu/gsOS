import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getSystemStats() {
    const [
      totalUsers,
      totalOrganizations,
      totalConversations,
      totalMessages,
      totalAgents,
      totalWorkflows,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.conversation.count(),
      this.prisma.message.count(),
      this.prisma.agent.count(),
      this.prisma.workflow.count(),
    ]);

    return {
      users: totalUsers,
      organizations: totalOrganizations,
      conversations: totalConversations,
      messages: totalMessages,
      agents: totalAgents,
      workflows: totalWorkflows,
    };
  }

  async getAllOrganizations(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { users: true, conversations: true, agents: true } },
        },
      }),
      this.prisma.organization.count(),
    ]);

    return { data: organizations, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAllUsers(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUserStatus(userId: string, status: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
    });
  }

  async updateOrganizationStatus(orgId: string, status: string) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data: { status: status as any },
    });
  }

  async getFeatureFlags() {
    return this.prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateFeatureFlag(key: string, enabled: boolean) {
    return this.prisma.featureFlag.upsert({
      where: { key },
      create: { key, enabled },
      update: { enabled },
    });
  }

  async getAuditLogs(params: { page?: number; limit?: number; organizationId?: string }) {
    const { page = 1, limit = 20, organizationId } = params;
    const skip = (page - 1) * limit;

    const where = organizationId ? { organizationId } : {};

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}