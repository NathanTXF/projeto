import { Organ, Bank, LoanType, LoanGroup, LoanTable, AuxiliaryRepository } from '../domain/entities';

export class AuxiliaryUseCases<T extends { id: number; nome: string }> {
    constructor(private repository: AuxiliaryRepository<T>) { }

    async listAll() {
        return await this.repository.findAll();
    }

    async create(nome: string) {
        return await this.repository.create({ nome } as Omit<T, 'id'>);
    }

    async update(id: number, nome: string) {
        return await this.repository.update(id, { nome } as Partial<T>);
    }

    async remove(id: number) {
        return await this.repository.delete(id);
    }
}
