import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogsService } from '../logs/logs.service';
export declare class UsersService {
    private readonly prisma;
    private readonly logs;
    constructor(prisma: PrismaService, logs: LogsService);
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateUserDto): Promise<any>;
    remove(id: number): Promise<any>;
    createTransaction(userId: number, data: {
        amount: number;
        type: string;
        desc?: string;
    }): Promise<any>;
    reportWorker(reporterId: number, targetId: number, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPayments(userId: number, page?: number, limit?: number): Promise<any>;
    getHistory(userId: number, page?: number, limit?: number): Promise<{
        data: any[];
        total: any;
    }>;
    createPaymentRequest(userId: number, data: {
        amount: number;
        checkImg: string;
        note?: string;
    }): Promise<any>;
    spinWheel(userId: number): Promise<{
        prize: any;
        coinsLeft: number;
    }>;
    getWheelSettings(): Promise<any>;
    updateWheelSettings(data: {
        spinCost: number;
        prizes: any[];
    }): Promise<any>;
    getCategories(): Promise<any>;
}
