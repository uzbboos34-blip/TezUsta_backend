"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllLogs(page = 1, limit = 8, q) {
        const where = {};
        if (q) {
            where.OR = [
                { user: { name: { contains: q, mode: 'insensitive' } } },
                { user: { phone: { contains: q, mode: 'insensitive' } } },
                { action: { contains: q, mode: 'insensitive' } },
                { details: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.actionLog.findMany({
                where,
                include: {
                    user: { select: { name: true, phone: true, role: true } },
                    job: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.actionLog.count({ where })
        ]);
        return {
            data: data.map((l) => ({
                ...l,
                details: l.details ? JSON.parse(l.details) : null,
            })),
            total
        };
    }
    async getAllUsers(viewerRole, page = 1, limit = 8, q, region, district) {
        const whereRole = viewerRole === 'superadmin' ? {} : { role: { notIn: ['admin', 'superadmin'] } };
        const and = [];
        if (whereRole.role)
            and.push({ role: whereRole.role });
        if (q) {
            and.push({
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { phone: { contains: q, mode: 'insensitive' } },
                    { region: { contains: q, mode: 'insensitive' } },
                    { district: { contains: q, mode: 'insensitive' } },
                ]
            });
        }
        if (region)
            and.push({ region });
        if (district)
            and.push({ district });
        const finalWhere = and.length > 0 ? { AND: and } : whereRole;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: finalWhere,
                include: {
                    _count: { select: { postedJobs: true, acceptedJobs: true } },
                    acceptedJobs: {
                        where: { status: 'done' },
                        select: { price: true }
                    },
                    postedJobs: {
                        select: { price: true, status: true }
                    },
                    transactions: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where: finalWhere })
        ]);
        return {
            data: users.map((u) => {
                const totalEarned = u.acceptedJobs.reduce((sum, job) => sum + (job.price || 0), 0);
                const totalSpent = u.postedJobs?.reduce((sum, job) => sum + (job.status === 'done' ? (job.price || 0) : 0), 0) || 0;
                const { password, ...userWithoutPassword } = u;
                return {
                    ...userWithoutPassword,
                    totalEarned,
                    totalSpent,
                    totalJobs: u._count.acceptedJobs,
                    totalPosted: u._count.postedJobs,
                    skills: u.skills ? JSON.parse(u.skills) : [],
                    cats: u.cats ? JSON.parse(u.cats) : [],
                };
            }),
            total
        };
    }
    async getCategories(q) {
        const where = { NOT: { status: 'deleted' } };
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { proposedName: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [cats, workers, jobs] = await Promise.all([
            this.prisma.category.findMany({
                where,
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
    async createCategory(data) {
        const id = data.id || data.name.toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, '');
        return this.prisma.category.create({
            data: { ...data, id, status: data.status || 'pending' }
        });
    }
    async updateCategory(id, data) {
        return this.prisma.category.update({
            where: { id },
            data: {
                status: 'pending_update',
                proposedName: data.name,
                proposedIcon: data.icon
            }
        });
    }
    async deleteCategory(id) {
        const cat = await this.prisma.category.findUnique({ where: { id } });
        if (cat.status === 'pending_update') {
            return this.prisma.category.update({
                where: { id },
                data: {
                    status: 'active',
                    proposedName: null,
                    proposedIcon: null
                }
            });
        }
        if (cat.status === 'pending') {
            return this.prisma.category.delete({ where: { id } });
        }
        return this.prisma.category.update({
            where: { id },
            data: { status: 'pending_delete' }
        });
    }
    async approveCategory(id) {
        const cat = await this.prisma.category.findUnique({ where: { id } });
        if (cat.status === 'pending_delete') {
            return this.prisma.category.update({
                where: { id },
                data: { status: 'deleted' }
            });
        }
        if (cat.status === 'pending_update') {
            return this.prisma.category.update({
                where: { id },
                data: {
                    status: 'active',
                    name: cat.proposedName || cat.name,
                    icon: cat.proposedIcon || cat.icon,
                    proposedName: null,
                    proposedIcon: null
                }
            });
        }
        return this.prisma.category.update({
            where: { id },
            data: { status: 'active' }
        });
    }
    async getAllJobs(page = 1, limit = 8, q, region, district) {
        const and = [{ isDeleted: false }];
        if (q) {
            and.push({
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { desc: { contains: q, mode: 'insensitive' } },
                    { addr: { contains: q, mode: 'insensitive' } },
                    { client: { name: { contains: q, mode: 'insensitive' } } },
                    { client: { phone: { contains: q, mode: 'insensitive' } } },
                    { client: { region: { contains: q, mode: 'insensitive' } } },
                    { client: { district: { contains: q, mode: 'insensitive' } } },
                ]
            });
        }
        if (region)
            and.push({ client: { region } });
        if (district)
            and.push({ client: { district } });
        const where = { AND: and };
        const [data, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                include: {
                    client: { select: { name: true, phone: true, region: true, district: true } },
                    worker: { select: { name: true, phone: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.job.count({ where })
        ]);
        return { data, total };
    }
    async getUserJobs(userId, page = 1, limit = 8) {
        const [data, total] = await Promise.all([
            this.prisma.job.findMany({
                where: { clientId: userId, isDeleted: false },
                include: {
                    client: { select: { name: true, phone: true } },
                    worker: { select: { name: true, phone: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.job.count({ where: { clientId: userId, isDeleted: false } })
        ]);
        return { data, total };
    }
    async getPaymentRequests(page = 1, limit = 8, q) {
        const where = {};
        if (q) {
            where.OR = [
                { user: { name: { contains: q, mode: 'insensitive' } } },
                { user: { phone: { contains: q, mode: 'insensitive' } } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.paymentRequest.findMany({
                where,
                include: { user: { select: { name: true, phone: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.paymentRequest.count({ where })
        ]);
        return { data, total };
    }
    async approvePayment(id) {
        const req = await this.prisma.paymentRequest.findUnique({ where: { id } });
        if (!req || req.status !== 'pending')
            return null;
        await this.prisma.transaction.create({
            data: {
                userId: req.userId,
                amount: req.amount,
                type: 'topup',
                desc: 'Admin tomonidan tasdiqlandi',
            },
        });
        await this.prisma.user.update({
            where: { id: req.userId },
            data: { balance: { increment: req.amount } },
        });
        return this.prisma.paymentRequest.update({
            where: { id },
            data: { status: 'approved' },
        });
    }
    async rejectPayment(id) {
        return this.prisma.paymentRequest.update({
            where: { id },
            data: { status: 'rejected' },
        });
    }
    async getAllTransactions(page = 1, limit = 8, q) {
        const where = {};
        if (q) {
            where.OR = [
                { user: { name: { contains: q, mode: 'insensitive' } } },
                { user: { phone: { contains: q, mode: 'insensitive' } } },
                { desc: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: {
                    user: { select: { name: true, phone: true, role: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.transaction.count({ where })
        ]);
        return { data, total };
    }
    async blockUser(id, reason, days = 3) {
        const blockedUntil = new Date();
        blockedUntil.setDate(blockedUntil.getDate() + days);
        return this.prisma.user.update({
            where: { id },
            data: { isBlocked: true, blockReason: reason, blockedUntil },
        });
    }
    async unblockUser(id) {
        return this.prisma.user.update({
            where: { id },
            data: { isBlocked: false, blockReason: null, blockedUntil: null },
        });
    }
    async restoreUser(id) {
        return this.prisma.user.update({
            where: { id },
            data: { isDeleted: false, deletedAt: null },
        });
    }
    async createAdmin(data) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                role: 'admin',
            },
        });
    }
    async deleteUser(id) {
        return this.prisma.user.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
    }
    async getSettings() {
        try {
            let s = await this.prisma.settings.findFirst();
            if (!s) {
                s = await this.prisma.settings.create({ data: {} });
            }
            return s;
        }
        catch (e) {
            console.error('getSettings error:', e);
            throw e;
        }
    }
    async updateSettings(data) {
        try {
            const s = await this.getSettings();
            const updateData = {
                cardNum: data.cardNum,
                cardHolder: data.cardHolder,
                commission: data.commission,
            };
            Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
            return await this.prisma.settings.update({
                where: { id: s.id },
                data: updateData,
            });
        }
        catch (e) {
            console.error('updateSettings error:', e);
            throw e;
        }
    }
    async getReport() {
        const [totalTransactions, totalUsers, totalJobs, settings, totalWorkers, totalClients, totalAdmins, activeJobsCount, completedJobs, newUsers, pendingJobs] = await Promise.all([
            this.prisma.transaction.aggregate({ where: { type: 'topup' }, _sum: { amount: true } }),
            this.prisma.user.count({ where: { role: { notIn: ['admin', 'superadmin'] } } }),
            this.prisma.job.count({ where: { isDeleted: false } }),
            this.getSettings(),
            this.prisma.user.count({ where: { role: 'worker' } }),
            this.prisma.user.count({ where: { role: 'client' } }),
            this.prisma.user.count({ where: { role: { in: ['admin', 'superadmin'] } } }),
            this.prisma.job.count({ where: { status: { in: ['open', 'active'] }, isDeleted: false } }),
            this.prisma.job.count({ where: { status: 'done' } }),
            this.prisma.user.count({
                where: {
                    role: { notIn: ['admin', 'superadmin'] },
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
            this.prisma.job.count({ where: { status: 'finishing', isDeleted: false } }),
        ]);
        const doneJobs = await this.prisma.job.findMany({
            where: { status: 'done' },
            select: { price: true }
        });
        const totalJobVolume = doneJobs.reduce((sum, j) => sum + (j.price || 0), 0);
        const platformProfit = doneJobs.length * (settings.commission || 30000);
        return {
            totalTurnover: totalTransactions._sum.amount || 0,
            platformProfit,
            totalJobs,
            totalUsers,
            totalWorkers,
            totalClients,
            totalAdmins,
            totalJobVolume,
            activeJobs: activeJobsCount,
            completedJobs,
            newUsers,
            pendingJobs,
        };
    }
    async getWheelSettings() {
        const s = await this.prisma.wheelSetting.findUnique({ where: { id: 1 } });
        if (!s)
            return null;
        return { ...s, prizes: JSON.parse(s.prizesJson) };
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map