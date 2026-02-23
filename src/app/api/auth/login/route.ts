import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/modules/users/infrastructure/repositories';
import { UserUseCases } from '@/modules/users/application/useCases';
import { SignJWT } from 'jose';
import { PERMISSIONS } from '@/lib/permissions';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-previna-se-em-producao'
);

export async function POST(request: Request) {
    try {
        const { usuario, senha } = await request.json();

        const repository = new PrismaUserRepository();
        const useCases = new UserUseCases(repository);

        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const result = await useCases.login(usuario, senha, ip);

        if (result.error) {
            return NextResponse.json(
                { message: result.error },
                { status: result.error.includes('bloqueada') ? 403 : 401 }
            );
        }

        const user = result.user;

        // Extract permissions if the user has a linked role
        let permissions: string[] = user.role?.permissions?.map((rp: any) => rp.permission.name) || [];

        // Fallback para usuários legado (sem Role vinculada no banco)
        if (permissions.length === 0) {
            if (user.nivelAcesso === 1) {
                // Admins ganham todas as permissões
                permissions = Object.values(PERMISSIONS);
            } else {
                // Vendedores/Usuários comuns ganham as permissões básicas
                permissions = [
                    PERMISSIONS.VIEW_DASHBOARD,
                    PERMISSIONS.VIEW_CLIENTS,
                    PERMISSIONS.VIEW_LOANS,
                    PERMISSIONS.VIEW_AGENDA
                ];
            }
        }

        const roleName = user.role?.name || (user.nivelAcesso === 1 ? 'Administrador' : 'Vendedor');

        const token = await new SignJWT({
            id: user.id,
            nome: user.nome,
            usuario: user.usuario,
            role: roleName,
            permissions: permissions,
            nivelAcesso: user.nivelAcesso, // Backward compatibility
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
                role: roleName,
                permissions: permissions,
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
