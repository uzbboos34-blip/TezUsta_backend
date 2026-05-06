import {
  Controller,
  Get,
  Query,
  Body,
  Patch,
  Request,
  Post,
  Param,
  UseGuards,
  Header,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard as Guard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: { user: { id: number } }) {
    return this.usersService.findOne(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Get('my/payments')
  @ApiOperation({ summary: 'Get my payment history' })
  getMyPayments(@Request() req: { user: { id: number } }, @Query('page') page: string) {
    return this.usersService.getPayments(req.user.id, +page || 1);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Get('my/history')
  @ApiOperation({ summary: 'Get my consolidated transaction history (paginated)' })
  getMyHistory(@Request() req: { user: { id: number } }, @Query('page') page: string, @Query('limit') limit: string) {
    return this.usersService.getHistory(req.user.id, +page || 1, +limit || 100);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @Request() req: { user: { id: number } },
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Post('report/:id')
  @ApiOperation({ summary: 'Report a worker' })
  report(@Request() req: { user: { id: number } }, @Param('id') id: string, @Body('reason') reason: string) {
    return this.usersService.reportWorker(req.user.id, +id, reason);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Post('topup-request')
  @ApiOperation({ summary: 'Submit a payment request (topup)' })
  topupRequest(@Request() req: { user: { id: number } }, @Body() body: any) {
    return this.usersService.createPaymentRequest(req.user.id, body);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Get('wheel-settings')
  @ApiOperation({ summary: 'Get current lucky wheel settings' })
  getWheelSettings() {
    return this.usersService.getWheelSettings();
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Post('spin-wheel')
  @ApiOperation({ summary: 'Spin the lucky wheel using coins' })
  spinWheel(@Request() req: { user: { id: number } }) {
    return this.usersService.spinWheel(req.user.id);
  }

  @Get('categories')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Get all categories' })
  getCategories() {
    return this.usersService.getCategories();
  }
}
