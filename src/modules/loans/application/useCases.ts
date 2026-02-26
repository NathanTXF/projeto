import { Loan, LoanRepository } from '../domain/entities';
import { logAudit } from '../../../core/audit/logger';

export class LoanUseCases {
    constructor(private repository: LoanRepository) { }

    async listAll() {
        return await this.repository.findAll();
    }

    async getById(id: string) {
        return await this.repository.findById(id);
    }

    async create(data: Loan, requesterId: string, commissionUseCases?: any) {
        // Garantir status inicial padrão como ATIVO de forma explícita se necessário, 
        // embora venha do schema ou formulário por padrão.
        const loanData = { ...data, status: data.status || 'ATIVO' as any };
        const loan = await this.repository.create(loanData);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'LOANS',
            acao: 'CREATE',
            entidadeId: loan.id,
        });

        // Automação "Senior": Gerar comissão em aberto imediatamente no ato da venda
        if (commissionUseCases) {
            const mesAno = new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(new Date());

            await commissionUseCases.calculateAndCreate({
                loanId: loan.id,
                vendedorId: loan.vendedorId,
                valorBase: Number(loan.valorLiquido),
                tipo: 'PORCENTAGEM',
                referencia: 1, // 1% default - Pode ser futuramente buscado de configurações de usuário
                mesAno,
                requesterId,
            });
        }

        return loan;
    }

    async updateStatus(id: string, status: Loan['status'], requesterId: string, commissionUseCases?: any, financialUseCases?: any) {
        const loan = await this.repository.update(id, { status });

        await logAudit({
            usuarioId: requesterId,
            modulo: 'LOANS',
            acao: `UPDATE_STATUS_${status}`,
            entidadeId: id,
        });

        if (status === 'FINALIZADO') {
            if (financialUseCases) {
                await financialUseCases.registerTransaction({
                    data: new Date(),
                    valor: Number(loan.valorLiquido),
                    tipo: 'ENTRADA',
                    categoria: 'EMPRESTIMO',
                    descricao: `Finalização de empréstimo - Contrato #${id}`,
                    referenciaId: id,
                }, requesterId);
            }
        }

        return loan;
    }

    async update(id: string, data: Partial<Loan>, requesterId: string) {
        const loan = await this.repository.update(id, data);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'LOANS',
            acao: 'UPDATE',
            entidadeId: id,
        });

        return loan;
    }

    async remove(id: string, requesterId: string) {
        await this.repository.delete(id);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'LOANS',
            acao: 'DELETE',
            entidadeId: id,
        });
    }
}
