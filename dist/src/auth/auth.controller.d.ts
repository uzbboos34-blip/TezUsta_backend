import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            phone: any;
            role: any;
            skills: any;
            cats: any;
            balance: any;
            isBlocked: any;
            blockReason: any;
            blockedUntil: any;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string | null;
            phone: string;
            role: string;
            skills: any;
            cats: any;
            balance: number;
        };
    }>;
}
