import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  async create(
    @Body() data: any,
    @Query('organizationId') organizationId: string,
    @Query('userId') userId: string,
  ) {
    return this.documentsService.create(organizationId, userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  async list(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.documentsService.list(organizationId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      type,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  async getById(@Param('id') id: string) {
    return this.documentsService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  async delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents' })
  async search(
    @Query('organizationId') organizationId: string,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    return this.documentsService.search(organizationId, query, limit ? parseInt(limit) : undefined);
  }
}