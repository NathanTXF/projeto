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
            await financialUseCases.registerTransaction({
                data: new Date(),
                valor: Number(commission.valorCalculado),
                tipo: 'SAIDA',
                categoria: 'COMISSAO',
                descricao: `Pagamento de comissão - ref. contrato #${commission.loanId}`,
                referenciaId: commission.id,
                pagoEm: new Date(),
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
}
