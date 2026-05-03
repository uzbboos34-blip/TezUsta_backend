"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt.hash('123456', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const u1 = await prisma.user.upsert({
        where: { phone: '+998901234567' },
        update: {},
        create: {
            name: 'Abdulloh Karimov',
            phone: '+998901234567',
            password,
            role: 'worker',
            region: 'toshkent_shahar',
            district: 'Yunusobod',
            skills: JSON.stringify(['santexnik', 'elektrik']),
            rating: 4.7,
            totalRatings: 56,
            totalJobs: 32,
            totalEarned: 4800000,
        },
    });
    const u2 = await prisma.user.upsert({
        where: { phone: '+998912345678' },
        update: {},
        create: {
            name: 'Sarvar Xoliqov',
            phone: '+998912345678',
            password,
            role: 'worker',
            region: 'toshkent_shahar',
            district: 'Chilonzor',
            skills: JSON.stringify(['kunlik', 'quruvchi']),
            balance: 30000,
            rating: 4.2,
            totalRatings: 18,
            totalJobs: 14,
            totalEarned: 1950000,
        },
    });
    const u4 = await prisma.user.upsert({
        where: { phone: '+998901112222' },
        update: {},
        create: {
            name: 'Lola Mirzayeva',
            phone: '+998901112222',
            password,
            role: 'client',
            region: 'toshkent_shahar',
            district: 'Yunusobod',
            cats: JSON.stringify(['santexnik', 'elektrik']),
        },
    });
    const admin = await prisma.user.upsert({
        where: { phone: '+998901000000' },
        update: {},
        create: {
            name: 'Admin Adminov',
            phone: '+998901000000',
            password: adminPassword,
            role: 'admin',
        },
    });
    const superAdminPassword = await bcrypt.hash('super123', 10);
    await prisma.user.upsert({
        where: { phone: '+998909999999' },
        update: {},
        create: {
            name: 'Super Admin',
            phone: '+998909999999',
            password: superAdminPassword,
            role: 'superadmin',
        },
    });
    await prisma.job.create({
        data: {
            title: "Rakovina o'rnatish",
            cat: 'santexnik',
            icon: '🚿',
            price: 150000,
            addr: 'Yunusobod, 14-uy',
            phone: '+998901234567',
            date: 'Bugun, 10:00',
            dist: '2.4 km',
            desc: "Rakovina o'rnatish va suv chiqarish tizimini ulash. Jihozlar bor.",
            clientId: u4.id,
            status: 'open',
            clientRating: 4.8,
            clientReviews: 23,
            lat: 41.2995,
            lng: 69.2401,
        },
    });
    const cats = [
        { id: 'santexnik', name: 'Santexnik', icon: '🚿' },
        { id: 'elektrik', name: 'Elektrik', icon: '⚡' },
        { id: 'kunlik', name: 'Kunlik ish', icon: '🏗️' },
        { id: 'usta', name: 'Usta', icon: '🔧' },
        { id: 'quruvchi', name: 'Quruvchi', icon: '🏠' },
        { id: 'gaz', name: 'Gaz ustasi', icon: '🔥' },
        { id: 'konditsioner', name: 'Konditsioner', icon: '❄️' },
        { id: 'boyoq', name: "Bo'yoqchi", icon: '🎨' },
    ];
    for (const c of cats) {
        await prisma.category.upsert({
            where: { id: c.id },
            update: {},
            create: { id: c.id, name: c.name, icon: c.icon, status: 'active' },
        });
    }
    const defaultPrizes = [
        { label: '10,000 UZS', amount: 10000, chance: 5 },
        { label: '5,000 UZS', amount: 5000, chance: 10 },
        { label: '2,000 UZS', amount: 2000, chance: 20 },
        { label: '1,000 UZS', amount: 1000, chance: 30 },
        { label: 'Omad kelasi safar!', amount: 0, chance: 35 }
    ];
    await prisma.wheelSetting.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            spinCost: 50,
            prizesJson: JSON.stringify(defaultPrizes)
        }
    });
    console.log('Seed data created successfully');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map