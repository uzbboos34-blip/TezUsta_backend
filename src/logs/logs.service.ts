import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId?: number;
    targetId?: string;
    targetType?: string;
    action: string;
    details?: any;
    jobId?: number;
  }) {
    return this.prisma.actionLog.create({
      data: {
        userId: data.userId,
        targetId: data.targetId,
        targetType: data.targetType,
        action: data.action,
        details: data.details ? JSON.stringify(data.details) : null,
        jobId: data.jobId,
      },
    });
  }

  async findAll() {
    const logs = await this.prisma.actionLog.findMany({
      include: {
        user: { select: { name: true, phone: true, role: true } },
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));
  }
}
