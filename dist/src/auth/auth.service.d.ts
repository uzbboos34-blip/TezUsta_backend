import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LogsService } from '../logs/logs.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logs;
    constructor(prisma: PrismaService, jwtService: JwtService, logs: LogsService);
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
}
