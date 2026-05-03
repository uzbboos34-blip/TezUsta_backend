"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const logs_service_1 = require("../logs/logs.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    logs;
    constructor(prisma, jwtService, logs) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.logs = logs;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });
        if (existing) {
            throw new common_1.BadRequestException("Bunday raqam allaqachon ro'yxatdan o'tgan");
        }
        const hashedPassword = await bcrypt.hash(dto.pass, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                phone: dto.phone,
                password: hashedPassword,
                role: dto.role,
                region: dto.region,
                district: dto.district,
                skills: dto.skills ? JSON.stringify(dto.skills) : null,
                cats: dto.cats ? JSON.stringify(dto.cats) : null,
            },
        });
        await this.logs.create({
            userId: user.id,
            action: 'USER_REGISTER',
            details: { role: dto.role },
        });
        const payload = { sub: user.id, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                skills: user.skills ? JSON.parse(user.skills) : [],
                cats: user.cats ? JSON.parse(user.cats) : [],
                balance: user.balance,
            },
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });
        const u = user;
        if (!u || u.isDeleted) {
            throw new common_1.UnauthorizedException("Raqam yoki parol noto'g'ri");
        }
        if (u.isBlocked && u.blockedUntil && new Date(u.blockedUntil) < new Date()) {
            await this.prisma.user.update({
                where: { id: u.id },
                data: { isBlocked: false, blockReason: null, blockedUntil: null },
            });
            u.isBlocked = false;
        }
        const isMatch = await bcrypt.compare(dto.pass, u.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException("Raqam yoki parol noto'g'ri");
        }
        await this.logs.create({
            userId: u.id,
            action: 'USER_LOGIN',
        });
        const payload = { sub: u.id, role: u.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: u.id,
                name: u.name,
                phone: u.phone,
                role: u.role,
                skills: u.skills ? JSON.parse(u.skills) : [],
                cats: u.cats ? JSON.parse(u.cats) : [],
                balance: u.balance,
                isBlocked: u.isBlocked,
                blockReason: u.blockReason,
                blockedUntil: u.blockedUntil,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        logs_service_1.LogsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map