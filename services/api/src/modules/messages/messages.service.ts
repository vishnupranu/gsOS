import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(conversationId: string, userId: string | null, data: {
    role: string;
    content: string;
    model?: string;
    attachments?: any[];
    artifacts?: any[];
  }) {
    return this.prisma.message.create({
      data: {
        role: data.role as any,
        content: data.content,
        model: data.model,
        attachments: data.attachments,
        artifacts: data.artifacts,
        conversationId,
        createdById: userId,
      },
    });
  }

  async findById(id: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          select: { id: true, organizationId: true },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async update(id: string, data: { content?: string; artifacts?: any[] }) {
    return this.prisma.message.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.message.delete({ where: { id } });
    return { success: true };
  }

  async feedback(id: string, isPositive: boolean) {
    // In production, store feedback in a separate table
    return { success: true, isPositive };
  }
}