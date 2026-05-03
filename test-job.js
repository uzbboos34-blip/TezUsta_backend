const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const job = await prisma.job.findFirst({ 
    where: { title: { contains: 'Archa qirqish' } },
    include: { applicants: true }
  });
  console.log(JSON.stringify(job, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
