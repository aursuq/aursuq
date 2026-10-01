import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { OwnerDashboardService, DashboardSummaryMetrics } from './owner-dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('owner-dashboard')
@Controller('owner/dashboard')
@UseGuards(AuthGuard)
@ApiCookieAuth('aursuq_session')
export class OwnerDashboardController {
  constructor(private readonly ownerDashboardService: OwnerDashboardService) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get owner dashboard summary metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard summary metrics' })
  @ApiResponse({ status: 401, description: 'Not authenticated or unauthorized' })
  async getSummary(): Promise<DashboardSummaryMetrics> {
    return this.ownerDashboardService.getSummary();
  }
}