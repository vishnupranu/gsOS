import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MCPService } from './mcp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('mcp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mcp')
export class MCPController {
  constructor(private mcpService: MCPService) {}

  @Post()
  @ApiOperation({ summary: 'Create MCP connection' })
  async create(
    @Body() data: any,
    @Query('organizationId') organizationId: string,
    @Query('userId') userId: string,
  ) {
    return this.mcpService.create(organizationId, userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List MCP connections' })
  async list(@Query('organizationId') organizationId: string) {
    return this.mcpService.list(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get MCP connection by ID' })
  async getById(@Param('id') id: string) {
    return this.mcpService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update MCP connection' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.mcpService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete MCP connection' })
  async delete(@Param('id') id: string) {
    return this.mcpService.delete(id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sync MCP connection' })
  async sync(@Param('id') id: string) {
    return this.mcpService.sync(id);
  }
}