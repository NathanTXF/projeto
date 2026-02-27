import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { getAuthUser } from '@/core/auth/getUser';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
    try {
        // C-3: Autenticação obrigatória
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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

        // Usar extensão segura baseada no MIME type (não no nome do arquivo)
        const safeExtension = ALLOWED_EXTENSIONS[file.type];
        const fileName = `${crypto.randomUUID()}.${safeExtension}`;

        const path = join(process.cwd(), 'public', 'uploads', fileName);
        await writeFile(path, buffer);

        const url = `/uploads/${fileName}`;
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Erro no upload:', error);
        return NextResponse.json({ error: 'Falha ao processar upload' }, { status: 500 });
    }
}
