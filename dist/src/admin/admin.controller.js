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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getLogs(page) {
        return this.adminService.getAllLogs(+page || 1);
    }
    getUsers(req, page) {
        return this.adminService.getAllUsers(req.user.role, +page || 1);
    }
    getJobs(page) {
        return this.adminService.getAllJobs(+page || 1);
    }
    getUserJobs(id, page) {
        return this.adminService.getUserJobs(+id, +page || 1);
    }
    blockUser(id, body) {
        return this.adminService.blockUser(+id, body.reason, body.days || 3);
    }
    unblockUser(id) {
        return this.adminService.unblockUser(+id);
    }
    createAdmin(body) {
        return this.adminService.createAdmin(body);
    }
    restoreUser(id) {
        return this.adminService.restoreUser(+id);
    }
    deleteUser(id) {
        return this.adminService.deleteUser(+id);
    }
    getPayments(page) {
        return this.adminService.getPaymentRequests(+page || 1);
    }
    approvePayment(id) {
        return this.adminService.approvePayment(+id);
    }
    rejectPayment(id) {
        return this.adminService.rejectPayment(+id);
    }
    getCategories() {
        return this.adminService.getCategories();
    }
    createCategory(body, req) {
        const status = req.user.role === 'superadmin' ? 'active' : 'pending';
        return this.adminService.createCategory({ ...body, suggestedBy: req.user.name, status });
    }
    updateCategory(id, body) {
        return this.adminService.updateCategory(id, body);
    }
    deleteCategory(id) {
        return this.adminService.deleteCategory(id);
    }
    approveCategory(id) {
        return this.adminService.approveCategory(id);
    }
    getTransactions(page) {
        return this.adminService.getAllTransactions(+page || 1);
    }
    getSettings() {
        return this.adminService.getSettings();
    }
    updateSettings(body) {
        return this.adminService.updateSettings(body);
    }
    getReport() {
        return this.adminService.getReport();
    }
    getWheelSettings() {
        return this.adminService.getWheelSettings();
    }
    updateWheelSettings(body) {
        return this.adminService.updateWheelSettings(body);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all action logs' }),
    __param(0, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all jobs' }),
    __param(0, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getJobs", null);
__decorate([
    (0, common_1.Get)('users/:id/jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get jobs by user id' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserJobs", null);
__decorate([
    (0, common_1.Post)('users/:id/block'),
    (0, swagger_1.ApiOperation)({ summary: 'Block a user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Post)('users/:id/unblock'),
    (0, swagger_1.ApiOperation)({ summary: 'Unblock a user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "unblockUser", null);
__decorate([
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, common_1.Post)('users/admins'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new admin' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)('users/:id/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a deleted user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "restoreUser", null);
__decorate([
    (0, common_1.Post)('users/:id/delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payment requests' }),
    __param(0, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('payments/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve payment' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approvePayment", null);
__decorate([
    (0, common_1.Post)('payments/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject payment' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectPayment", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'superadmin', 'worker', 'client'),
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a category suggestion' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a category (sets to pending)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Request category deletion' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteCategory", null);
__decorate([
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, common_1.Post)('categories/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a category' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveCategory", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions' }),
    __param(0, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTransactions", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'superadmin', 'worker', 'client'),
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, common_1.Patch)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update platform settings' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSettings", null);
__decorate([
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, common_1.Get)('report'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform report' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getReport", null);
__decorate([
    (0, common_1.Get)('wheel-settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lucky wheel settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getWheelSettings", null);
__decorate([
    (0, roles_decorator_1.Roles)('superadmin'),
    (0, common_1.Patch)('wheel-settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update lucky wheel settings' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateWheelSettings", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map