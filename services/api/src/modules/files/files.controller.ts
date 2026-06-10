import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create file record' })
  async create(
    @Body() data: any,
    @Query('organizationId') organizationId: string,
    @Query('userId') userId: string,
  ) {
    return this.filesService.create(organizationId, userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List files' })
  async list(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.filesService.list(organizationId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  async getById(@Param('id') id: string) {
    return this.filesService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  async delete(@Param('id') id: string) {
    return this.filesService.delete(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get storage stats' })
  async getStorageStats(@Query('organizationId') organizationId: string) {
    return this.filesService.getStorageStats(organizationId);
  }
}