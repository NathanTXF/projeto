import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/core/auth/jwt';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Rotas públicas
    if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    if (!token) {
        console.log('Middleware: No token found, redirecting to /login');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const user = verifyToken(token);
    if (!user) {
        console.log('Middleware: Token found but verification failed, redirecting to /login');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('Middleware: Valid token for user:', user.usuario);

    // TODO: Implementar lógica de controle de horário aqui se necessário no futuro
    // O requisito diz: "Respeitar horário de acesso"

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
