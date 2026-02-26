import { PrismaRoleRepository } from '../infrastructure/repositories';
import { Role } from '../domain/entities';

export class RoleUseCases {
    constructor(private repository: PrismaRoleRepository) { }

    async listAll(): Promise<Role[]> {
        await this.repository.syncAllPermissions(); // Garante que as permissões baseadas no enumerador estão no banco
        return await this.repository.findAll();
    }

    async getById(id: string): Promise<Role | null> {
        return await this.repository.findById(id);
    }

    async create(data: { name: string; description?: string; permissions: string[]; userIds?: string[] }): Promise<Role> {
        await this.repository.syncAllPermissions();
        return await this.repository.create(data);
    }

    async update(id: string, data: { name?: string; description?: string; permissions?: string[]; userIds?: string[] }): Promise<Role> {
        await this.repository.syncAllPermissions();
        return await this.repository.update(id, data);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
