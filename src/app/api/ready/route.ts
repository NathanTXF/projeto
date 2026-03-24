import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestIdHeaderName, resolveRequestId } from '@/lib/request-id';
import { getErrorMessage } from '@/lib/error-utils';

export async function GET(request: NextRequest) {
    const requestId = resolveRequestId(request.headers);

    try {
        await prisma.$queryRaw`SELECT 1`;

        const response = NextResponse.json({
            status: 'ready',
            dependencies: {
                database: 'ok',
            },
            timestamp: new Date().toISOString(),
        });
        response.headers.set(getRequestIdHeaderName(), requestId);
        return response;
    } catch (error) {
        const response = NextResponse.json(
            {
                status: 'not_ready',
                dependencies: {
                    database: 'error',
                },
                error: getErrorMessage(error),
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
        response.headers.set(getRequestIdHeaderName(), requestId);
        return response;
    }
}
