/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogsService } from '../logs/logs.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logs: LogsService,
  ) { }

  async findOne(id: number) {
    const user = await (this.prisma as any).user.findFirst({
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
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Auto-unblock check
    if (user.isBlocked && user.blockedUntil && new Date(user.blockedUntil) < new Date()) {
      await (this.prisma as any).user.update({
        where: { id: user.id },
        data: { isBlocked: false, blockReason: null, blockedUntil: null },
      });
      user.isBlocked = false;
      user.blockReason = null;
      user.blockedUntil = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    const finalResult: any = result;
    if (finalResult.skills) finalResult.skills = JSON.parse(finalResult.skills as string);
    if (finalResult.cats) finalResult.cats = JSON.parse(finalResult.cats as string);
    
    // Explicitly ensure block fields are present for frontend
    finalResult.isBlocked = user.isBlocked;
    finalResult.blockReason = user.blockReason;
    finalResult.blockedUntil = user.blockedUntil;

    return finalResult;
  }

  async update(id: number, dto: UpdateUserDto) {
    const updateData: any = { ...dto };
    if (updateData.pass) {
      updateData.password = await bcrypt.hash(updateData.pass, 10);
      delete updateData.pass;
    }

    const user = await (this.prisma as any).user.update({
      where: { id },
      data: updateData,
    });

    await this.logs.create({
      userId: id,
      action: 'USER_UPDATE',
      details: dto,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    const finalResult: any = result;
    if (finalResult.skills) finalResult.skills = JSON.parse(finalResult.skills as string);
    if (finalResult.cats) finalResult.cats = JSON.parse(finalResult.cats as string);

    return finalResult;
  }

  async remove(id: number) {
    await this.logs.create({
      userId: id,
      action: 'USER_SOFT_DELETE',
    });

    return (this.prisma as any).user.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async createTransaction(
    userId: number,
    data: { amount: number; type: string; desc?: string },
  ) {
    const user = await (this.prisma as any).user.findFirst({
      where: { id: userId, isDeleted: false },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const transaction = await (this.prisma as any).transaction.create({
      data: {
        userId,
        amount: data.amount,
        type: data.type,
        desc: data.desc,
      },
    });

    // Update user balance
    await (this.prisma as any).user.update({
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

  async reportWorker(reporterId: number, targetId: number, reason: string) {
    await this.logs.create({
      userId: reporterId,
      targetId: targetId.toString(),
      targetType: 'user',
      action: 'WORKER_REPORT',
      details: { reason },
    });
    return { success: true, message: 'Shikoyat qabul qilindi' };
  }

  async getPayments(userId: number, page: number = 1, limit: number = 8) {
    const requests = await (this.prisma as any).paymentRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return requests;
  }

  async getHistory(userId: number, page: number = 1, limit: number = 8) {
    const skip = (page - 1) * limit;

    // Get payment requests
    const [payments, transactions, totalPayments, totalTransactions]: any = await Promise.all([
      (this.prisma as any).paymentRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).paymentRequest.count({ where: { userId } }),
      (this.prisma as any).transaction.count({ where: { userId } })
    ]);

    // Combine and sort
    const combined = [
      ...(payments as any[]).map(p => ({ ...p, hType: 'request' })),
      ...(transactions as any[]).map(tr => ({ ...tr, hType: 'transaction', status: 'approved' }))
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Take only the requested amount for the current page
    const pageData = combined.slice(0, limit);

    return {
      data: pageData,
      total: totalPayments + totalTransactions
    };
  }

  async createPaymentRequest(userId: number, data: { amount: number; checkImg: string; note?: string }) {
    const request = await (this.prisma as any).paymentRequest.create({
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

  async spinWheel(userId: number) {
    const [user, settings] = await Promise.all([
      (this.prisma as any).user.findUnique({ where: { id: userId } }),
      (this.prisma as any).wheelSetting.findUnique({ where: { id: 1 } })
    ]);

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    if (!settings) throw new Error('O\'yin sozlamalari topilmadi');

    const spinCost = settings.spinCost ?? 50;
    if (user.coins < spinCost) {
      throw new BadRequestException(`Coinlar yetarli emas (kamida ${spinCost} ta coin kerak)`);
    }

    // Deduct coins
    await (this.prisma as any).user.update({
      where: { id: userId },
      data: { coins: { decrement: spinCost } }
    });

    const prizes = JSON.parse(settings.prizesJson);
    const rand = Math.random() * 100;
    let prize = prizes[prizes.length - 1]; // Default to last one (usually "Try Again")

    let cumulative = 0;
    for (const p of prizes) {
      cumulative += p.chance;
      if (rand < cumulative) {
        prize = p;
        break;
      }
    }

    if (prize.amount > 0) {
      await (this.prisma as any).user.update({
        where: { id: userId },
        data: { balance: { increment: prize.amount } }
      });

      // Add transaction
      await (this.prisma as any).transaction.create({
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
    const settings = await (this.prisma as any).wheelSetting.findUnique({ where: { id: 1 } });
    if (!settings) return null;
    return {
      ...settings,
      prizes: JSON.parse(settings.prizesJson)
    };
  }

  async updateWheelSettings(data: { spinCost: number, prizes: any[] }) {
    return (this.prisma as any).wheelSetting.upsert({
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
      (this.prisma as any).category.findMany({ 
        where: { NOT: { status: 'deleted' } },
        orderBy: { createdAt: 'desc' } 
      }),
      (this.prisma as any).user.findMany({ where: { role: 'worker', isDeleted: false }, select: { skills: true } }),
      (this.prisma as any).job.findMany({ where: { status: 'open', isDeleted: false }, select: { cat: true } })
    ]);

    return cats.map((c: any) => {
      const workerCount = workers.filter((w: any) => {
        try {
          const skills = JSON.parse(w.skills || '[]');
          return skills.includes(c.id);
        } catch (e) { return false; }
      }).length;

      const jobCount = jobs.filter((j: any) => j.cat === c.id).length;

      return {
        ...c,
        workerCount,
        jobCount
      };
    });
  }
}
