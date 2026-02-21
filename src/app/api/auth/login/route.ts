import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/modules/users/infrastructure/repositories';
import { UserUseCases } from '@/modules/users/application/useCases';
import { signToken } from '@/core/auth/jwt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { usuario, senha } = body;
        console.log('Login attempt for user:', usuario);

        const repository = new PrismaUserRepository();
        const useCases = new UserUseCases(repository);

        const user = await useCases.login(usuario, senha);

        if (!user) {
            return NextResponse.json(
                { message: 'Usuário ou senha inválidos' },
                { status: 401 }
            );
        }

        const token = signToken({
            id: user.id,
            nome: user.nome,
            usuario: user.usuario,
            nivelAcesso: user.nivelAcesso,
        });

        const response = NextResponse.json({
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                nome: user.nome,
                usuario: user.usuario,
                nivelAcesso: user.nivelAcesso
            }
        });

        // Set cookie manually for JWT
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 8, // 8 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Erro interno ao realizar login' },
            { status: 500 }
        );
    }
}
