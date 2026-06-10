import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  async create(
    @Body() body: {
      conversationId: string;
      role: string;
      content: string;
      model?: string;
      attachments?: any[];
      artifacts?: any[];
    },
    @Body('userId') userId: string | null,
  ) {
    return this.messagesService.create(body.conversationId, userId, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message by ID' })
  async getById(@Param('id') id: string) {
    return this.messagesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update message' })
  async update(@Param('id') id: string, @Body() data: { content?: string; artifacts?: any[] }) {
    return this.messagesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete message' })
  async delete(@Param('id') id: string) {
    return this.messagesService.delete(id);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Send message feedback' })
  async feedback(@Param('id') id: string, @Body() body: { isPositive: boolean }) {
    return this.messagesService.feedback(id, body.isPositive);
  }
}