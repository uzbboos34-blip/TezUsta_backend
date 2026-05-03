import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(req: {
        user: {
            id: number;
        };
    }, createJobDto: CreateJobDto): Promise<{
        id: number;
        phone: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        cat: string;
        icon: string | null;
        price: number;
        addr: string;
        date: string;
        dist: string | null;
        desc: string | null;
        status: string;
        clientRating: number | null;
        clientReviews: number | null;
        lat: number | null;
        lng: number | null;
        dueDate: Date | null;
        requiredWorkers: number;
        clientId: number;
        workerId: number | null;
    }>;
    findAll(req: {
        user: {
            id: number;
            role: string;
        };
    }, filterCat?: string, mine?: string): Promise<any>;
    findOne(req: {
        user: {
            id: number;
            role: string;
        };
    }, id: string): Promise<any>;
    update(req: {
        user: {
            id: number;
        };
    }, id: string, updateJobDto: UpdateJobDto): Promise<{
        id: number;
        phone: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        cat: string;
        icon: string | null;
        price: number;
        addr: string;
        date: string;
        dist: string | null;
        desc: string | null;
        status: string;
        clientRating: number | null;
        clientReviews: number | null;
        lat: number | null;
        lng: number | null;
        dueDate: Date | null;
        requiredWorkers: number;
        clientId: number;
        workerId: number | null;
    }>;
    remove(req: {
        user: {
            id: number;
        };
    }, id: string): Promise<{
        id: number;
        phone: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        cat: string;
        icon: string | null;
        price: number;
        addr: string;
        date: string;
        dist: string | null;
        desc: string | null;
        status: string;
        clientRating: number | null;
        clientReviews: number | null;
        lat: number | null;
        lng: number | null;
        dueDate: Date | null;
        requiredWorkers: number;
        clientId: number;
        workerId: number | null;
    }>;
    apply(req: {
        user: {
            id: number;
        };
    }, id: string): Promise<{
        id: number;
        createdAt: Date;
        status: string;
        workerId: number;
        jobId: number;
    }>;
    acceptWorker(req: {
        user: {
            id: number;
        };
    }, id: string, workerId: string): Promise<any>;
    requestFinish(req: {
        user: {
            id: number;
        };
    }, id: string, finalPrice?: number): Promise<{
        id: number;
        phone: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        cat: string;
        icon: string | null;
        price: number;
        addr: string;
        date: string;
        dist: string | null;
        desc: string | null;
        status: string;
        clientRating: number | null;
        clientReviews: number | null;
        lat: number | null;
        lng: number | null;
        dueDate: Date | null;
        requiredWorkers: number;
        clientId: number;
        workerId: number | null;
    }>;
    confirmDone(req: {
        user: {
            id: number;
        };
    }, id: string): Promise<{
        id: number;
        phone: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        cat: string;
        icon: string | null;
        price: number;
        addr: string;
        date: string;
        dist: string | null;
        desc: string | null;
        status: string;
        clientRating: number | null;
        clientReviews: number | null;
        lat: number | null;
        lng: number | null;
        dueDate: Date | null;
        requiredWorkers: number;
        clientId: number;
        workerId: number | null;
    }>;
    timeoutAction(req: {
        user: {
            id: number;
        };
    }, id: string, action: string, newDate?: string): Promise<{
        success: boolean;
    }>;
}
