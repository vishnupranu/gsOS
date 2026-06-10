import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, data: { title?: string; model?: string }) {
    return this.prisma.conversation.create({
      data: {
        title: data.title || 'New Conversation',
        model: data.model || 'gpt-4-turbo',
        organizationId,
        createdById: userId,
      },
    });
  }

  async findById(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async list(organizationId: string, params: { page?: number; limit?: number; search?: string; archived?: boolean }) {
    const { page = 1, limit = 20, search, archived = false } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      isArchived,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      data: conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: { title?: string; isPinned?: boolean; isArchived?: boolean; tags?: string[] }) {
    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.conversation.delete({ where: { id } });
    return { success: true };
  }

  async branch(id: string, messageId: string, title?: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Find message index
    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      throw new NotFoundException('Message not found');
    }

    // Create branch conversation
    const branchConversation = await this.prisma.conversation.create({
      data: {
        title: title || `Branch from ${conversation.title}`,
        model: conversation.model,
        organizationId: conversation.organizationId,
        createdById: conversation.createdById,
      },
    });

    // Copy messages up to and including the branch point
    const messagesToCopy = conversation.messages.slice(0, messageIndex + 1);
    await this.prisma.message.createMany({
      data: messagesToCopy.map(m => ({
        role: m.role,
        content: m.content,
        model: m.model,
        tokens: m.tokens,
        attachments: m.attachments as any,
        artifacts: m.artifacts as any,
        citations: m.citations as any,
        reasoning: m.reasoning,
        tools: m.tools as any,
        conversationId: branchConversation.id,
        createdById: m.createdById,
      })),
    });

    // Create branch record
    await this.prisma.conversationBranch.create({
      data: {
        conversationId: id,
        messageId,
        title: title || `Branch from "${conversation.title}"`,
      },
    });

    return branchConversation;
  }

  async share(id: string) {
    const shareCode = uuidv4().substring(0, 8);
    return this.prisma.conversation.update({
      where: { id },
      data: { shareCode },
    });
  }
}