import { FinancialTransaction, FinancialRepository, FinancialStatus } from '../domain/entities';
import { logAudit } from '../../../core/audit/logger';

export class FinancialUseCases {
    constructor(private repository: FinancialRepository) { }

    async listAll() {
        return await this.repository.findAll();
    }

    async getByPeriod(mesAno: string) {
        return await this.repository.findByPeriod(mesAno);
    }

    async getByVendedor(vendedorId: string) {
        return await this.repository.findByVendedor(vendedorId);
    }

    async createFinancialRecord(data: Omit<FinancialTransaction, 'id' | 'createdAt' | 'status'>, requesterId: string) {
        const financial = await this.repository.create({
            ...data,
            status: 'Em aberto' as FinancialStatus
        });

        await logAudit({
            usuarioId: requesterId,
            modulo: 'FINANCEIRO',
            acao: 'CREATE_FINANCIAL_RECORD',
            entidadeId: financial.id,
        });

        return financial;
    }

    async payCommission(id: string, pagoEm: Date, comprovanteUrl: string | undefined, requesterId: string) {
        const financial = await this.repository.update(id, {
            status: 'Pago' as FinancialStatus,
            pagoEm: pagoEm,
            comprovanteUrl: comprovanteUrl,
        });

        await logAudit({
            usuarioId: requesterId,
            modulo: 'FINANCEIRO',
            acao: 'PAGAMENTO',
            entidadeId: id,
        });

        return financial;
    }
}
