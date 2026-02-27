import { UserRepository, User } from '../domain/entities';
import bcrypt from 'bcrypt';
import { logAudit } from '../../../core/audit/logger';

/** Campos opcionais que devem ser convertidos de string vazia para null antes de gravar no banco. */
const NULLABLE_STRING_FIELDS = [
    'fotoUrl', 'roleId', 'horarioInicio', 'horarioFim', 'horarioInicioFds', 'horarioFimFds',
] as const;

type SafeUser = Omit<User, 'senha'>;

/** Remove a senha do objeto antes de retornar ao cliente. */
function sanitizeUser(user: User & Record<string, unknown>): SafeUser {
    const { senha: _omitted, ...safe } = user;
    return safe as SafeUser;
}

/** Converte strings vazias para null em campos que o Prisma espera como nullable. */
function sanitizeNullableFields(data: Partial<User>): Partial<User> {
    const result = { ...data } as Record<string, unknown>;
    for (const field of NULLABLE_STRING_FIELDS) {
        if (result[field] === '') result[field] = null;
    }
    return result as Partial<User>;
}

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

        // Determinar horários (Especial Fim de Semana ou Padrão)
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
                await logAudit({ usuarioId: user.id!, modulo: 'AUTH', acao: 'LOGIN_REJECTED_OUT_OF_HOURS', ip });
                return { error: `Acesso negado fora do horário permitido (${startTimeStr} - ${endTimeStr})` };
            }
        }

        // Verificar bloqueio de conta
        if (user.failedAttempts && user.failedAttempts >= 3) {
            if (user.lockUntil) {
                const lockExpired = new Date() >= new Date(user.lockUntil);
                if (!lockExpired) {
                    return { error: 'Conta bloqueada temporariamente. Procure o administrador.' };
                }
                // Lock expirado: zerar contadores e continuar
                await this.repository.update(user.id!, { failedAttempts: 0, lockUntil: null });
            } else {
                // Bloqueio permanente: exige intervenção manual
                return { error: 'Conta bloqueada. Procure o administrador para desbloquear.' };
            }
        }

        const isPasswordValid = await bcrypt.compare(senha, user.senha as string);

        if (!isPasswordValid) {
            const attempts = (user.failedAttempts || 0) + 1;
            const updateData: Partial<User> = { failedAttempts: attempts };

            if (attempts >= 3) {
                updateData.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
            }

            await this.repository.update(user.id!, updateData);
            await logAudit({ usuarioId: user.id!, modulo: 'AUTH', acao: 'LOGIN_FAILED', ip });

            if (attempts >= 3) {
                return { error: 'Conta bloqueada por 30 minutos após 3 tentativas incorretas. Procure o administrador.' };
            }
            return { error: `Senha incorreta. Tentativa ${attempts} de 3.` };
        }

        // Sucesso: resetar tentativas e lock
        await this.repository.update(user.id!, { failedAttempts: 0, lockUntil: null });
        await logAudit({ usuarioId: user.id!, modulo: 'AUTH', acao: 'LOGIN_SUCCESS', ip });

        return { user: sanitizeUser(user as User & Record<string, unknown>) };
    }

    async listAll(): Promise<SafeUser[]> {
        const users = await this.repository.findAll();
        return users.map(u => sanitizeUser(u as User & Record<string, unknown>));
    }

    async getProfile(id: string): Promise<SafeUser | null> {
        const user = await this.repository.findById(id);
        if (!user) return null;
        return sanitizeUser(user as User & Record<string, unknown>);
    }

    async updateProfile(id: string, data: Partial<User>): Promise<User> {
        const updateData: Partial<User> = sanitizeNullableFields(data);

        if (data.senha && data.senha !== '') {
            updateData.senha = await bcrypt.hash(data.senha, 12);
        } else {
            delete updateData.senha;
        }

        return this.repository.update(id, updateData);
    }

    async createUser(data: User): Promise<SafeUser & { _senhaGerada?: string }> {
        const { randomBytes } = await import('crypto');
        const hasOwnPassword = Boolean(data.senha?.trim());
        const generatedPassword = hasOwnPassword ? data.senha! : randomBytes(6).toString('hex');
        const hashedPassword = await bcrypt.hash(generatedPassword, 12);

        const sanitizedData: Partial<User> = sanitizeNullableFields(data);

        const createdUser = await this.repository.create({
            ...sanitizedData,
            senha: hashedPassword,
            nivelAcesso: sanitizedData.nivelAcesso ?? 2,
        } as User);

        const safeUser = sanitizeUser(createdUser as User & Record<string, unknown>);
        return {
            ...safeUser,
            _senhaGerada: hasOwnPassword ? undefined : generatedPassword,
        };
    }

    async removeUser(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}


