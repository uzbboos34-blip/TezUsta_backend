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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsController = void 0;
const common_1 = require("@nestjs/common");
const jobs_service_1 = require("./jobs.service");
const create_job_dto_1 = require("./dto/create-job.dto");
const update_job_dto_1 = require("./dto/update-job.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let JobsController = class JobsController {
    jobsService;
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    create(req, createJobDto) {
        return this.jobsService.create(req.user.id, createJobDto);
    }
    findAll(req, filterCat, mine, q, region, district) {
        return this.jobsService.findAll(req.user.id, req.user.role, {
            cat: filterCat,
            mine: mine === 'true',
            q,
            region,
            district,
        });
    }
    findOne(req, id) {
        return this.jobsService.findOne(+id, req.user.id, req.user.role);
    }
    update(req, id, updateJobDto) {
        return this.jobsService.update(+id, req.user.id, updateJobDto);
    }
    remove(req, id) {
        return this.jobsService.remove(+id, req.user.id);
    }
    apply(req, id) {
        return this.jobsService.apply(+id, req.user.id);
    }
    acceptWorker(req, id, workerId) {
        return this.jobsService.acceptWorker(+id, req.user.id, +workerId);
    }
    requestFinish(req, id, finalPrice) {
        return this.jobsService.requestFinish(+id, req.user.id, finalPrice);
    }
    confirmDone(req, id) {
        return this.jobsService.confirmDone(+id, req.user.id);
    }
    timeoutAction(req, id, action, newDate) {
        return this.jobsService.handleTimeoutAction(+id, req.user.id, action, newDate);
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('client', 'worker'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new job (client only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_job_dto_1.CreateJobDto]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all jobs' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('cat')),
    __param(2, (0, common_1.Query)('mine')),
    __param(3, (0, common_1.Query)('q')),
    __param(4, (0, common_1.Query)('region')),
    __param(5, (0, common_1.Query)('district')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a job by id' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('client', 'worker'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a job' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_job_dto_1.UpdateJobDto]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('client', 'worker'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a job' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/apply'),
    (0, roles_decorator_1.Roles)('worker'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply for a job (worker only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "apply", null);
__decorate([
    (0, common_1.Post)(':id/accept/:workerId'),
    (0, roles_decorator_1.Roles)('client', 'worker'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a worker for a job (client only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "acceptWorker", null);
__decorate([
    (0, common_1.Post)(':id/request-finish'),
    (0, roles_decorator_1.Roles)('worker'),
    (0, swagger_1.ApiOperation)({ summary: 'Request job finish (worker only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('finalPrice')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "requestFinish", null);
__decorate([
    (0, common_1.Post)(':id/confirm-done'),
    (0, roles_decorator_1.Roles)('client', 'worker'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm job done (client only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "confirmDone", null);
__decorate([
    (0, common_1.Post)(':id/timeout-action'),
    (0, roles_decorator_1.Roles)('client', 'worker'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle timeout action (client only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('action')),
    __param(3, (0, common_1.Body)('newDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "timeoutAction", null);
exports.JobsController = JobsController = __decorate([
    (0, swagger_1.ApiTags)('Jobs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
//# sourceMappingURL=jobs.controller.js.map