import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, data: any) {
    return this.prisma.file.create({
      data: {
        name: data.name,
        type: data.type,
        size: data.size,
        url: data.url,
        path: data.path,
        mimeType: data.mimeType,
        width: data.metadata?.width,
        height: data.metadata?.height,
        duration: data.metadata?.duration,
        thumbnail: data.metadata?.thumbnail,
        checksum: data.metadata?.checksum,
        organizationId,
        createdById: userId,
      },
    });
  }

  async findById(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async list(organizationId: string, params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mimeType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.file.count({ where }),
    ]);

    return { data: files, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async delete(id: string) {
    await this.prisma.file.delete({ where: { id } });
    return { success: true };
  }

  async getStorageStats(organizationId: string) {
    const files = await this.prisma.file.findMany({
      where: { organizationId },
      select: { size: true, type: true },
    });

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const byType = files.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + f.size;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFiles: files.length,
      totalSize,
      byType,
    };
  }
}