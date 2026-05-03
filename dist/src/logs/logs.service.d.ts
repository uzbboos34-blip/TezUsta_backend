import { PrismaService } from '../prisma/prisma.service';
export declare class LogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId?: number;
        targetId?: string;
        targetType?: string;
        action: string;
        details?: any;
        jobId?: number;
    }): Promise<{
        id: number;
        createdAt: Date;
        targetId: string | null;
        targetType: string | null;
        action: string;
        details: string | null;
        userId: number | null;
        jobId: number | null;
    }>;
    findAll(): Promise<{
        details: any;
        user: {
            phone: string;
            name: string | null;
            role: string;
        } | null;
        job: {
            id: number;
            phone: string;
            isDeleted: boolean;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            cat: string;
            icon: string | null;
            price: number;
            addr: string;
            date: string;
            dist: string | null;
            desc: string | null;
            status: string;
            clientRating: number | null;
            clientReviews: number | null;
            lat: number | null;
            lng: number | null;
            dueDate: Date | null;
            requiredWorkers: number;
            clientId: number;
            workerId: number | null;
        } | null;
        id: number;
        createdAt: Date;
        targetId: string | null;
        targetType: string | null;
        action: string;
        userId: number | null;
        jobId: number | null;
    }[]>;
}
