import { SignJWT, jwtVerify } from 'jose';

// Falha em tempo de execução se o segredo não estiver configurado — previne fallback inseguro.
const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
    throw new Error('[SECURITY] JWT_SECRET não está definido nas variáveis de ambiente. Configure-o antes de iniciar o servidor.');
}

/** Segredo compartilhado — importe DAQUI nos outros módulos, nunca redefina. */
export const JWT_SECRET = new TextEncoder().encode(rawSecret);

export interface AuthUser {
    id: string;
    nome: string;
    usuario: string;
    nivelAcesso: number;
    role?: string;
    permissions?: string[];
}

export const signToken = async (user: AuthUser): Promise<string> => {
    return new SignJWT({ ...user })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<AuthUser | null> => {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as AuthUser;
    } catch {
        return null;
    }
};
