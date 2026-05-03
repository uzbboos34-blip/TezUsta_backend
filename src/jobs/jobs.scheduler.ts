import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from './jobs.service';

@Injectable()
export class JobsScheduler {
  private readonly logger = new Logger(JobsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoConfirm() {
    this.logger.log('🔄 Avtomatik tasdiqlash tekshiruvi boshlandi...');

    // 72 soatdan ko'p vaqt o'tgan 'finishing' holatidagi ishlarni topamiz
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
      } catch (e) {
        this.logger.error(`❌ Ish #${job.id} avtomatik tasdiqlashda xato: ${e.message}`);
      }
    }

    if (jobsToConfirm.length > 0) {
      this.logger.log(`✅ ${jobsToConfirm.length} ta ish avtomatik yakunlandi.`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
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
}
