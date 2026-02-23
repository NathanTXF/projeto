import { Company, CompanyRepository } from '../domain/entities';
import { logAudit } from '@/core/audit/logger';

export class CompanyUseCases {
    constructor(private repository: CompanyRepository) { }

    async getSettings() {
        return await this.repository.get();
    }

    async updateSettings(data: Partial<Company>, requesterId?: string, ip?: string) {
        const result = await this.repository.update(data);

        if (requesterId) {
            await logAudit({
                usuarioId: requesterId,
                modulo: 'SETTINGS',
                acao: 'UPDATE_COMPANY',
                entidadeId: 'COMPANY_SETTINGS',
                ip
            });
        }

        return result;
    }
}
