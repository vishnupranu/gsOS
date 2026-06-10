import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, agents: true, workflows: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async create(data: { name: string; slug?: string }) {
    return this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
  }

  async update(id: string, data: { name?: string; logo?: string; settings?: any }) {
    return this.prisma.organization.update({
      where: { id },
      data: {
        ...data,
        ...(data.settings && { 
          defaultModel: data.settings.defaultModel,
          maxTokensPerDay: data.settings.maxTokensPerDay,
          allowedDomains: data.settings.allowedDomains,
          ssoEnabled: data.settings.ssoEnabled,
          mfaRequired: data.settings.mfaRequired,
        }),
      },
    });
  }

  async list(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { users: true } },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      data: organizations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}