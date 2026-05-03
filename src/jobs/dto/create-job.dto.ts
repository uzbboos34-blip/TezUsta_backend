import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ example: "Rakovina o'rnatish" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'santexnik' })
  @IsNotEmpty()
  @IsString()
  cat: string;

  @ApiProperty({ example: '🚿', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 150000 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Yunusobod, 14-uy' })
  @IsNotEmpty()
  @IsString()
  addr: string;

  @ApiProperty({ example: '+998901234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Bugun, 10:00' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ example: '2.4 km', required: false })
  @IsOptional()
  @IsString()
  dist?: string;

  @ApiProperty({
    example: "Rakovina o'rnatish va suv chiqarish tizimini ulash.",
  })
  @IsNotEmpty()
  @IsString()
  desc: string;

  @ApiProperty({ example: 41.2995, required: false })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ example: 69.2401, required: false })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiProperty({ example: 2, required: false, description: 'Kerakli ustalar soni' })
  @IsOptional()
  @IsNumber()
  requiredWorkers?: number;

  @ApiProperty({ example: '2026-05-03T16:30:00.000Z', required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;
}
