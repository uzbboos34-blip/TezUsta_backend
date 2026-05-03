import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: LogsService,
  ) {}

  async create(userId: number, dto: CreateChatDto) {
    if (!dto.userIds.includes(userId)) {
      throw new ForbiddenException("Siz bu chatga a'zo emassiz");
    }

    // Check if chat already exists for this job and these exact users
    if (dto.jobId) {
      const existingChat = await this.prisma.chat.findFirst({
        where: {
          jobId: dto.jobId,
          users: {
            every: {
              userId: { in: dto.userIds },
            },
          },
        },
      });
      if (existingChat) return existingChat;
    }

    const chat = await this.prisma.chat.create({
      data: {
        jobId: dto.jobId,
        isSupport: dto.isSupport,
        users: {
          create: dto.userIds.map((id) => ({ userId: id })),
        },
      },
    });

    await this.logs.create({
      userId,
      targetId: chat.id,
      targetType: 'chat',
      action: 'CHAT_CREATE',
      details: { jobId: dto.jobId, isSupport: dto.isSupport },
    });

    return chat;
  }

  async findAll(userId: number) {
    return this.prisma.chat.findMany({
      where: {
        users: { some: { userId } },
      },
      include: {
        users: {
          include: {
            user: {
              select: { id: true, name: true, phone: true, role: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: { id: true, name: true, phone: true, role: true },
            },
          },
        },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!chat) throw new NotFoundException('Chat topilmadi');

    const isMember = chat.users.some((u) => u.userId === userId);
    if (!isMember) throw new ForbiddenException('Siz bu chatga kirmagansiz');

    return chat;
  }

  async sendMessage(id: string, userId: number, dto: SendMessageDto) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!chat) throw new NotFoundException('Chat topilmadi');

    const isMember = chat.users.some((u) => u.userId === userId);
    if (!isMember) throw new ForbiddenException('Siz bu chatga kirmagansiz');

    const message = await (this.prisma as any).message.create({
      data: {
        chatId: id,
        senderId: userId,
        text: dto.text,
      },
    });

    await this.logs.create({
      userId,
      targetId: id,
      targetType: 'message',
      action: 'MESSAGE_SEND',
      details: { text: dto.text.substring(0, 50) },
    });

    return message;
  }
}
