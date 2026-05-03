import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  create(
    @Request() req: { user: { id: number } },
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatsService.create(req.user.id, createChatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats for current user' })
  findAll(@Request() req: { user: { id: number } }) {
    return this.chatsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chat details and messages' })
  findOne(@Request() req: { user: { id: number } }, @Param('id') id: string) {
    return this.chatsService.findOne(id, req.user.id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message to a chat' })
  sendMessage(
    @Request() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatsService.sendMessage(id, req.user.id, dto);
  }
}
