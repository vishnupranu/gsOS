import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  async create(
    @Body() data: any,
    @Query('organizationId') organizationId: string,
    @Query('userId') userId: string,
  ) {
    return this.workflowsService.create(organizationId, userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List workflows' })
  async list(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.workflowsService.list(organizationId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  async getById(@Param('id') id: string) {
    return this.workflowsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.workflowsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  async delete(@Param('id') id: string) {
    return this.workflowsService.delete(id);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run workflow' })
  async run(@Param('id') id: string, @Body() input: any) {
    return this.workflowsService.run(id, input);
  }

  @Get(':id/runs')
  @ApiOperation({ summary: 'Get workflow runs' })
  async getRuns(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.workflowsService.getRuns(id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}