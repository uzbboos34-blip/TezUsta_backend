import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAllLogs(page?: number, limit?: number, q?: string): Promise<{
        data: {
            details: any;
            user: {
                phone: string;
                name: string | null;
                role: string;
            } | null;
            job: {
                id: number;
                phone: string;
                region: string | null;
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
        }[];
        total: number;
    }>;
    getAllUsers(viewerRole: string, page?: number, limit?: number, q?: string, region?: string, district?: string): Promise<{
        data: {
            totalEarned: any;
            totalSpent: any;
            totalJobs: number;
            totalPosted: number;
            skills: any;
            cats: any;
            acceptedJobs: {
                price: number;
            }[];
            postedJobs: {
                price: number;
                status: string;
            }[];
            transactions: {
                id: number;
                createdAt: Date;
                desc: string | null;
                type: string;
                userId: number;
                amount: number;
            }[];
            _count: {
                acceptedJobs: number;
                postedJobs: number;
            };
            id: number;
            phone: string;
            name: string | null;
            role: string;
            balance: number;
            rating: number;
            totalRatings: number;
            coins: number;
            region: string | null;
            district: string | null;
            experience: number | null;
            isDeleted: boolean;
            deletedAt: Date | null;
            isBlocked: boolean;
            blockReason: string | null;
            blockedUntil: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    getCategories(q?: string): Promise<any>;
    createCategory(data: {
        id?: string;
        name: string;
        icon: string;
        suggestedBy: string;
        status?: string;
    }): Promise<any>;
    updateCategory(id: string, data: {
        name: string;
        icon: string;
    }): Promise<any>;
    deleteCategory(id: string): Promise<any>;
    approveCategory(id: string): Promise<any>;
    getAllJobs(page?: number, limit?: number, q?: string, region?: string, district?: string): Promise<{
        data: ({
            worker: {
                phone: string;
                name: string | null;
            } | null;
            client: {
                phone: string;
                name: string | null;
                region: string | null;
                district: string | null;
            };
        } & {
            id: number;
            phone: string;
            region: string | null;
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
        })[];
        total: number;
    }>;
    getUserJobs(userId: number, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
    }>;
    getPaymentRequests(page?: number, limit?: number, q?: string): Promise<{
        data: any;
        total: any;
    }>;
    approvePayment(id: number): Promise<any>;
    rejectPayment(id: number): Promise<any>;
    getAllTransactions(page?: number, limit?: number, q?: string): Promise<{
        data: any;
        total: any;
    }>;
    blockUser(id: number, reason: string, days?: number): Promise<any>;
    unblockUser(id: number): Promise<any>;
    restoreUser(id: number): Promise<any>;
    createAdmin(data: any): Promise<{
        id: number;
        phone: string;
        password: string;
        name: string | null;
        role: string;
        balance: number;
        rating: number;
        totalRatings: number;
        totalJobs: number;
        totalEarned: number;
        totalSpent: number;
        coins: number;
        region: string | null;
        district: string | null;
        skills: string | null;
        cats: string | null;
        experience: number | null;
        isDeleted: boolean;
        deletedAt: Date | null;
        isBlocked: boolean;
        blockReason: string | null;
        blockedUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: number): Promise<any>;
    getSettings(): Promise<any>;
    updateSettings(data: any): Promise<any>;
    getReport(): Promise<{
        totalTurnover: any;
        platformProfit: number;
        totalJobs: number;
        totalUsers: number;
        totalWorkers: number;
        totalClients: number;
        totalAdmins: number;
        totalJobVolume: number;
        activeJobs: number;
        completedJobs: number;
        newUsers: number;
        pendingJobs: number;
    }>;
    getWheelSettings(): Promise<any>;
    updateWheelSettings(data: any): Promise<any>;
}
