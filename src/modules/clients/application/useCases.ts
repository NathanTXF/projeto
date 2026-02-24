import { Customer, CustomerRepository } from '../domain/entities';
import { logAudit } from '../../../core/audit/logger';

export class CustomerUseCases {
    constructor(private repository: CustomerRepository) { }

    async listAll() {
        return await this.repository.findAll();
    }

    async getById(id: string) {
        return await this.repository.findById(id);
    }

    async create(data: Customer, requesterId: string) {
        // Regra: idade calculada automaticamente (isso pode vir do front ou ser validado aqui)
        // Regra: CPF único (validado pelo banco, mas podemos checar antes)
        const existing = await this.repository.findByCpfCnpj(data.cpfCnpj);
        if (existing) {
            throw new Error('Cliente já cadastrado com este CPF/CNPJ');
        }

        if (!data.vendedorId) {
            data.vendedorId = requesterId;
        }

        const customer = await this.repository.create(data);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'CLIENTS',
            acao: 'CREATE',
            entidadeId: customer.id,
        });

        return customer;
    }

    async update(id: string, data: Partial<Customer>, requesterId: string) {
        const customer = await this.repository.update(id, data);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'CLIENTS',
            acao: 'UPDATE',
            entidadeId: id,
        });

        return customer;
    }

    async remove(id: string, requesterId: string) {
        await this.repository.delete(id);

        await logAudit({
            usuarioId: requesterId,
            modulo: 'CLIENTS',
            acao: 'DELETE',
            entidadeId: id,
        });
    }
}
