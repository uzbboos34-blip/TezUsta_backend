import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles('client', 'worker')
  @ApiOperation({ summary: 'Create a new job (client only)' })
  create(
    @Request() req: { user: { id: number } },
    @Body() createJobDto: CreateJobDto,
  ) {
    return this.jobsService.create(req.user.id, createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  findAll(
    @Request() req: { user: { id: number; role: string } },
    @Query('cat') filterCat?: string,
    @Query('mine') mine?: string,
  ) {
    return this.jobsService.findAll(req.user.id, req.user.role, filterCat, mine === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by id' })
  findOne(
    @Request() req: { user: { id: number; role: string } },
    @Param('id') id: string,
  ) {
    return this.jobsService.findOne(+id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @Roles('client', 'worker')
  @ApiOperation({ summary: 'Update a job' })
  update(
    @Request() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(+id, req.user.id, updateJobDto);
  }

  @Delete(':id')
  @Roles('client', 'worker')
  @ApiOperation({ summary: 'Delete a job' })
  remove(@Request() req: { user: { id: number } }, @Param('id') id: string) {
    return this.jobsService.remove(+id, req.user.id);
  }

  @Post(':id/apply')
  @Roles('worker')
  @ApiOperation({ summary: 'Apply for a job (worker only)' })
  apply(@Request() req: { user: { id: number } }, @Param('id') id: string) {
    return this.jobsService.apply(+id, req.user.id);
  }

  @Post(':id/accept/:workerId')
  @Roles('client', 'worker')
  @ApiOperation({ summary: 'Accept a worker for a job (client only)' })
  acceptWorker(
    @Request() req: { user: { id: number } },
    @Param('id') id: string,
    @Param('workerId') workerId: string,
  ) {
    return this.jobsService.acceptWorker(+id, req.user.id, +workerId);
  }

  @Post(':id/request-finish')
  @Roles('worker')
  @ApiOperation({ summary: 'Request job finish (worker only)' })
  requestFinish(
    @Request() req: { user: { id: number } },
    @Param('id') id: string,
    @Body('finalPrice') finalPrice?: number,
  ) {
    return this.jobsService.requestFinish(+id, req.user.id, finalPrice);
  }

  @Post(':id/confirm-done')
  @Roles('client', 'worker')
  @ApiOperation({ summary: 'Confirm job done (client only)' })
  confirmDone(@Request() req: { user: { id: number } }, @Param('id') id: string) {
    return this.jobsService.confirmDone(+id, req.user.id);
  }

  @Post(':id/timeout-action')
  @Roles('client', 'worker')
  @ApiOperation({ summary: 'Handle timeout action (client only)' })
  timeoutAction(
    @Request() req: { user: { id: number } },
    @Param('id') id: string,
    @Body('action') action: string,
    @Body('newDate') newDate?: string,
  ) {
    return this.jobsService.handleTimeoutAction(+id, req.user.id, action, newDate);
  }
}
