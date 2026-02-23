import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-previna-se-em-producao'
);

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
        .setExpirationTime('8h')
        .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<AuthUser | null> => {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as AuthUser;
    } catch (error: any) {
        console.error('JWT Verification Error:', error.message);
        return null;
    }
};
