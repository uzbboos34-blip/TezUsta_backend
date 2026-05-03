import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('logs')
  @ApiOperation({ summary: 'Get all action logs' })
  getLogs(@Query('page') page: string) {
    return this.adminService.getAllLogs(+page || 1);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  getUsers(@Req() req: any, @Query('page') page: string) {
    return this.adminService.getAllUsers(req.user.role, +page || 1);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all jobs' })
  getJobs(@Query('page') page: string) {
    return this.adminService.getAllJobs(+page || 1);
  }

  @Get('users/:id/jobs')
  @ApiOperation({ summary: 'Get jobs by user id' })
  getUserJobs(@Param('id') id: string, @Query('page') page: string) {
    return this.adminService.getUserJobs(+id, +page || 1);
  }

  @Post('users/:id/block')
  @ApiOperation({ summary: 'Block a user' })
  blockUser(@Param('id') id: string, @Body() body: { reason: string, days?: number }) {
    return this.adminService.blockUser(+id, body.reason, body.days || 3);
  }

  @Post('users/:id/unblock')
  @ApiOperation({ summary: 'Unblock a user' })
  unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(+id);
  }

  @Roles('superadmin')
  @Post('users/admins')
  @ApiOperation({ summary: 'Create a new admin' })
  createAdmin(@Body() body: any) {
    return this.adminService.createAdmin(body);
  }

  @Post('users/:id/restore')
  @ApiOperation({ summary: 'Restore a deleted user' })
  restoreUser(@Param('id') id: string) {
    return this.adminService.restoreUser(+id);
  }

  @Post('users/:id/delete')
  @ApiOperation({ summary: 'Delete a user' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payment requests' })
  getPayments(@Query('page') page: string) {
    return this.adminService.getPaymentRequests(+page || 1);
  }

  @Post('payments/:id/approve')
  @ApiOperation({ summary: 'Approve payment' })
  approvePayment(@Param('id') id: string) {
    return this.adminService.approvePayment(+id);
  }

  @Post('payments/:id/reject')
  @ApiOperation({ summary: 'Reject payment' })
  rejectPayment(@Param('id') id: string) {
    return this.adminService.rejectPayment(+id);
  }

  @Roles('admin', 'superadmin', 'worker', 'client')
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a category suggestion' })
  createCategory(@Body() body: { id: string, name: string, icon: string }, @Req() req: any) {
    const status = req.user.role === 'superadmin' ? 'active' : 'pending';
    return this.adminService.createCategory({ ...body, suggestedBy: req.user.name, status });
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a category (sets to pending)' })
  updateCategory(@Param('id') id: string, @Body() body: { name: string, icon: string }) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Request category deletion' })
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Roles('superadmin')
  @Post('categories/:id/approve')
  @ApiOperation({ summary: 'Approve a category' })
  approveCategory(@Param('id') id: string) {
    return this.adminService.approveCategory(id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions' })
  getTransactions(@Query('page') page: string) {
    return this.adminService.getAllTransactions(+page || 1);
  }

  @Roles('admin', 'superadmin', 'worker', 'client')
  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Roles('superadmin')
  @Patch('settings')
  @ApiOperation({ summary: 'Update platform settings' })
  updateSettings(@Body() body: any) {
    return this.adminService.updateSettings(body);
  }

  @Roles('superadmin')
  @Get('report')
  @ApiOperation({ summary: 'Get platform report' })
  getReport() {
    return this.adminService.getReport();
  }

  @Get('wheel-settings')
  @ApiOperation({ summary: 'Get lucky wheel settings' })
  getWheelSettings() {
    return this.adminService.getWheelSettings();
  }

  @Roles('superadmin')
  @Patch('wheel-settings')
  @ApiOperation({ summary: 'Update lucky wheel settings' })
  updateWheelSettings(@Body() body: any) {
    return this.adminService.updateWheelSettings(body);
  }
}
