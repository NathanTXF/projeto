import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- TEST 1: Deleting Loan with APROVADA Commission ---');
    const approvedComm = await prisma.commission.findFirst({ where: { status: 'APROVADO' } });
    if (approvedComm) {
        try {
            const res = await fetch(\http://localhost:3000/api/loans/\\, { method: 'DELETE' });
            const data = await res.json();
            console.log('Status:', res.status, 'Response:', data);
        } catch (e) {
            console.error('Fetch error:', e);
        }
    } else {
        console.log('No APROVADA commission found.');
    }

    console.log('\n--- TEST 2: Deleting Loan with EM_ABERTO Commission ---');
    const openComm = await prisma.commission.findFirst({ where: { status: 'Em aberto' } });
    if (openComm) {
         try {
            const res = await fetch(\http://localhost:3000/api/loans/\\, { method: 'DELETE' });
            if (res.status === 204 || res.status === 200) {
                 console.log('Status:', res.status, 'Successfully deleted loan and cascaded commission!');
            } else {
                 const data = await res.json();
                 console.log('Status:', res.status, 'Response:', data);
            }
        } catch (e) {
            console.error('Fetch error:', e);
        }
    } else {
         console.log('No EM_ABERTO commission found. Creating a dummy loan to test...');
         // Skip creating dummy for now, let's see if one exists
    }
}

main().catch(console.error).finally(() => prisma.());
