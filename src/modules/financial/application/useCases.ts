import { FinancialTransaction, FinancialRepository, FinancialStatus } from '../domain/entities';
import { logAudit } from '../../../core/audit/logger';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

    async editPaid(id: string, data: { valorTotal: number }, requesterId: string) {
        const financial = await this.repository.update(id, {
            valorTotal: data.valorTotal
        });

        await logAudit({
            usuarioId: requesterId,
            modulo: 'FINANCEIRO',
            acao: 'EDIT_PAID',
            entidadeId: id,
        });

        return financial;
    }

    async cancelPayment(id: string, requesterId: string) {
        const financial = await this.repository.update(id, {
            status: 'Em aberto' as FinancialStatus,
            pagoEm: null,
            comprovanteUrl: null,
        });

        await logAudit({
            usuarioId: requesterId,
            modulo: 'FINANCEIRO',
            acao: 'CANCEL_PAYMENT',
            entidadeId: id,
        });

        return financial;
    }

    async reverseTransaction(id: string, requesterId: string) {
        const financial = await this.repository.findById(id);
        if (!financial) {
            throw new Error('Registro financeiro não encontrado');
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Delete the financial record
            await tx.financial.delete({
                where: { id }
            });

            // 2. Update the related commission back to 'EM_ABERTO'
            await tx.commission.update({
                where: { id: financial.commissionId },
                data: {
                    status: 'EM_ABERTO',
                    aprovadoEm: null,
                }
            });
        });

        await logAudit({
            usuarioId: requesterId,
            modulo: 'FINANCEIRO',
            acao: 'ESTORNO_FINANCEIRO',
            entidadeId: id,
        });
    }
}
