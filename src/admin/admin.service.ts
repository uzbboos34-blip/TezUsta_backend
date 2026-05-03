import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllLogs(page: number = 1, limit: number = 8) {
    const [data, total] = await Promise.all([
      this.prisma.actionLog.findMany({
        include: {
          user: { select: { name: true, phone: true, role: true } },
          job: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.actionLog.count()
    ]);
    return {
      data: data.map((l) => ({
        ...l,
        details: l.details ? JSON.parse(l.details) : null,
      })),
      total
    };
  }

  async getAllUsers(viewerRole: string, page: number = 1, limit: number = 8) {
    const where = viewerRole === 'superadmin' ? {} : { role: { notIn: ['admin', 'superadmin'] } };
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
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
      this.prisma.user.count({ where })
    ]);
    
    return {
      data: users.map((u) => {
        const totalEarned = (u as any).acceptedJobs.reduce((sum: number, job: any) => sum + (job.price || 0), 0);
        const totalSpent = (u as any).postedJobs?.reduce((sum: number, job: any) => sum + (job.status === 'done' ? (job.price || 0) : 0), 0) || 0;
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

  async getCategories() {
    const [cats, workers, jobs] = await Promise.all([
      (this.prisma as any).category.findMany({ 
        where: { NOT: { status: 'deleted' } },
        orderBy: { createdAt: 'desc' } 
      }),
      this.prisma.user.findMany({ where: { role: 'worker', isDeleted: false }, select: { skills: true } }),
      this.prisma.job.findMany({ where: { status: 'open', isDeleted: false }, select: { cat: true } })
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

  async createCategory(data: { id?: string, name: string, icon: string, suggestedBy: string, status?: string }) {
    const id = data.id || data.name.toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, '');
    return (this.prisma as any).category.create({
      data: { ...data, id, status: data.status || 'pending' }
    });
  }

  async updateCategory(id: string, data: { name: string, icon: string }) {
    // Updates set the category to pending_update with proposed data
    return (this.prisma as any).category.update({
      where: { id },
      data: { 
        status: 'pending_update',
        proposedName: data.name,
        proposedIcon: data.icon
      }
    });
  }

  async deleteCategory(id: string) {
    const cat = await (this.prisma as any).category.findUnique({ where: { id } });
    if (cat.status === 'pending_update') {
      // Revert the update request (i.e. "reject update")
      return (this.prisma as any).category.update({
        where: { id },
        data: { 
          status: 'active',
          proposedName: null,
          proposedIcon: null
        }
      });
    }
    if (cat.status === 'pending') {
      // Reject new category suggestion completely
      return (this.prisma as any).category.delete({ where: { id } });
    }
    // For already active categories, mark as pending_delete
    return (this.prisma as any).category.update({
      where: { id },
      data: { status: 'pending_delete' }
    });
  }

  async approveCategory(id: string) {
    const cat = await (this.prisma as any).category.findUnique({ where: { id } });
    if (cat.status === 'pending_delete') {
       return (this.prisma as any).category.update({
         where: { id },
         data: { status: 'deleted' }
       });
    }
    if (cat.status === 'pending_update') {
       return (this.prisma as any).category.update({
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
    return (this.prisma as any).category.update({
      where: { id },
      data: { status: 'active' }
    });
  }

  async getAllJobs(page: number = 1, limit: number = 8) {
    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        include: {
          client: { select: { name: true, phone: true } },
          worker: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count()
    ]);
    return { data, total };
  }

  async getUserJobs(userId: number, page: number = 1, limit: number = 8) {
    const [data, total] = await Promise.all([
      (this.prisma as any).job.findMany({
        where: { clientId: userId, isDeleted: false },
        include: {
          client: { select: { name: true, phone: true } },
          worker: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma as any).job.count({ where: { clientId: userId, isDeleted: false } })
    ]);
    return { data, total };
  }

  async getPaymentRequests(page: number = 1, limit: number = 8) {
    const [data, total] = await Promise.all([
      (this.prisma as any).paymentRequest.findMany({
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma as any).paymentRequest.count()
    ]);
    return { data, total };
  }

  async approvePayment(id: number) {
    const req = await (this.prisma as any).paymentRequest.findUnique({ where: { id } });
    if (!req || req.status !== 'pending') return null;
    
    // Create transaction and update balance (using usersService logic would be better but let's do it here for now)
    await (this.prisma as any).transaction.create({
      data: {
        userId: req.userId,
        amount: req.amount,
        type: 'topup',
        desc: 'Admin tomonidan tasdiqlandi',
      },
    });

    await (this.prisma.user as any).update({
      where: { id: req.userId },
      data: { balance: { increment: req.amount } },
    });

    return (this.prisma as any).paymentRequest.update({
      where: { id },
      data: { status: 'approved' },
    });
  }

  async rejectPayment(id: number) {
    return (this.prisma as any).paymentRequest.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  async getAllTransactions(page: number = 1, limit: number = 8) {
    const [data, total] = await Promise.all([
      (this.prisma as any).transaction.findMany({
        include: {
          user: { select: { name: true, phone: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma as any).transaction.count()
    ]);
    return { data, total };
  }

  async blockUser(id: number, reason: string, days: number = 3) {
    const blockedUntil = new Date();
    blockedUntil.setDate(blockedUntil.getDate() + days);
    return (this.prisma.user as any).update({
      where: { id },
      data: { isBlocked: true, blockReason: reason, blockedUntil },
    });
  }

  async unblockUser(id: number) {
    return (this.prisma.user as any).update({
      where: { id },
      data: { isBlocked: false, blockReason: null, blockedUntil: null },
    });
  }

  async restoreUser(id: number) {
    return (this.prisma.user as any).update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async createAdmin(data: any) {
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

  async deleteUser(id: number) {
    return (this.prisma.user as any).update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async getSettings() {
    try {
      let s = await (this.prisma as any).settings.findFirst();
      if (!s) {
        s = await (this.prisma as any).settings.create({ data: {} });
      }
      return s;
    } catch (e) {
      console.error('getSettings error:', e);
      throw e;
    }
  }

  async updateSettings(data: any) {
    try {
      const s = await this.getSettings();
      // Only keep the fields we want to update to avoid issues with ID or updatedAt
      const updateData: Record<string, any> = {
        cardNum: data.cardNum,
        cardHolder: data.cardHolder,
        commission: data.commission,
      };
      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      return await (this.prisma as any).settings.update({
        where: { id: s.id },
        data: updateData,
      });
    } catch (e) {
      console.error('updateSettings error:', e);
      throw e;
    }
  }

  async getReport() {
    const [totalTransactions, totalUsers, totalJobs, settings, totalWorkers, totalClients, totalAdmins, activeJobsCount, completedJobs, newUsers, pendingJobs] = await Promise.all([
      (this.prisma as any).transaction.aggregate({ where: { type: 'topup' }, _sum: { amount: true } }),
      this.prisma.user.count({ where: { role: { notIn: ['admin', 'superadmin'] } } }),
      this.prisma.job.count({ where: { isDeleted: false } }),
      this.getSettings(),
      this.prisma.user.count({ where: { role: 'worker' } }),
      this.prisma.user.count({ where: { role: 'client' } }),
      this.prisma.user.count({ where: { role: { in: ['admin', 'superadmin'] } } }),
      // Active jobs (open or active)
      this.prisma.job.count({ where: { status: { in: ['open', 'active'] }, isDeleted: false } }),
      this.prisma.job.count({ where: { status: 'done' } }),
      // New users registered in last 7 days
      this.prisma.user.count({
        where: {
          role: { notIn: ['admin', 'superadmin'] },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      // Pending jobs (finishing status - worker done, waiting for client)
      this.prisma.job.count({ where: { status: 'finishing', isDeleted: false } }),
    ]);

    const doneJobs = await this.prisma.job.findMany({
      where: { status: 'done' },
      select: { price: true }
    });

    const totalJobVolume = doneJobs.reduce((sum, j) => sum + (j.price || 0), 0);
    const platformProfit = doneJobs.length * (settings.commission || 30000);

    return {
      totalTurnover:  totalTransactions._sum.amount || 0,
      platformProfit,
      totalJobs,
      totalUsers,
      totalWorkers,
      totalClients,
      totalAdmins,
      totalJobVolume,
      activeJobs:     activeJobsCount,
      completedJobs,
      newUsers,
      pendingJobs,
    };
  }

  async getWheelSettings() {
    const s = await (this.prisma as any).wheelSetting.findUnique({ where: { id: 1 } });
    if (!s) return null;
    return { ...s, prizes: JSON.parse(s.prizesJson) };
  }

  async updateWheelSettings(data: any) {
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
}
