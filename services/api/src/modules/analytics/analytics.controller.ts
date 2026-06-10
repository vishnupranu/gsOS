import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track an event' })
  async trackEvent(
    @Body() data: { name: string; properties?: Record<string, any>; sessionId?: string },
    @Query('userId') userId?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.analyticsService.trackEvent({ ...data, userId, organizationId });
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard data' })
  async getDashboardData(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getDashboardData(organizationId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('user-activity')
  @ApiOperation({ summary: 'Get user activity' })
  async getUserActivity(
    @Query('organizationId') organizationId: string,
    @Query('userId') userId: string,
  ) {
    return this.analyticsService.getUserActivity(organizationId, userId);
  }

  @Get('retention')
  @ApiOperation({ summary: 'Get retention metrics' })
  async getRetentionMetrics(@Query('organizationId') organizationId: string) {
    return this.analyticsService.getRetentionMetrics(organizationId);
  }
}