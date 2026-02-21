import { Customer, CustomerRepository } from '../domain/entities';

export class CustomerUseCases {
    constructor(private repository: CustomerRepository) { }

    async listAll() {
        return await this.repository.findAll();
    }

    async getById(id: string) {
        return await this.repository.findById(id);
    }

    async create(data: Customer) {
        // Regra: idade calculada automaticamente (isso pode vir do front ou ser validado aqui)
        // Regra: CPF único (validado pelo banco, mas podemos checar antes)
        const existing = await this.repository.findByCpfCnpj(data.cpfCnpj);
        if (existing) {
            throw new Error('Cliente já cadastrado com este CPF/CNPJ');
        }

        return await this.repository.create(data);
    }

    async update(id: string, data: Partial<Customer>) {
        return await this.repository.update(id, data);
    }

    async remove(id: string) {
        return await this.repository.delete(id);
    }
}
