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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJobDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateJobDto {
    title;
    cat;
    icon;
    price;
    addr;
    phone;
    date;
    dist;
    desc;
    lat;
    lng;
    requiredWorkers;
    dueDate;
}
exports.CreateJobDto = CreateJobDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Rakovina o'rnatish" }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'santexnik' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "cat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '🚿', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150000 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yunusobod, 14-uy' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "addr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+998901234567' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bugun, 10:00' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2.4 km', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "dist", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Rakovina o'rnatish va suv chiqarish tizimini ulash.",
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "desc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 41.2995, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 69.2401, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, required: false, description: 'Kerakli ustalar soni' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "requiredWorkers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-03T16:30:00.000Z', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "dueDate", void 0);
//# sourceMappingURL=create-job.dto.js.map