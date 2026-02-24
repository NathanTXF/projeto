import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Gerar nome único para evitar colisões
        const originalName = file.name;
        const extension = originalName.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${extension}`;

        // Caminho relativo para salvar (dentro de public)
        const path = join(process.cwd(), 'public', 'uploads', fileName);

        await writeFile(path, buffer);

        // URL pública para acessar o arquivo
        const url = `/uploads/${fileName}`;

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Erro no upload:', error);
        return NextResponse.json({ error: 'Falha ao processar upload' }, { status: 500 });
    }
}
