import { AuditRepository } from '../domain/entities';

export class AuditUseCases {
    constructor(private repository: AuditRepository) { }

    async listLogs(filters?: {
        usuarioId?: string;
        modulo?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        return await this.repository.findAll(filters);
    }

    async getLogDetails(id: string) {
        return await this.repository.findById(id);
    }
}
