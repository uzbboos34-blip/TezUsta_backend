import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  jobId?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isSupport?: boolean;

  @ApiProperty({ example: [1, 2] })
  @IsArray()
  userIds: number[];
}
