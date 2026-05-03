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
var JobsScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const jobs_service_1 = require("./jobs.service");
let JobsScheduler = JobsScheduler_1 = class JobsScheduler {
    prisma;
    jobsService;
    logger = new common_1.Logger(JobsScheduler_1.name);
    constructor(prisma, jobsService) {
        this.prisma = prisma;
        this.jobsService = jobsService;
    }
    async handleAutoConfirm() {
        this.logger.log('🔄 Avtomatik tasdiqlash tekshiruvi boshlandi...');
        const threeDaysAgo = new Date();
        threeDaysAgo.setHours(threeDaysAgo.getHours() - 72);
        const jobsToConfirm = await this.prisma.job.findMany({
            where: {
                status: 'finishing',
                updatedAt: { lte: threeDaysAgo },
                isDeleted: false,
            },
        });
        for (const job of jobsToConfirm) {
            try {
                this.logger.log(`🤖 Ish #${job.id} avtomatik tasdiqlanmoqda (Mijoz ID: ${job.clientId})`);
                await this.jobsService.confirmDone(job.id, job.clientId);
            }
            catch (e) {
                this.logger.error(`❌ Ish #${job.id} avtomatik tasdiqlashda xato: ${e.message}`);
            }
        }
        if (jobsToConfirm.length > 0) {
            this.logger.log(`✅ ${jobsToConfirm.length} ta ish avtomatik yakunlandi.`);
        }
    }
    async handleCleanupOldOpenJobs() {
        this.logger.log('🧹 Eski ochiq ishlarni tozalash...');
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const result = await this.prisma.job.updateMany({
            where: {
                status: 'open',
                createdAt: { lte: sevenDaysAgo },
            },
            data: { isDeleted: true },
        });
        if (result.count > 0) {
            this.logger.log(`✅ ${result.count} ta eski ochiq ish o'chirildi.`);
        }
    }
};
exports.JobsScheduler = JobsScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsScheduler.prototype, "handleAutoConfirm", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsScheduler.prototype, "handleCleanupOldOpenJobs", null);
exports.JobsScheduler = JobsScheduler = JobsScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jobs_service_1.JobsService])
], JobsScheduler);
//# sourceMappingURL=jobs.scheduler.js.map