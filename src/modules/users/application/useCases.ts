import { UserRepository, User } from '../domain/entities';
import bcrypt from 'bcrypt';
import { logAudit } from '../../../core/audit/logger';

export class UserUseCases {
    constructor(private repository: UserRepository) { }

    async login(usuario: string, senha: string, ip?: string) {
        const user = await this.repository.findByUsername(usuario);
        if (!user) return { error: 'Usuário não encontrado' };

        // Verificar se a conta está ativa
        if (user.ativo === false) {
            return { error: 'Sua conta está desativada. Entre em contato com o administrador.' };
        }

        const now = new Date();

        const currentDay = now.getDay(); // 0: Dom, 1: Seg, ..., 6: Sab
        const isWeekend = currentDay === 0 || currentDay === 6;

        // Verificar dias de acesso
        if (user.diasAcesso) {
            const allowedDays = user.diasAcesso.split(',').map(Number);

            if (!allowedDays.includes(currentDay)) {
                return { error: 'Seu acesso não é permitido hoje.' };
            }
        }

        // Determinar horários a usar (Especial Fim de Semana ou Padrão)
        let startTimeStr = user.horarioInicio;
        let endTimeStr = user.horarioFim;

        if (isWeekend && user.horarioInicioFds && user.horarioFimFds) {
            startTimeStr = user.horarioInicioFds;
            endTimeStr = user.horarioFimFds;
        }

        if (startTimeStr && endTimeStr) {
            const currentTime = now.getHours() * 100 + now.getMinutes();

            const [startH, startM] = startTimeStr.split(':').map(Number);
            const [endH, endM] = endTimeStr.split(':').map(Number);

            const startTime = startH * 100 + startM;
            const endTime = endH * 100 + endM;

            if (currentTime < startTime || currentTime > endTime) {
                await logAudit({
                    usuarioId: user.id!,
                    modulo: 'AUTH',
                    acao: 'LOGIN_REJECTED_OUT_OF_HOURS',
                    ip
                });
                return { error: `Acesso negado fora do horário permitido (${startTimeStr} - ${endTimeStr})` };
            }
        }

        // Verificar se está bloqueado (mais de 3 tentativas)
        if (user.failedAttempts && user.failedAttempts >= 3) {
            if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
                return { error: 'Conta bloqueada temporariamente. Procure o administrador.' };
            }
            if (!user.lockUntil) {
                return { error: 'Conta bloqueada. Procure o administrador para desbloquear.' };
            }
        }

        const isPasswordValid = await bcrypt.compare(senha, user.senha as string);

        if (!isPasswordValid) {
            const attempts = (user.failedAttempts || 0) + 1;
            const updateData: Partial<User> = { failedAttempts: attempts };

            await this.repository.update(user.id!, updateData);

            await logAudit({
                usuarioId: user.id!,
                modulo: 'AUTH',
                acao: 'LOGIN_FAILED',
                ip
            });

            return { error: `Senha incorreta. Tentativa ${attempts} de 3.` };
        }

        // Sucesso: resetar tentativas e lock
        await this.repository.update(user.id!, {
            failedAttempts: 0,
            lockUntil: null
        });

        await logAudit({
            usuarioId: user.id!,
            modulo: 'AUTH',
            acao: 'LOGIN_SUCCESS',
            ip
        });

        const { senha: _, ...userWithoutPassword } = user as any;
        return { user: userWithoutPassword };
    }

    async listAll() {
        const users = await this.repository.findAll();
        // Remove senha antes de retornar
        return users.map(({ senha, ...userWithoutPassword }: any) => userWithoutPassword);
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
        if (data.senha && data.senha !== "") {
            updateData.senha = await bcrypt.hash(data.senha, 10);
        } else {
            delete updateData.senha;
        }

        // Sanitiza strings vazias para null para evitar erros no Prisma (UUID, URL, etc)
        if (updateData.fotoUrl === "") updateData.fotoUrl = null;
        if (updateData.roleId === "") updateData.roleId = null;
        if (updateData.horarioInicio === "") updateData.horarioInicio = null;
        if (updateData.horarioFim === "") updateData.horarioFim = null;
        if (updateData.horarioInicioFds === "") updateData.horarioInicioFds = null;
        if (updateData.horarioFimFds === "") updateData.horarioFimFds = null;

        return await this.repository.update(id, updateData);
    }

    async createUser(data: User) {
        const sanitizedData: any = { ...data };

        // Garante uma senha padrão se não informada
        const passwordToHash = data.senha && data.senha !== "" ? data.senha : "123456";
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);

        // Sanitiza strings vazias para null
        if (sanitizedData.fotoUrl === "") sanitizedData.fotoUrl = null;
        if (sanitizedData.roleId === "") sanitizedData.roleId = null;
        if (sanitizedData.horarioInicio === "") sanitizedData.horarioInicio = null;
        if (sanitizedData.horarioFim === "") sanitizedData.horarioFim = null;
        if (sanitizedData.horarioInicioFds === "") sanitizedData.horarioInicioFds = null;
        if (sanitizedData.horarioFimFds === "") sanitizedData.horarioFimFds = null;

        return await this.repository.create({
            ...sanitizedData,
            senha: hashedPassword,
            nivelAcesso: sanitizedData.nivelAcesso || 2 // Default to Vendedor if not set
        });
    }

    async removeUser(id: string) {
        return await this.repository.delete(id);
    }
}
