async function test() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Find an open job
    const job = await prisma.job.findFirst({ where: { status: 'open' } });
    if (!job) {
       console.log("No open jobs found");
       return;
    }
    
    // Find a worker
    const worker = await prisma.user.findFirst({ where: { role: 'worker', balance: { gte: 30000 } } });
    if (!worker) {
       console.log("No valid worker found");
       return;
    }

    const res = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: worker.phone, pass: '123456' }) // Assume password is correct
    });
    const data = await res.json();
    const token = data.access_token;
    
    if (!token) {
        console.log("Login failed", data);
        return;
    }

    const res2 = await fetch(`http://localhost:3001/jobs/${job.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data2 = await res2.json();
    console.log("Apply Response:", data2);
    
    await prisma.$disconnect();
  } catch(e) {
    console.error(e.message);
  }
}
test();
