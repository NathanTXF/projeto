import { NextResponse } from 'next/server';
import { PrismaAuxiliaryRepository } from '@/modules/auxiliary/infrastructure/repositories';
import { AuxiliaryUseCases } from '@/modules/auxiliary/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

// Helper para criar rotas dinâmicas
export function createAuxiliaryRoute(modelName: any) {
    const repository = new PrismaAuxiliaryRepository(modelName);
    const useCases = new AuxiliaryUseCases(repository);

    return {
        async GET() {
            try {
                const user = await getAuthUser();
                if (!user || !hasPermission(user.permissions || [], PERMISSIONS.VIEW_AUXILIARY)) {
                    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
                }

                const items = await useCases.listAll();
                return NextResponse.json(items);
            } catch (error: any) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        },
        async POST(request: Request) {
            try {
                const user = await getAuthUser();
                if (!user || !hasPermission(user.permissions || [], PERMISSIONS.CREATE_AUXILIARY)) {
                    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
                }

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
                const user = await getAuthUser();
                if (!user || !hasPermission(user.permissions || [], PERMISSIONS.EDIT_AUXILIARY)) {
                    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
                }

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
                const user = await getAuthUser();
                if (!user || !hasPermission(user.permissions || [], PERMISSIONS.DELETE_AUXILIARY)) {
                    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
                }

                const { id } = await params;
                await useCases.remove(Number(id));
                return new NextResponse(null, { status: 204 });
            } catch (error: any) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }
    };
}
