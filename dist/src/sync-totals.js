"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function sync() {
    console.log('🔄 Hisob-kitoblarni yangilash boshlandi...');
    const users = await prisma.user.findMany();
    for (const user of users) {
        const earned = await prisma.job.aggregate({
            where: { workerId: user.id, status: 'done', isDeleted: false },
            _sum: { price: true },
            _count: { id: true }
        });
        const spent = await prisma.job.aggregate({
            where: { clientId: user.id, status: 'done', isDeleted: false },
            _sum: { price: true }
        });
        await prisma.user.update({
            where: { id: user.id },
            data: {
                totalEarned: earned._sum.price || 0,
                totalJobs: earned._count.id || 0,
                totalSpent: spent._sum.price || 0
            }
        });
        console.log(`✅ ${user.name} uchun yangilandi: +${earned._sum.price || 0} daromad, +${spent._sum.price || 0} xarajat`);
    }
    console.log('🏁 Hammasi tayyor!');
    process.exit(0);
}
sync().catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=sync-totals.js.map