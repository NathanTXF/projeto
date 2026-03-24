import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/core/auth/jwt';
import { getErrorMessage } from '@/lib/error-utils';
import { getRequestIdHeaderName, resolveRequestId } from '@/lib/request-id';

const PUBLIC_MEDIA_PREFIXES = ['/uploads', '/avatars', '/documents'];
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/health', '/api/ready'];

function buildPassThroughResponse(request: NextRequest, requestId: string) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(getRequestIdHeaderName(), requestId);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
    response.headers.set(getRequestIdHeaderName(), requestId);
    return response;
}

function withRequestId(response: NextResponse, requestId: string) {
    response.headers.set(getRequestIdHeaderName(), requestId);
    return response;
}

export async function middleware(request: NextRequest) {
    const requestId = resolveRequestId(request.headers);
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    const isPublicMedia = PUBLIC_MEDIA_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    // Rotas públicas
    if (pathname.startsWith('/login') || isPublicApi || isPublicMedia) {
        return buildPassThroughResponse(request, requestId);
    }

    if (!token) {
        if (pathname.startsWith('/api')) {
            return withRequestId(NextResponse.json({ error: 'Não autorizado' }, { status: 401 }), requestId);
        }
        return withRequestId(NextResponse.redirect(new URL('/login', request.url)), requestId);
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const permissions = (payload.permissions as string[]) || [];
        const nivelAcesso = payload.nivelAcesso as number;

        // Mapa de rotas do Dashboard para permissões obrigatórias (Visualização)
        const routePermissions: Record<string, string> = {
            '/dashboard/users': 'view_users',
            '/dashboard/roles': 'view_roles',
            '/dashboard/audit': 'view_audit',
            '/dashboard/reports': 'view_reports',
            '/dashboard/company': 'view_company',
            '/dashboard/financial': 'view_financial',
            '/dashboard/commissions': 'view_commissions',
            '/dashboard/auxiliary': 'view_auxiliary',
            '/dashboard/clients': 'view_clients',
            '/dashboard/loans': 'view_loans',
            '/dashboard/agenda': 'view_agenda',
            '/dashboard/overview': 'view_overview',
            '/dashboard/admin/goals': 'view_goals',
        };

        // Verifica se a rota requisitada requer alguma permissão específica
        for (const [route, requiredPermission] of Object.entries(routePermissions)) {
            if (pathname.startsWith(route)) {
                // M-2 TODO: Remover este bypass quando todos os admins tiverem um Role atribuído no banco.
                // Mantido apenas para retrocompatibilidade com usuários legado criados antes do RBAC.
                const isLegacyAdmin = permissions.length === 0 && nivelAcesso === 1;

                if (!permissions.includes(requiredPermission) && !isLegacyAdmin) {
                    // Usuário não tem permissão para acessar este módulo
                    // Se for uma chamada de API, retorna 401 em vez de redirecionar para o dashboard
                    if (pathname.startsWith('/api')) {
                        return withRequestId(NextResponse.json({ error: 'Permissões insuficientes' }, { status: 403 }), requestId);
                    }
                    return withRequestId(NextResponse.redirect(new URL('/dashboard', request.url)), requestId);
                }
                break;
            }
        }

        // Bloqueio genérico para qualquer outra rota /api que não seja auth
        if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
            if (!payload) {
                return withRequestId(NextResponse.json({ error: 'Não autorizado' }, { status: 401 }), requestId);
            }
        }

        return buildPassThroughResponse(request, requestId);
    } catch (err) {
        const message = getErrorMessage(err);
        console.error('Middleware: JWT verification failed:', { requestId, message });
        if (pathname.startsWith('/api')) {
            return withRequestId(NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 }), requestId);
        }
        return withRequestId(NextResponse.redirect(new URL('/login', request.url)), requestId);
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|avatars|documents).*)'],
};
