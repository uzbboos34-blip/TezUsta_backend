const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.job.update({ where: { id: 24 }, data: { dueDate: new Date(Date.now() - 60000) } });
  console.log('Fixed job 24');
}
main().catch(console.error).finally(() => prisma.$disconnect());
