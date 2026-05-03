import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getLogs(page: string): Promise<{
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
    getUsers(req: any, page: string): Promise<{
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
    getJobs(page: string): Promise<{
        data: ({
            worker: {
                phone: string;
                name: string | null;
            } | null;
            client: {
                phone: string;
                name: string | null;
            };
        } & {
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
        })[];
        total: number;
    }>;
    getUserJobs(id: string, page: string): Promise<{
        data: any;
        total: any;
    }>;
    blockUser(id: string, body: {
        reason: string;
        days?: number;
    }): Promise<any>;
    unblockUser(id: string): Promise<any>;
    createAdmin(body: any): Promise<{
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
    restoreUser(id: string): Promise<any>;
    deleteUser(id: string): Promise<any>;
    getPayments(page: string): Promise<{
        data: any;
        total: any;
    }>;
    approvePayment(id: string): Promise<any>;
    rejectPayment(id: string): Promise<any>;
    getCategories(): Promise<any>;
    createCategory(body: {
        id: string;
        name: string;
        icon: string;
    }, req: any): Promise<any>;
    updateCategory(id: string, body: {
        name: string;
        icon: string;
    }): Promise<any>;
    deleteCategory(id: string): Promise<any>;
    approveCategory(id: string): Promise<any>;
    getTransactions(page: string): Promise<{
        data: any;
        total: any;
    }>;
    getSettings(): Promise<any>;
    updateSettings(body: any): Promise<any>;
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
    updateWheelSettings(body: any): Promise<any>;
}
