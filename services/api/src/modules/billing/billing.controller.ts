import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Get subscription' })
  async getSubscription(@Query('organizationId') organizationId: string) {
    return this.billingService.getSubscription(organizationId);
  }

  @Post('subscription')
  @ApiOperation({ summary: 'Create subscription' })
  async createSubscription(
    @Body() data: { plan: string; stripeCustomerId?: string; stripeSubscriptionId?: string },
    @Query('organizationId') organizationId: string,
  ) {
    return this.billingService.createSubscription(organizationId, data);
  }

  @Patch('subscription/:id')
  @ApiOperation({ summary: 'Update subscription' })
  async updateSubscription(
    @Param('id') id: string,
    @Body() data: { plan?: string; status?: string },
  ) {
    return this.billingService.updateSubscription(id, data);
  }

  @Post('usage')
  @ApiOperation({ summary: 'Record usage' })
  async recordUsage(
    @Body() data: { type: string; quantity: number; cost: number; metadata?: any },
    @Query('organizationId') organizationId: string,
    @Query('userId') userId?: string,
  ) {
    return this.billingService.recordUsage(organizationId, userId || null, data);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get usage records' })
  async getUsage(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.billingService.getUsage(organizationId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type,
    });
  }

  @Get('usage/summary')
  @ApiOperation({ summary: 'Get usage summary' })
  async getUsageSummary(@Query('organizationId') organizationId: string) {
    return this.billingService.getUsageSummary(organizationId);
  }
}