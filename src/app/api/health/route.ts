import { NextRequest, NextResponse } from 'next/server';
import { getRequestIdHeaderName, resolveRequestId } from '@/lib/request-id';

export async function GET(request: NextRequest) {
    const requestId = resolveRequestId(request.headers);

    const response = NextResponse.json({
        status: 'ok',
        service: 'dinheiro-facil',
        timestamp: new Date().toISOString(),
    });

    response.headers.set(getRequestIdHeaderName(), requestId);
    return response;
}
