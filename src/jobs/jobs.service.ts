/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: LogsService,
  ) { }

  async create(clientId: number, dto: CreateJobDto) {
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
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async findAll(
    userId: number,
    role: string,
    options: {
      cat?: string;
      mine?: boolean;
      q?: string;
      region?: string;
      district?: string;
    },
  ) {
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
      const where: any = { clientId: userId, isDeleted: false };
      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { desc: { contains: q, mode: 'insensitive' } },
          { addr: { contains: q, mode: 'insensitive' } },
        ];
      }
      
      const jobs = await (this.prisma as any).job.findMany({
        where,
        include: {
          applicants: true,
          worker: userSelect,
        },
        orderBy: { createdAt: 'desc' },
      });
      return jobs.map((j: any) => ({
        ...j,
        acceptedWorkersCount: j.applicants?.length || 0,
      }));
    }

    // For worker searching for new jobs
    const and: any[] = [
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
      return jobs.map((j: any) => ({
        ...j,
        acceptedWorkersCount: j.applicants?.length || 0,
      }));
    } catch (err) {
      console.error('Job findMany error:', err);
      // Fallback to empty list instead of crashing
      return [];
    }
  }

  async findOne(id: number, userId: number, role: string) {
    const job = await (this.prisma as any).job.findFirst({
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

    if (!job) throw new NotFoundException('Ish topilmadi');

    const result: any = { ...job };
    const settings = (await (this.prisma as any).settings.findFirst()) || {
      commission: 30000,
    };
    result.hasApplied = job.applicants.some(
      (a: { workerId: number }) => a.workerId === userId,
    );
    result.isMine = job.clientId === userId;
    result.acceptedWorkersCount = job.applicants?.length || 0;
    result.commission = settings.commission;

    return result;
  }

  async update(id: number, clientId: number, dto: UpdateJobDto) {
    const job = await this.prisma.job.findFirst({
      where: { id, clientId, isDeleted: false },
    });
    if (!job) throw new NotFoundException('Ish topilmadi');

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

  async remove(id: number, clientId: number) {
    const job = await this.prisma.job.findFirst({
      where: { id, clientId, isDeleted: false },
    });
    if (!job) throw new NotFoundException('Ish topilmadi');

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

  async apply(id: number, workerId: number) {
    const job = await this.prisma.job.findFirst({
      where: { id, isDeleted: false },
      include: { applicants: true },
    });
    if (!job || job.status !== 'open')
      throw new BadRequestException('Ishga yozilish mumkin emas');

    if (job.applicants.some((a) => a.workerId === workerId)) {
      throw new BadRequestException('Siz allaqachon bu ishni olgansiz');
    }

    const worker: any = await this.prisma.user.findUnique({
      where: { id: workerId },
    });

    if (
      worker.isBlocked &&
      worker.blockedUntil &&
      new Date(worker.blockedUntil as Date) > new Date()
    ) {
      const remaining = Math.ceil(
        (new Date(worker.blockedUntil as Date).getTime() -
          new Date().getTime()) /
        (1000 * 60 * 60 * 24),
      );
      throw new BadRequestException(
        `Siz bloklangansiz. Blok tugashiga ${remaining} kun qoldi. Sabab: ${worker.blockReason}`,
      );
    }

    const settings = (await (this.prisma as any).settings.findFirst()) || {
      commission: 30000,
    };
    const minBal = settings.commission;
    if (!worker || worker.balance < minBal) {
      throw new BadRequestException('Balansingiz yetarli emas');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Re-check inside transaction
        const currentJob = await tx.job.findFirst({
          where: { id, status: 'open', isDeleted: false },
          include: { applicants: true },
        });
        
        if (!currentJob) {
          throw new BadRequestException('Ishga yozilish mumkin emas yoki limit to\'lgan');
        }

        const applicantCount = currentJob.applicants.length;
        if (applicantCount >= currentJob.requiredWorkers) {
          throw new BadRequestException('Ushbu ish uchun yetarli usta yig\'ilgan');
        }

        // Deduct balance
        await tx.user.update({
          where: { id: workerId },
          data: { balance: { decrement: minBal } },
        });

        // Create transaction record
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

        const updateData: any = {};
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
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException('Siz allaqachon bu ishni olgansiz');
      }
      throw e;
    }
  }

  async acceptWorker(id: number, clientId: number, workerId: number) {
    const job = await this.prisma.job.findFirst({
      where: { id, clientId, isDeleted: false },
    });
    if (!job) throw new NotFoundException('Ish topilmadi');

    const updated = await (this.prisma as any).job.update({
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

  async requestFinish(id: number, workerId: number, finalPrice?: number) {
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
    if (!job) throw new NotFoundException('Ish topilmadi yoki sizga biriktirilmagan');

    return this.prisma.job.update({
      where: { id },
      data: {
        status: 'finishing',
        price: finalPrice !== undefined ? finalPrice : job.price
      },
    });
  }

  async confirmDone(id: number, clientId: number) {
    const job = await this.prisma.job.findFirst({
      where: { id, clientId, status: 'finishing', isDeleted: false },
      include: { applicants: true },
    });
    if (!job)
      throw new NotFoundException(
        'Ish topilmadi yoki tasdiqlash uchun tayyor emas',
      );

    // Get unique worker IDs from applicants
    const workerIds = Array.from(new Set(job.applicants.map((a) => a.workerId)));
    if (workerIds.length === 0 && job.workerId) {
      workerIds.push(job.workerId);
    }

    const workerCount = workerIds.length || 1;
    const perWorkerPrice = Math.floor(job.price / workerCount);

    return await this.prisma.$transaction(async (tx) => {
      // Update job status
      const updatedJob = await tx.job.update({
        where: { id },
        data: { status: 'done' },
      });

      // Update each worker's earnings
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

      // Update client's spending
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

  @Cron(CronExpression.EVERY_MINUTE)
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

  async handleTimeoutAction(id: number, clientId: number, action: string, newDate?: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, clientId, status: 'timeout_action_required', isDeleted: false },
      include: { applicants: true }
    });

    if (!job) throw new NotFoundException('Ish topilmadi yoki vaqti o\'tmagan');

    if (action === 'delete') {
      await this.prisma.job.update({
        where: { id },
        data: { isDeleted: true }
      });
      return { success: true };
    }

    if (action === 'extend') {
      let dueDate = newDate ? new Date(newDate) : new Date();
      if (!newDate) dueDate.setHours(dueDate.getHours() + 24);

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
        throw new BadRequestException('Bitta ham usta topilmagan');
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

    throw new BadRequestException('Noto\'g\'ri amal');
  }
}
