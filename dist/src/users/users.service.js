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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const logs_service_1 = require("../logs/logs.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    logs;
    constructor(prisma, logs) {
        this.prisma = prisma;
        this.logs = logs;
    }
    async findOne(id) {
        const user = await this.prisma.user.findFirst({
            where: { id, isDeleted: false },
            include: {
                acceptedJobs: { where: { isDeleted: false } },
                postedJobs: { where: { isDeleted: false } },
                applicants: { include: { job: true } },
                transactions: { orderBy: { createdAt: 'desc' } },
                paymentRequests: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Foydalanuvchi topilmadi');
        }
        if (user.isBlocked && user.blockedUntil && new Date(user.blockedUntil) < new Date()) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { isBlocked: false, blockReason: null, blockedUntil: null },
            });
            user.isBlocked = false;
            user.blockReason = null;
            user.blockedUntil = null;
        }
        const { password, ...result } = user;
        const finalResult = result;
        if (finalResult.skills)
            finalResult.skills = JSON.parse(finalResult.skills);
        if (finalResult.cats)
            finalResult.cats = JSON.parse(finalResult.cats);
        finalResult.isBlocked = user.isBlocked;
        finalResult.blockReason = user.blockReason;
        finalResult.blockedUntil = user.blockedUntil;
        return finalResult;
    }
    async update(id, dto) {
        const updateData = { ...dto };
        if (updateData.pass) {
            updateData.password = await bcrypt.hash(updateData.pass, 10);
            delete updateData.pass;
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: updateData,
        });
        await this.logs.create({
            userId: id,
            action: 'USER_UPDATE',
            details: dto,
        });
        const { password, ...result } = user;
        const finalResult = result;
        if (finalResult.skills)
            finalResult.skills = JSON.parse(finalResult.skills);
        if (finalResult.cats)
            finalResult.cats = JSON.parse(finalResult.cats);
        return finalResult;
    }
    async remove(id) {
        await this.logs.create({
            userId: id,
            action: 'USER_SOFT_DELETE',
        });
        return this.prisma.user.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
    async createTransaction(userId, data) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, isDeleted: false },
        });
        if (!user)
            throw new common_1.NotFoundException('Foydalanuvchi topilmadi');
        const transaction = await this.prisma.transaction.create({
            data: {
                userId,
                amount: data.amount,
                type: data.type,
                desc: data.desc,
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                balance: {
                    increment: data.type === 'topup' ? data.amount : -data.amount,
                },
            },
        });
        await this.logs.create({
            userId,
            action: 'TRANSACTION_CREATE',
            details: data,
        });
        return transaction;
    }
    async reportWorker(reporterId, targetId, reason) {
        await this.logs.create({
            userId: reporterId,
            targetId: targetId.toString(),
            targetType: 'user',
            action: 'WORKER_REPORT',
            details: { reason },
        });
        return { success: true, message: 'Shikoyat qabul qilindi' };
    }
    async getPayments(userId, page = 1, limit = 8) {
        const requests = await this.prisma.paymentRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return requests;
    }
    async getHistory(userId, page = 1, limit = 8) {
        const skip = (page - 1) * limit;
        const [payments, transactions, totalPayments, totalTransactions] = await Promise.all([
            this.prisma.paymentRequest.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.paymentRequest.count({ where: { userId } }),
            this.prisma.transaction.count({ where: { userId } })
        ]);
        const combined = [
            ...payments.map(p => ({ ...p, hType: 'request' })),
            ...transactions.map(tr => ({ ...tr, hType: 'transaction', status: 'approved' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const pageData = combined.slice(0, limit);
        return {
            data: pageData,
            total: totalPayments + totalTransactions
        };
    }
    async createPaymentRequest(userId, data) {
        const request = await this.prisma.paymentRequest.create({
            data: {
                userId,
                amount: data.amount,
                checkImg: data.checkImg,
                note: data.note,
                status: 'pending'
            },
        });
        await this.logs.create({
            userId,
            action: 'PAYMENT_REQUEST_CREATE',
            details: { amount: data.amount },
        });
        return request;
    }
    async spinWheel(userId) {
        const [user, settings] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: userId } }),
            this.prisma.wheelSetting.findUnique({ where: { id: 1 } })
        ]);
        if (!user)
            throw new common_1.NotFoundException('Foydalanuvchi topilmadi');
        if (!settings)
            throw new Error('O\'yin sozlamalari topilmadi');
        const spinCost = settings.spinCost ?? 50;
        if (user.coins < spinCost) {
            throw new common_1.BadRequestException(`Coinlar yetarli emas (kamida ${spinCost} ta coin kerak)`);
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { coins: { decrement: spinCost } }
        });
        const prizes = JSON.parse(settings.prizesJson);
        const rand = Math.random() * 100;
        let prize = prizes[prizes.length - 1];
        let cumulative = 0;
        for (const p of prizes) {
            cumulative += p.chance;
            if (rand < cumulative) {
                prize = p;
                break;
            }
        }
        if (prize.amount > 0) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { balance: { increment: prize.amount } }
            });
            await this.prisma.transaction.create({
                data: {
                    userId,
                    amount: prize.amount,
                    type: 'topup',
                    desc: `Omadli g'ildirak yutug'i: ${prize.label}`
                }
            });
        }
        await this.logs.create({
            userId,
            action: 'SPIN_WHEEL',
            details: { prize: prize.label },
        });
        return { prize, coinsLeft: user.coins - spinCost };
    }
    async getWheelSettings() {
        const settings = await this.prisma.wheelSetting.findUnique({ where: { id: 1 } });
        if (!settings)
            return null;
        return {
            ...settings,
            prizes: JSON.parse(settings.prizesJson)
        };
    }
    async updateWheelSettings(data) {
        return this.prisma.wheelSetting.upsert({
            where: { id: 1 },
            update: {
                spinCost: data.spinCost,
                prizesJson: JSON.stringify(data.prizes)
            },
            create: {
                id: 1,
                spinCost: data.spinCost,
                prizesJson: JSON.stringify(data.prizes)
            }
        });
    }
    async getCategories() {
        const [cats, workers, jobs] = await Promise.all([
            this.prisma.category.findMany({
                where: { NOT: { status: 'deleted' } },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.user.findMany({ where: { role: 'worker', isDeleted: false }, select: { skills: true } }),
            this.prisma.job.findMany({ where: { status: 'open', isDeleted: false }, select: { cat: true } })
        ]);
        return cats.map((c) => {
            const workerCount = workers.filter((w) => {
                try {
                    const skills = JSON.parse(w.skills || '[]');
                    return skills.includes(c.id);
                }
                catch (e) {
                    return false;
                }
            }).length;
            const jobCount = jobs.filter((j) => j.cat === c.id).length;
            return {
                ...c,
                workerCount,
                jobCount
            };
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logs_service_1.LogsService])
], UsersService);
//# sourceMappingURL=users.service.js.map