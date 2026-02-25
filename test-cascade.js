const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('--- INITIALIZING SMART CASCADE DELETION TEST ---');
    console.log('Looking for test subjects...');

    // Test 1: Blocked Aprovado
    const approvedComm = await prisma.commission.findFirst({
        where: { status: 'APROVADO' }
    });

    if (approvedComm) {
        console.log(`[TEST 1] Found APROVADO commission for Loan ID: ${approvedComm.loanId}`);
        try {
            await deleteLoan(approvedComm.loanId);
            console.error('❌ FAIL: TEST 1 SHOULD HAVE THROWN AN ERROR BUT SUCCEEDED');
        } catch (e) {
            if (e.message.includes('possui uma comissão com impacto financeiro')) {
                console.log('✅ PASS: TEST 1 Blocked deletion successfully with correct message.');
            } else {
                console.error('❌ FAIL: TEST 1 Blocked deletion but with WRONG message:', e.message);
            }
        }
    } else {
        console.log('⚠️ SKIP: No APROVADA commission found to test TEST 1.');
    }

    // Test 2: Cascade Em Aberto
    console.log('\n[TEST 2] Seeding dummy loan and EM_ABERTO commission...');

    // Find some existing generic relations to satisfy foreign keys
    const customer = await prisma.customer.findFirst();
    const organ = await prisma.organ.findFirst();
    const bank = await prisma.bank.findFirst();
    const type = await prisma.loanType.findFirst();
    const group = await prisma.loanGroup.findFirst();
    const table = await prisma.loanTable.findFirst();
    const user = await prisma.user.findFirst();

    const dummyLoan = await prisma.loan.create({
        data: {
            dataInicio: new Date(),
            clienteId: customer.id,
            prazo: 12,
            valorParcela: 100,
            valorBruto: 1200,
            valorLiquido: 1000,
            orgaoId: organ.id,
            bancoId: bank.id,
            tipoId: type.id,
            grupoId: group.id,
            tabelaId: table.id,
            vendedorId: user.id,
            status: "ATIVO"
        }
    });

    const dummyComm = await prisma.commission.create({
        data: {
            loanId: dummyLoan.id,
            vendedorId: user.id,
            mesAno: '02/2026',
            tipoComissao: 'PORCENTAGEM',
            valorReferencia: 10,
            valorCalculado: 100,
            status: 'EM_ABERTO'
        }
    });

    console.log(`[TEST 2] Created dummy Loan (${dummyLoan.id}) and Commission (${dummyComm.id})`);

    try {
        console.log(`[TEST 2] Attempting to delete dummy Loan...`);
        await deleteLoan(dummyLoan.id);
        const verifyLoan = await prisma.loan.findUnique({ where: { id: dummyLoan.id } });
        const verifyComm = await prisma.commission.findUnique({ where: { id: dummyComm.id } });

        if (!verifyLoan && !verifyComm) {
            console.log('✅ PASS: TEST 2 Successfully deleted Loan AND Cascaded Commission in one transaction!');
        } else {
            console.error('❌ FAIL: TEST 2 Executed but records still exist.');
        }
    } catch (e) {
        console.error('❌ FAIL: TEST 2 threw unexpected error:', e.message);
    }
}

// Mimic the exact logic from PrismaLoanRepository to bypass TS compilation
async function deleteLoan(id) {
    const loanWithRelations = await prisma.loan.findUnique({
        where: { id },
        include: { commission: true }
    });

    if (!loanWithRelations) throw new Error(`Empréstimo não encontrado com ID: ${id}`);

    if (loanWithRelations.commission) {
        const status = loanWithRelations.commission.status;
        if (status === 'APROVADO' || status === 'PAGO') {
            throw new Error('Este empréstimo possui uma comissão com impacto financeiro. É necessário efetuar o estorno no módulo Financeiro primeiro.');
        }
    }

    await prisma.$transaction(async (tx) => {
        if (loanWithRelations.commission) {
            await tx.commission.delete({ where: { id: loanWithRelations.commission.id } });
        }
        await tx.loan.delete({ where: { id } });
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
