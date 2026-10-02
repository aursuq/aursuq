import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './create-seller.dto';
import { OwnerGuard } from '../auth/owner.guard';
import { SellerListItemResponse, SellerDetailResponse } from './seller-response.interface';

@ApiTags('sellers')
@Controller('owner/sellers')
@UseGuards(OwnerGuard)
@ApiCookieAuth('aursuq_session')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new seller (Owner only)' })
  @ApiResponse({ status: 201, description: 'Seller created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Not authenticated or unauthorized' })
  @ApiResponse({ status: 409, description: 'Email or store slug already exists' })
  async createSeller(@Body() dto: CreateSellerDto): Promise<SellerDetailResponse> {
    return this.sellersService.createSeller(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all sellers (Owner only)' })
  @ApiResponse({ status: 200, description: 'List of sellers', type: [Object] })
  @ApiResponse({ status: 401, description: 'Not authenticated or unauthorized' })
  async listSellers(): Promise<SellerListItemResponse[]> {
    return this.sellersService.listSellers();
  }

  @Get(':sellerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get seller details by ID (Owner only)' })
  @ApiParam({ name: 'sellerId', description: 'Seller profile ID' })
  @ApiResponse({ status: 200, description: 'Seller details' })
  @ApiResponse({ status: 401, description: 'Not authenticated or unauthorized' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  async getSeller(@Param('sellerId') sellerId: string): Promise<SellerDetailResponse> {
    return this.sellersService.getSellerById(sellerId);
  }
}