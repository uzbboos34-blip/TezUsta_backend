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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const logs_service_1 = require("../logs/logs.service");
let JobsService = class JobsService {
    prisma;
    logs;
    constructor(prisma, logs) {
        this.prisma = prisma;
        this.logs = logs;
    }
    async create(clientId, dto) {
        console.log('Creating job for client:', clientId, 'with data:', JSON.stringify(dto, null, 2));
        try {
            const client = await this.prisma.user.findUnique({
                where: { id: clientId },
            });
            let dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;
            if (!dueDate) {
                dueDate = new Date();
                dueDate.setHours(dueDate.getHours() + 24);
            }
            const job = await this.prisma.job.create({
                data: {
                    title: dto.title,
                    cat: dto.cat,
                    price: dto.price,
                    addr: dto.addr,
                    phone: dto.phone,
                    date: dto.date,
                    region: dto.region,
                    dist: dto.dist,
                    desc: dto.desc || '—',
                    lat: dto.lat,
                    lng: dto.lng,
                    clientId,
                    clientRating: client?.rating || 5.0,
                    clientReviews: 0,
                    status: 'open',
                    requiredWorkers: dto.requiredWorkers || 1,
                    dueDate,
                },
            });
            await this.logs.create({
                userId: clientId,
                jobId: job.id,
                action: 'JOB_CREATE',
                details: dto,
            });
            return job;
        }
        catch (error) {
            console.error('Error creating job:', error);
            throw error;
        }
    }
    async findAll(userId, role, options) {
        const { cat, mine, q, region, district } = options;
        const userSelect = {
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                rating: true,
                totalRatings: true,
                region: true,
                district: true,
            },
        };
        if (role === 'client' || mine) {
            const where = { clientId: userId, isDeleted: false };
            if (q) {
                where.OR = [
                    { title: { contains: q, mode: 'insensitive' } },
                    { desc: { contains: q, mode: 'insensitive' } },
                    { addr: { contains: q, mode: 'insensitive' } },
                ];
            }
            const jobs = await this.prisma.job.findMany({
                where,
                include: {
                    applicants: true,
                    worker: userSelect,
                },
                orderBy: { createdAt: 'desc' },
            });
            return jobs.map((j) => ({
                ...j,
                acceptedWorkersCount: j.applicants?.length || 0,
            }));
        }
        const and = [
            { status: 'open' },
            { isDeleted: false },
            { applicants: { none: { workerId: userId } } }
        ];
        if (cat && cat !== 'all') {
            and.push({ cat });
        }
        if (q) {
            and.push({
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { desc: { contains: q, mode: 'insensitive' } },
                    { addr: { contains: q, mode: 'insensitive' } },
                ]
            });
        }
        try {
            if (region) {
                and.push({ region: region });
            }
            if (district) {
                and.push({ dist: district });
            }
            console.log('Worker job search where:', JSON.stringify({ AND: and }, null, 2));
            const jobs = await this.prisma.job.findMany({
                where: { AND: and },
                include: {
                    client: userSelect,
                    applicants: { select: { id: true } }
                },
                orderBy: { createdAt: 'desc' },
            });
            return jobs.map((j) => ({
                ...j,
                acceptedWorkersCount: j.applicants?.length || 0,
            }));
        }
        catch (err) {
            console.error('Job findMany error:', err);
            return [];
        }
    }
    async findOne(id, userId, role) {
        const job = await this.prisma.job.findFirst({
            where: { id, isDeleted: false },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        role: true,
                        rating: true,
                    },
                },
                worker: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        role: true,
                        rating: true,
                        totalRatings: true,
                    },
                },
                applicants: {
                    include: {
                        worker: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                                role: true,
                                rating: true,
                                totalRatings: true,
                            },
                        },
                    },
                },
            },
        });
        if (!job)
            throw new common_1.NotFoundException('Ish topilmadi');
        const result = { ...job };
        const settings = (await this.prisma.settings.findFirst()) || {
            commission: 30000,
        };
        result.hasApplied = job.applicants.some((a) => a.workerId === userId);
        result.isMine = job.clientId === userId;
        result.acceptedWorkersCount = job.applicants?.length || 0;
        result.commission = settings.commission;
        return result;
    }
    async update(id, clientId, dto) {
        const job = await this.prisma.job.findFirst({
            where: { id, clientId, isDeleted: false },
        });
        if (!job)
            throw new common_1.NotFoundException('Ish topilmadi');
        const updated = await this.prisma.job.update({
            where: { id },
            data: dto,
        });
        await this.logs.create({
            userId: clientId,
            jobId: id,
            action: 'JOB_UPDATE',
            details: dto,
        });
        return updated;
    }
    async remove(id, clientId) {
        const job = await this.prisma.job.findFirst({
            where: { id, clientId, isDeleted: false },
        });
        if (!job)
            throw new common_1.NotFoundException('Ish topilmadi');
        await this.logs.create({
            userId: clientId,
            jobId: id,
            action: 'JOB_DELETE',
            details: { title: job.title },
        });
        return this.prisma.job.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    async apply(id, workerId) {
        const job = await this.prisma.job.findFirst({
            where: { id, isDeleted: false },
            include: { applicants: true },
        });
        if (!job || job.status !== 'open')
            throw new common_1.BadRequestException('Ishga yozilish mumkin emas');
        if (job.applicants.some((a) => a.workerId === workerId)) {
            throw new common_1.BadRequestException('Siz allaqachon bu ishni olgansiz');
        }
        const worker = await this.prisma.user.findUnique({
            where: { id: workerId },
        });
        if (worker.isBlocked &&
            worker.blockedUntil &&
            new Date(worker.blockedUntil) > new Date()) {
            const remaining = Math.ceil((new Date(worker.blockedUntil).getTime() -
                new Date().getTime()) /
                (1000 * 60 * 60 * 24));
            throw new common_1.BadRequestException(`Siz bloklangansiz. Blok tugashiga ${remaining} kun qoldi. Sabab: ${worker.blockReason}`);
        }
        const settings = (await this.prisma.settings.findFirst()) || {
            commission: 30000,
        };
        const minBal = settings.commission;
        if (!worker || worker.balance < minBal) {
            throw new common_1.BadRequestException('Balansingiz yetarli emas');
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const currentJob = await tx.job.findFirst({
                    where: { id, status: 'open', isDeleted: false },
                    include: { applicants: true },
                });
                if (!currentJob) {
                    throw new common_1.BadRequestException('Ishga yozilish mumkin emas yoki limit to\'lgan');
                }
                const applicantCount = currentJob.applicants.length;
                if (applicantCount >= currentJob.requiredWorkers) {
                    throw new common_1.BadRequestException('Ushbu ish uchun yetarli usta yig\'ilgan');
                }
                await tx.user.update({
                    where: { id: workerId },
                    data: { balance: { decrement: minBal } },
                });
                await tx.transaction.create({
                    data: {
                        userId: workerId,
                        amount: minBal,
                        type: 'commission',
                        desc: `"${currentJob.title}" ishi uchun to'lov`,
                    },
                });
                await tx.actionLog.create({
                    data: {
                        userId: workerId,
                        jobId: id,
                        action: 'JOB_TAKE',
                        details: JSON.stringify({ fee: minBal }),
                    }
                });
                const newApplicant = await tx.jobApplicant.create({
                    data: {
                        jobId: id,
                        workerId,
                        status: 'accepted',
                    },
                });
                const updateData = {};
                if (applicantCount === 0) {
                    updateData.workerId = workerId;
                }
                if (applicantCount + 1 >= currentJob.requiredWorkers) {
                    updateData.status = 'active';
                }
                if (Object.keys(updateData).length > 0) {
                    await tx.job.update({
                        where: { id },
                        data: updateData,
                    });
                }
                return newApplicant;
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.BadRequestException('Siz allaqachon bu ishni olgansiz');
            }
            throw e;
        }
    }
    async acceptWorker(id, clientId, workerId) {
        const job = await this.prisma.job.findFirst({
            where: { id, clientId, isDeleted: false },
        });
        if (!job)
            throw new common_1.NotFoundException('Ish topilmadi');
        const updated = await this.prisma.job.update({
            where: { id },
            data: {
                workerId: workerId,
                status: 'active',
            },
        });
        await this.logs.create({
            userId: clientId,
            jobId: id,
            action: 'JOB_ACCEPT_WORKER',
            details: { workerId },
        });
        return updated;
    }
    async requestFinish(id, workerId, finalPrice) {
        const job = await this.prisma.job.findFirst({
            where: {
                id,
                status: 'active',
                isDeleted: false,
                OR: [
                    { workerId },
                    { applicants: { some: { workerId } } }
                ]
            },
        });
        if (!job)
            throw new common_1.NotFoundException('Ish topilmadi yoki sizga biriktirilmagan');
        return this.prisma.job.update({
            where: { id },
            data: {
                status: 'finishing',
                price: finalPrice !== undefined ? finalPrice : job.price
            },
        });
    }
    async confirmDone(id, clientId) {
        const job = await this.prisma.job.findFirst({
            where: { id, clientId, status: 'finishing', isDeleted: false },
            include: { applicants: true },
        });
        if (!job)
            throw new common_1.NotFoundException('Ish topilmadi yoki tasdiqlash uchun tayyor emas');
        const workerIds = Array.from(new Set(job.applicants.map((a) => a.workerId)));
        if (workerIds.length === 0 && job.workerId) {
            workerIds.push(job.workerId);
        }
        const workerCount = workerIds.length || 1;
        const perWorkerPrice = Math.floor(job.price / workerCount);
        return await this.prisma.$transaction(async (tx) => {
            const updatedJob = await tx.job.update({
                where: { id },
                data: { status: 'done' },
            });
            for (const wId of workerIds) {
                await tx.user.update({
                    where: { id: wId },
                    data: {
                        totalEarned: { increment: perWorkerPrice },
                        totalJobs: { increment: 1 },
                        coins: { increment: 10 },
                    },
                });
            }
            await tx.user.update({
                where: { id: job.clientId },
                data: { totalSpent: { increment: job.price } },
            });
            await tx.actionLog.create({
                data: {
                    userId: clientId,
                    jobId: id,
                    action: 'JOB_CONFIRM_DONE',
                    details: JSON.stringify({ workerCount, perWorkerPrice }),
                },
            });
            return updatedJob;
        });
    }
    async handleJobTimeouts() {
        const now = new Date();
        await this.prisma.job.updateMany({
            where: {
                status: 'open',
                dueDate: { lt: now },
                isDeleted: false,
            },
            data: {
                status: 'timeout_action_required',
            },
        });
    }
    async handleTimeoutAction(id, clientId, action, newDate) {
        const job = await this.prisma.job.findFirst({
            where: { id, clientId, status: 'timeout_action_required', isDeleted: false },
            include: { applicants: true }
        });
        if (!job)
            throw new common_1.NotFoundException('Ish topilmadi yoki vaqti o\'tmagan');
        if (action === 'delete') {
            await this.prisma.job.update({
                where: { id },
                data: { isDeleted: true }
            });
            return { success: true };
        }
        if (action === 'extend') {
            let dueDate = newDate ? new Date(newDate) : new Date();
            if (!newDate)
                dueDate.setHours(dueDate.getHours() + 24);
            await this.prisma.job.update({
                where: { id },
                data: {
                    status: 'open',
                    dueDate,
                }
            });
            return { success: true };
        }
        if (action === 'accept_current') {
            if (job.applicants.length === 0) {
                throw new common_1.BadRequestException('Bitta ham usta topilmagan');
            }
            await this.prisma.job.update({
                where: { id },
                data: {
                    status: 'active',
                    requiredWorkers: job.applicants.length,
                    workerId: job.workerId || job.applicants[0].workerId,
                }
            });
            return { success: true };
        }
        throw new common_1.BadRequestException('Noto\'g\'ri amal');
    }
};
exports.JobsService = JobsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "handleJobTimeouts", null);
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logs_service_1.LogsService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map