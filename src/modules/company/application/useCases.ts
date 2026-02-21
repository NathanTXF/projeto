import { Company, CompanyRepository } from '../domain/entities';

export class CompanyUseCases {
    constructor(private repository: CompanyRepository) { }

    async getSettings() {
        return await this.repository.get();
    }

    async updateSettings(data: Partial<Company>) {
        return await this.repository.update(data);
    }
}
