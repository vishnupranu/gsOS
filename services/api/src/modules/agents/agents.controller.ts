import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agents')
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new agent' })
  async create(
    @Body() data: any,
    @Query('organizationId') organizationId: string,
    @Query('userId') userId: string,
  ) {
    return this.agentsService.create(organizationId, userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List agents' })
  async list(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.agentsService.list(organizationId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      type,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  async getById(@Param('id') id: string) {
    return this.agentsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update agent' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.agentsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete agent' })
  async delete(@Param('id') id: string) {
    return this.agentsService.delete(id);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run agent' })
  async run(@Param('id') id: string, @Body() input: any) {
    return this.agentsService.run(id, input);
  }
}