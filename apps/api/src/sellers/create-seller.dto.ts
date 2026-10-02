import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSellerDto {
  @ApiProperty({ example: 'seller@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Acme Corporation Ltd.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  legalName: string;

  @ApiProperty({ example: 'Acme Store' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  businessName: string;

  @ApiProperty({ example: 'IL123456789' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  taxRegistrationNumber: string;

  @ApiProperty({ example: '+972-50-1234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone: string;

  @ApiProperty({ example: '123 Main St, Tel Aviv, Israel' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  businessAddress: string;

  @ApiProperty({ example: 'Acme Store' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  storeName: string;

  @ApiProperty({ example: 'acme-store' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'storeSlug must be lowercase, URL-safe, and contain only letters, numbers, and hyphens (no spaces)',
  })
  storeSlug: string;
}