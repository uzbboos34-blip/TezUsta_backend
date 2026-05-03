import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from './jobs.service';
export declare class JobsScheduler {
    private readonly prisma;
    private readonly jobsService;
    private readonly logger;
    constructor(prisma: PrismaService, jobsService: JobsService);
    handleAutoConfirm(): Promise<void>;
    handleCleanupOldOpenJobs(): Promise<void>;
}
