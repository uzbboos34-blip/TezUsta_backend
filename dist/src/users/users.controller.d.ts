import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: {
        user: {
            id: number;
        };
    }): Promise<any>;
    getMyPayments(req: {
        user: {
            id: number;
        };
    }, page: string): Promise<any>;
    getMyHistory(req: {
        user: {
            id: number;
        };
    }, page: string, limit: string): Promise<{
        data: any[];
        total: any;
    }>;
    updateProfile(req: {
        user: {
            id: number;
        };
    }, dto: UpdateUserDto): Promise<any>;
    report(req: {
        user: {
            id: number;
        };
    }, id: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
    topupRequest(req: {
        user: {
            id: number;
        };
    }, body: any): Promise<any>;
    getWheelSettings(): Promise<any>;
    spinWheel(req: {
        user: {
            id: number;
        };
    }): Promise<{
        prize: any;
        coinsLeft: number;
    }>;
    getCategories(): Promise<any>;
}
