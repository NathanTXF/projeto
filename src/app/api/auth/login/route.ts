import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/modules/users/infrastructure/repositories';
import { UserUseCases } from '@/modules/users/application/useCases';
import { JWT_SECRET } from '@/core/auth/jwt';
import { SignJWT } from 'jose';
import { PERMISSIONS } from '@/lib/permissions';
import { getErrorMessage } from '@/lib/error-utils';
import { consumeRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

const LOGIN_RATE_LIMIT = {
    limit: 20,
    windowMs: 15 * 60 * 1000,
};

function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (!forwarded) return '127.0.0.1';
    return forwarded.split(',')[0]?.trim() || '127.0.0.1';
}

export async function POST(request: Request) {
    try {
        const ip = getClientIp(request);

        const loginRateLimit = await consumeRateLimit({
            key: `login:${ip}`,
            limit: LOGIN_RATE_LIMIT.limit,
            windowMs: LOGIN_RATE_LIMIT.windowMs,
        });

        if (!loginRateLimit.allowed) {
            console.warn('Rate limit atingido para login', { ip, retryAfterSeconds: loginRateLimit.retryAfterSeconds });
            return NextResponse.json(
                { message: 'Muitas tentativas. Tente novamente em instantes.' },
                {
                    status: 429,
                    headers: {
                        ...rateLimitHeaders(loginRateLimit),
                        'Retry-After': String(loginRateLimit.retryAfterSeconds),
                    },
                }
            );
        }

        const { usuario, senha } = await request.json();

        const repository = new PrismaUserRepository();
        const useCases = new UserUseCases(repository);

        const result = await useCases.login(usuario, senha, ip);

        if (result.error) {
            return NextResponse.json(
                { message: result.error },
                {
                    status: result.error.includes('bloqueada') ? 403 : 401,
                    headers: rateLimitHeaders(loginRateLimit),
                }
            );
        }

        const user = result.user as NonNullable<typeof result.user> & {
            role?: { name: string, permissions: { permission: { name: string } }[] }
        };

        if (!user) {
            return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
        }


        // Extract permissions if the user has a linked role
        let permissions: string[] = user.role?.permissions?.map((rp) => rp.permission.name) || [];

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
            sameSite: 'strict',
            maxAge: 60 * 60 * 8,
            path: '/',
        });

        for (const [header, value] of Object.entries(rateLimitHeaders(loginRateLimit))) {
            response.headers.set(header, value);
        }

        return response;
    } catch (error) {
        console.error('Login error:', getErrorMessage(error));
        return NextResponse.json(
            { message: 'Erro interno ao realizar login' },
            { status: 500 }
        );
    }
}
