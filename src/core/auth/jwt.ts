import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-previna-se-em-producao';

export interface AuthUser {
    id: string;
    nome: string;
    usuario: string;
    nivelAcesso: number;
}

export const signToken = (user: AuthUser) => {
    return jwt.sign(user, JWT_SECRET, {
        expiresIn: '8h', // Expiração configurável
    });
};

export const verifyToken = (token: string): AuthUser | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        console.log('JWT: Token verified successfully for:', decoded.usuario);
        return decoded;
    } catch (error: any) {
        console.error('JWT Verification Error:', error.message);
        return null;
    }
};
