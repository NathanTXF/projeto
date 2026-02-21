import { prisma } from '../../lib/prisma';

export async function logAudit(params: {
    usuarioId: string;
    modulo: string;
    acao: string;
    entidadeId?: string;
    ip?: string;
}) {
    try {
        await prisma.audit.create({
            data: {
                usuarioId: params.usuarioId,
                modulo: params.modulo,
                acao: params.acao,
                entidadeId: params.entidadeId,
                ip: params.ip,
            },
        });
    } catch (error) {
        console.error('Falha ao gravar log de auditoria:', error);
    }
}
