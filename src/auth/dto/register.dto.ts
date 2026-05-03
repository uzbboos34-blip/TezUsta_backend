import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Abdulloh Karimov' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '+998901234567' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  pass: string;

  @ApiProperty({ example: 'worker', description: 'worker or client' })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({ example: 'toshkent_shahar', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 'Yunusobod', required: false })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ example: ['santexnik'], required: false })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ example: ['santexnik'], required: false })
  @IsOptional()
  cats?: string[];
}
