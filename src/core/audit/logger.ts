import { prisma } from '../../lib/prisma';

interface AuditParams {
    usuarioId: string;
    modulo: string;
    acao: string;
    entidadeId?: string;
    ip?: string;
}

export async function logAudit(params: AuditParams) {
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
        // L-1: Falha de auditoria nunca bloqueia o fluxo principal, mas é registrada com contexto
        console.error(
            `[AUDIT_FAIL] Não foi possível registrar: ${params.modulo}/${params.acao} para usuário ${params.usuarioId}`,
            error
        );
    }
}
