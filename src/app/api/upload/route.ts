import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { getAuthUser } from '@/core/auth/getUser';
import { getErrorMessage } from '@/lib/error-utils';
import { consumeRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const UPLOAD_RATE_LIMIT = {
    limit: 30,
    windowMs: 10 * 60 * 1000,
};

function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (!forwarded) return '127.0.0.1';
    return forwarded.split(',')[0]?.trim() || '127.0.0.1';
}

function hasPngSignature(buffer: Buffer): boolean {
    if (buffer.length < 8) return false;
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return pngSignature.every((byte, index) => buffer[index] === byte);
}

function hasJpegSignature(buffer: Buffer): boolean {
    if (buffer.length < 3) return false;
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function hasWebpSignature(buffer: Buffer): boolean {
    if (buffer.length < 12) return false;
    const riff = buffer.toString('ascii', 0, 4);
    const webp = buffer.toString('ascii', 8, 12);
    return riff === 'RIFF' && webp === 'WEBP';
}

function isSignatureValid(mimeType: string, buffer: Buffer): boolean {
    switch (mimeType) {
        case 'image/png':
            return hasPngSignature(buffer);
        case 'image/jpeg':
            return hasJpegSignature(buffer);
        case 'image/webp':
            return hasWebpSignature(buffer);
        default:
            return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        // C-3: Autenticação obrigatória
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const ip = getClientIp(request);
        const uploadRateLimit = await consumeRateLimit({
            key: `upload:${authUser.id}:${ip}`,
            limit: UPLOAD_RATE_LIMIT.limit,
            windowMs: UPLOAD_RATE_LIMIT.windowMs,
        });

        if (!uploadRateLimit.allowed) {
            console.warn('Rate limit atingido para upload', {
                userId: authUser.id,
                ip,
                retryAfterSeconds: uploadRateLimit.retryAfterSeconds,
            });
            return NextResponse.json(
                { error: 'Muitos uploads em pouco tempo. Tente novamente em instantes.' },
                {
                    status: 429,
                    headers: {
                        ...rateLimitHeaders(uploadRateLimit),
                        'Retry-After': String(uploadRateLimit.retryAfterSeconds),
                    },
                }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        // C-3: Validar tipo MIME
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Tipo de arquivo inválido. Apenas PNG, JPG e WebP são aceitos.' },
                { status: 400 }
            );
        }

        // C-3: Validar tamanho
        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: 'Arquivo muito grande. Tamanho máximo: 2MB.' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (!isSignatureValid(file.type, buffer)) {
            return NextResponse.json(
                { error: 'Assinatura de arquivo inválida para o tipo informado.' },
                { status: 400 }
            );
        }

        // Usar extensão segura baseada no MIME type (não no nome do arquivo)
        const safeExtension = ALLOWED_EXTENSIONS[file.type];
        const fileName = `${crypto.randomUUID()}.${safeExtension}`;

        const path = join(process.cwd(), 'public', 'uploads', fileName);
        await writeFile(path, buffer);

        const url = `/uploads/${fileName}`;
        return NextResponse.json({ url }, { headers: rateLimitHeaders(uploadRateLimit) });
    } catch (error) {
        console.error('Erro no upload:', getErrorMessage(error));
        return NextResponse.json({ error: 'Falha ao processar upload' }, { status: 500 });
    }
}
