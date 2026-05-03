import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Abdullayev Qodir', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'secret123', required: false })
  @IsOptional()
  @IsString()
  pass?: string;

  @ApiProperty({ example: 'toshkent_shahar', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 'Yunusobod', required: false })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ example: '["santexnik","elektrik"]', required: false })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiProperty({ example: '["santexnik"]', required: false })
  @IsOptional()
  @IsString()
  cats?: string;
}
