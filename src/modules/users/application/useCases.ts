import { UserRepository, User } from '../domain/entities';
import bcrypt from 'bcrypt';

export class UserUseCases {
    constructor(private repository: UserRepository) { }

    async login(usuario: string, senha: string) {
        const user = await this.repository.findByUsername(usuario);
        if (!user || !user.senha) return null;

        const isPasswordValid = await bcrypt.compare(senha, user.senha as string);
        if (!isPasswordValid) return null;

        const { senha: _, ...userWithoutPassword } = user as any;
        return userWithoutPassword;
    }

    async getProfile(id: string) {
        const user = await this.repository.findById(id);
        if (!user) return null;

        // Remove senha antes de retornar
        const { senha, ...userWithoutPassword } = user as any;
        return userWithoutPassword;
    }

    async updateProfile(id: string, data: Partial<User>) {
        const updateData: any = { ...data };

        // Se estiver alterando a senha, precisa cifrar
        if (data.senha) {
            updateData.senha = await bcrypt.hash(data.senha, 10);
        } else {
            delete updateData.senha;
        }

        return await this.repository.update(id, updateData);
    }
}
