import { Transaction, FinancialRepository } from '../domain/entities';
import { logAudit } from '../../../core/audit/logger';

export class FinancialUseCases {
    constructor(private repository: FinancialRepository) { }

    async listAll() {
        return await this.repository.findAll();
    }

    async getBalance() {
        return await this.repository.getBalance();
    }

    async registerTransaction(data: Transaction, requesterId: string) {
        const transaction = await this.repository.create(data);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'FINANCIAL',
            acao: 'CREATE_TRANSACTION',
            entidadeId: transaction.id,
        });

        return transaction;
    }

    async updateTransaction(id: string, data: Partial<Transaction>, requesterId: string) {
        const transaction = await this.repository.update(id, data);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'FINANCIAL',
            acao: 'UPDATE_TRANSACTION',
            entidadeId: id,
        });

        return transaction;
    }

    async deleteTransaction(id: string, requesterId: string) {
        await this.repository.delete(id);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'FINANCIAL',
            acao: 'DELETE_TRANSACTION',
            entidadeId: id,
        });
    }

    async getMovementByPeriod(start: Date, end: Date) {
        return await this.repository.findByPeriod(start, end);
    }
}
