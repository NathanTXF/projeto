import { NextResponse } from 'next/server';
import { PrismaAuxiliaryRepository } from '@/modules/auxiliary/infrastructure/repositories';
import { AuxiliaryUseCases } from '@/modules/auxiliary/application/useCases';
import { getAuthUser } from '@/core/auth/getUser';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { getErrorMessage } from '@/lib/error-utils';
import { prisma } from '@/lib/prisma';

// Helper para criar rotas dinâmicas
export function createAuxiliaryRoute(modelName: keyof typeof prisma) {
    const repository = new PrismaAuxiliaryRepository(modelName);
    const useCases = new AuxiliaryUseCases(repository);

    return {
        async GET(request: Request) {
            try {
                const user = await getAuthUser();
                if (!user || !hasPermission(user.permissions || [], PERMISSIONS.VIEW_AUXILIARY)) {
                    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
                }

                const url = new URL(request.url);
                const paginated = url.searchParams.get('paginated') === '1';

                if (paginated) {
                    const query = url.searchParams.get('q') ?? undefined;
                    const sortParam = url.searchParams.get('sort');
                    const sort = sortParam === 'newest' ? 'newest' : 'alphabetic';
                    const pageParam = Number(url.searchParams.get('page') ?? '1');
                    const pageSizeParam = Number(url.searchParams.get('pageSize') ?? '12');

                    const result = await useCases.listPaginated({
                        query,
                        sort,
                        page: Number.isFinite(pageParam) ? pageParam : 1,
                        pageSize: Number.isFinite(pageSizeParam) ? pageSizeParam : 12,
                    });

                    return NextResponse.json(result);
                }

                const items = await useCases.listAll();
                return NextResponse.json(items);
            } catch (error) {
                return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
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
            } catch (error) {
                return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
            }
        }
    };
}

export function createAuxiliaryIdRoute(modelName: keyof typeof prisma) {
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
            } catch (error) {
                return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
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
            } catch (error) {
                return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
            }
        }
    };
}
