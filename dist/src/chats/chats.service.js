"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const logs_service_1 = require("../logs/logs.service");
let ChatsService = class ChatsService {
    prisma;
    logs;
    constructor(prisma, logs) {
        this.prisma = prisma;
        this.logs = logs;
    }
    async create(userId, dto) {
        if (!dto.userIds.includes(userId)) {
            throw new common_1.ForbiddenException("Siz bu chatga a'zo emassiz");
        }
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
            if (existingChat)
                return existingChat;
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
    async findAll(userId) {
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
    async findOne(id, userId) {
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
        if (!chat)
            throw new common_1.NotFoundException('Chat topilmadi');
        const isMember = chat.users.some((u) => u.userId === userId);
        if (!isMember)
            throw new common_1.ForbiddenException('Siz bu chatga kirmagansiz');
        return chat;
    }
    async sendMessage(id, userId, dto) {
        const chat = await this.prisma.chat.findUnique({
            where: { id },
            include: { users: true },
        });
        if (!chat)
            throw new common_1.NotFoundException('Chat topilmadi');
        const isMember = chat.users.some((u) => u.userId === userId);
        if (!isMember)
            throw new common_1.ForbiddenException('Siz bu chatga kirmagansiz');
        const message = await this.prisma.message.create({
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
};
exports.ChatsService = ChatsService;
exports.ChatsService = ChatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logs_service_1.LogsService])
], ChatsService);
//# sourceMappingURL=chats.service.js.map