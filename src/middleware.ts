import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-previna-se-em-producao'
);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Rotas públicas
    if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const permissions = (payload.permissions as string[]) || [];
        const nivelAcesso = payload.nivelAcesso as number;

        // Mapa de rotas do Dashboard para permissões obrigatórias
        const routePermissions: Record<string, string> = {
            '/dashboard/users': 'manage_users',
            '/dashboard/roles': 'manage_roles',
            '/dashboard/audit': 'view_audit',
            '/dashboard/reports': 'view_audit',
            '/dashboard/company': 'manage_settings',
            '/dashboard/financial': 'view_financial',
            '/dashboard/commissions': 'view_commissions',
            '/dashboard/auxiliary': 'manage_auxiliary',
            '/dashboard/clients': 'view_clients',
            '/dashboard/loans': 'view_loans',
            '/dashboard/agenda': 'view_agenda',
        };

        // Verifica se a rota requisitada requer alguma permissão específica
        for (const [route, requiredPermission] of Object.entries(routePermissions)) {
            if (pathname.startsWith(route)) {
                // Backward compatibility: Se não tem permissions array mas é nivelAcesso 1, deixa passar
                const isLegacyAdmin = permissions.length === 0 && nivelAcesso === 1;

                if (!permissions.includes(requiredPermission) && !isLegacyAdmin) {
                    // Usuário não tem permissão para acessar este módulo
                    // Se for uma chamada de API, retorna 401 em vez de redirecionar para o dashboard
                    if (pathname.startsWith('/api')) {
                        return NextResponse.json({ error: 'Permissões insuficientes' }, { status: 403 });
                    }
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
                break;
            }
        }

        // Bloqueio genérico para qualquer outra rota /api que não seja auth
        if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
            if (!payload) {
                return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
            }
        }

        return NextResponse.next();
    } catch (err: any) {
        console.error('Middleware: JWT verification failed:', err.message);
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
