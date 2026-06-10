import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, data: any) {
    return this.prisma.document.create({
      data: {
        name: data.name,
        type: data.type,
        url: data.url,
        size: data.size,
        mimeType: data.metadata?.mimeType,
        source: data.metadata?.source,
        author: data.metadata?.author,
        tags: data.metadata?.tags || [],
        customFields: data.metadata?.customFields,
        organizationId,
        createdById: userId,
      },
    });
  }

  async findById(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async list(organizationId: string, params: { page?: number; limit?: number; search?: string; type?: string }) {
    const { page = 1, limit = 20, search, type } = params;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.document.count({ where }),
    ]);

    return { data: documents, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async delete(id: string) {
    await this.prisma.document.delete({ where: { id } });
    return { success: true };
  }

  async search(organizationId: string, query: string, limit = 10) {
    // In production, this would use vector search with Qdrant
    return this.prisma.document.findMany({
      where: {
        organizationId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      take: limit,
    });
  }
}