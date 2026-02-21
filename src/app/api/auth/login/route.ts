import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/modules/users/infrastructure/repositories';
import { UserUseCases } from '@/modules/users/application/useCases';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-previna-se-em-producao'
);

export async function POST(request: Request) {
    try {
        const { usuario, senha } = await request.json();

        const repository = new PrismaUserRepository();
        const useCases = new UserUseCases(repository);

        const user = await useCases.login(usuario, senha);

        if (!user) {
            return NextResponse.json(
                { message: 'Usuário ou senha inválidos' },
                { status: 401 }
            );
        }

        const token = await new SignJWT({
            id: user.id,
            nome: user.nome,
            usuario: user.usuario,
            nivelAcesso: user.nivelAcesso,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('8h')
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                nome: user.nome,
                usuario: user.usuario,
                nivelAcesso: user.nivelAcesso
            }
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 8,
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Login error:', error.message);
        return NextResponse.json(
            { message: 'Erro interno ao realizar login' },
            { status: 500 }
        );
    }
}
