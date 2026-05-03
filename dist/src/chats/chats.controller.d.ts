import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatsController {
    private readonly chatsService;
    constructor(chatsService: ChatsService);
    create(req: {
        user: {
            id: number;
        };
    }, createChatDto: CreateChatDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jobId: number | null;
        isSupport: boolean;
    }>;
    findAll(req: {
        user: {
            id: number;
        };
    }): Promise<({
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
    findOne(req: {
        user: {
            id: number;
        };
    }, id: string): Promise<{
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
    sendMessage(req: {
        user: {
            id: number;
        };
    }, id: string, dto: SendMessageDto): Promise<any>;
}
