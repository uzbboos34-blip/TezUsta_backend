import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
