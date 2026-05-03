"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, phone: true, balance: true }
    });
    console.log(JSON.stringify(users, null, 2));
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=scratch_check_users.js.map