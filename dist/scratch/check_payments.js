"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const payments = await prisma.paymentRequest.findMany({
        include: { user: true },
    });
    console.log(JSON.stringify(payments, (key, value) => key === 'checkImg' ? (value ? value.substring(0, 50) + '...' : null) : value, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=check_payments.js.map