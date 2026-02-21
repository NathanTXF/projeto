import { NextResponse } from 'next/server';
import { PrismaAuxiliaryRepository } from '@/modules/auxiliary/infrastructure/repositories';
import { AuxiliaryUseCases } from '@/modules/auxiliary/application/useCases';

// Helper para criar rotas dinâmicas
export function createAuxiliaryRoute(modelName: any) {
    const repository = new PrismaAuxiliaryRepository(modelName);
    const useCases = new AuxiliaryUseCases(repository);

    return {
        async GET() {
            try {
                const items = await useCases.listAll();
                return NextResponse.json(items);
            } catch (error: any) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        },
        async POST(request: Request) {
            try {
                const body = await request.json();
                const item = await useCases.create(body.nome);
                return NextResponse.json(item, { status: 201 });
            } catch (error: any) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }
    };
}

export function createAuxiliaryIdRoute(modelName: any) {
    const repository = new PrismaAuxiliaryRepository(modelName);
    const useCases = new AuxiliaryUseCases(repository);

    return {
        async PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
            try {
                const { id } = await params;
                const body = await request.json();
                const item = await useCases.update(Number(id), body.nome);
                return NextResponse.json(item);
            } catch (error: any) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        },
        async DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
            try {
                const { id } = await params;
                await useCases.remove(Number(id));
                return new NextResponse(null, { status: 204 });
            } catch (error: any) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }
    };
}
