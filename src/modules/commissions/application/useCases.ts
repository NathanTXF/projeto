import { Commission, CommissionRepository } from '../domain/entities';
import { logAudit } from '../../../core/audit/logger';

export class CommissionUseCases {
    constructor(private repository: CommissionRepository) { }

    async listAll() {
        return await this.repository.findAll();
    }

    async getByPeriod(mesAno: string) {
        return await this.repository.findByPeriod(mesAno);
    }

    async getByFilters(filters: { mesAno?: string; vendedorId?: string }) {
        return await this.repository.findByFilters(filters);
    }

    async getWithPendingLoans(filters: { mesAno?: string; vendedorId?: string }) {
        const approvedAndOpen = await this.repository.findByFilters(filters);
        const pendingGeneration = await this.repository.findPendingLoans(filters);

        // Combinar os dois. No topo o que já existe, depois os pendentes.
        return [...approvedAndOpen, ...pendingGeneration];
    }

    async calculateAndCreate(params: {
        loanId: string;
        vendedorId: string;
        valorBase: number;
        tipo: 'PORCENTAGEM' | 'VALOR_FIXO';
        referencia: number;
        mesAno: string;
        requesterId: string;
    }) {
        const valorCalculado = params.tipo === 'PORCENTAGEM'
            ? (params.valorBase * params.referencia) / 100
            : params.referencia;

        const commissionData: Commission = {
            loanId: params.loanId,
            vendedorId: params.vendedorId,
            mesAno: params.mesAno,
            tipoComissao: params.tipo,
            valorReferencia: params.referencia,
            valorCalculado,
            status: 'EM_ABERTO',
        };

        const commission = await this.repository.create(commissionData);

        await logAudit({
            usuarioId: params.requesterId,
            modulo: 'COMMISSIONS',
            acao: 'CALCULATE_AND_CREATE',
            entidadeId: commission.id,
        });

        return commission;
    }

    async approve(id: string, requesterId: string, financialUseCases?: any) {
        const commission = await this.repository.update(id, {
            status: 'APROVADO',
            aprovadoEm: new Date(),
        });

        if (financialUseCases) {
            await financialUseCases.createFinancialRecord({
                commissionId: commission.id,
                vendedorId: commission.vendedorId,
                mesAno: commission.mesAno,
                valorTotal: Number(commission.valorCalculado),
            }, requesterId);
        }

        await logAudit({
            usuarioId: requesterId,
            modulo: 'COMMISSIONS',
            acao: 'APPROVE',
            entidadeId: id,
        });

        return commission;
    }

    async cancel(id: string, requesterId: string) {
        const commission = await this.repository.update(id, {
            status: 'CANCELADO',
        });

        await logAudit({
            usuarioId: requesterId,
            modulo: 'COMMISSIONS',
            acao: 'CANCEL',
            entidadeId: id,
        });

        return commission;
    }

    async editApproved(id: string, params: { tipo: 'PORCENTAGEM' | 'VALOR_FIXO'; referencia: number; valorBase: number }, requesterId: string) {
        const valorCalculado = params.tipo === 'PORCENTAGEM'
            ? (params.valorBase * params.referencia) / 100
            : params.referencia;

        const commission = await this.repository.update(id, {
            tipoComissao: params.tipo,
            valorReferencia: params.referencia,
            valorCalculado,
        });

        await logAudit({
            usuarioId: requesterId,
            modulo: 'COMMISSIONS',
            acao: 'EDIT_APPROVED',
            entidadeId: id,
        });

        return commission;
    }
}
