import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MCPService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, data: any) {
    return this.prisma.mCPConnection.create({
      data: {
        name: data.name,
        type: data.type,
        apiKey: data.config?.apiKey,
        accessToken: data.config?.accessToken,
        refreshToken: data.config?.refreshToken,
        webhookUrl: data.config?.webhookUrl,
        scopes: data.config?.scopes || [],
        status: 'PENDING',
        organizationId,
        createdById: userId,
      },
    });
  }

  async findById(id: string) {
    const conn = await this.prisma.mCPConnection.findUnique({ where: { id } });
    if (!conn) throw new NotFoundException('MCP connection not found');
    return conn;
  }

  async list(organizationId: string) {
    return this.prisma.mCPConnection.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.mCPConnection.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
      },
    });
  }

  async delete(id: string) {
    await this.prisma.mCPConnection.delete({ where: { id } });
    return { success: true };
  }

  async sync(id: string) {
    const conn = await this.findById(id);
    // In production, this would trigger actual sync with the external service
    await this.prisma.mCPConnection.update({
      where: { id },
      data: { lastSyncAt: new Date(), status: 'CONNECTED' },
    });
    return { success: true };
  }
}