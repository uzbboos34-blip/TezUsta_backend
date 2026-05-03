import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { LogsService } from '../logs/logs.service';
export declare class ChatsService {
    private readonly prisma;
    private readonly logs;
    constructor(prisma: PrismaService, logs: LogsService);
    create(userId: number, dto: CreateChatDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jobId: number | null;
        isSupport: boolean;
    }>;
    findAll(userId: number): Promise<({
        messages: {
            id: number;
            createdAt: Date;
            text: string;
            chatId: string;
            senderId: number;
        }[];
        users: ({
            user: {
                id: number;
                phone: string;
                name: string | null;
                role: string;
            };
        } & {
            id: number;
            createdAt: Date;
            userId: number;
            chatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jobId: number | null;
        isSupport: boolean;
    })[]>;
    findOne(id: string, userId: number): Promise<{
        messages: {
            id: number;
            createdAt: Date;
            text: string;
            chatId: string;
            senderId: number;
        }[];
        users: ({
            user: {
                id: number;
                phone: string;
                name: string | null;
                role: string;
            };
        } & {
            id: number;
            createdAt: Date;
            userId: number;
            chatId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jobId: number | null;
        isSupport: boolean;
    }>;
    sendMessage(id: string, userId: number, dto: SendMessageDto): Promise<any>;
}
