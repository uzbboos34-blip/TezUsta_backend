const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all open jobs with pending applicants
  const jobs = await prisma.job.findMany({
    where: { status: 'open' },
    include: { applicants: true }
  });

  let count = 0;
  for (const job of jobs) {
    if (job.applicants.length > 0) {
      // Find the first applicant
      const applicant = job.applicants[0];
      
      await prisma.$transaction([
        prisma.jobApplicant.update({
          where: { id: applicant.id },
          data: { status: 'accepted' }
        }),
        prisma.job.update({
          where: { id: job.id },
          data: { 
            status: 'active',
            workerId: applicant.workerId
          }
        })
      ]);
      console.log(`Fixed job ${job.id} - ${job.title}`);
      count++;
    }
  }
  console.log(`Fixed ${count} old jobs`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
