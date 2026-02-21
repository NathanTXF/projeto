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

    async create(data: Loan, requesterId: string) {
        const loan = await this.repository.create(data);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'LOANS',
            acao: 'CREATE',
            entidadeId: loan.id,
        });

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
                    valor: Number(loan.valorLiquido), // Exemplo: Valor que a empresa recebe (ou base de faturamento)
                    tipo: 'ENTRADA',
                    categoria: 'EMPRESTIMO',
                    descricao: `Finalização de empréstimo - Contrato #${id}`,
                    referenciaId: id,
                }, requesterId);
            }

            if (commissionUseCases) {
                // Cálculo automático de comissão (exemplo: 1% padrão por enquanto ou vindo de algum lugar)
                const mesAno = new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(new Date());

                await commissionUseCases.calculateAndCreate({
                    loanId: id,
                    vendedorId: loan.vendedorId,
                    valorBase: Number(loan.valorLiquido),
                    tipo: 'PORCENTAGEM',
                    referencia: 1, // 1% default
                    mesAno,
                    requesterId,
                });
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
