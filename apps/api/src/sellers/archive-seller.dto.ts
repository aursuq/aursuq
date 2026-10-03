import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ArchiveSellerDto {
  @ApiPropertyOptional({ example: 'Violation of platform policies or business closure' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
