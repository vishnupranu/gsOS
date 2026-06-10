import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  async create(
    @Body() body: { title?: string; model?: string },
    @Query('organizationId') organizationId: string,
    @Query('userId') userId: string,
  ) {
    return this.conversationsService.create(organizationId, userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List conversations' })
  async list(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('archived') archived?: string,
  ) {
    return this.conversationsService.list(organizationId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      archived: archived === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  async getById(@Param('id') id: string) {
    return this.conversationsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update conversation' })
  async update(
    @Param('id') id: string,
    @Body() data: { title?: string; isPinned?: boolean; isArchived?: boolean; tags?: string[] },
  ) {
    return this.conversationsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete conversation' })
  async delete(@Param('id') id: string) {
    return this.conversationsService.delete(id);
  }

  @Post(':id/branch')
  @ApiOperation({ summary: 'Branch a conversation' })
  async branch(
    @Param('id') id: string,
    @Body() body: { messageId: string; title?: string },
  ) {
    return this.conversationsService.branch(id, body.messageId, body.title);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a conversation' })
  async share(@Param('id') id: string) {
    return this.conversationsService.share(id);
  }
}