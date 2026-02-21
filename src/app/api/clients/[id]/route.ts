import { NextResponse } from 'next/server';
import { PrismaCustomerRepository } from '@/modules/clients/infrastructure/repositories';
import { CustomerUseCases } from '@/modules/clients/application/useCases';
import { CustomerSchema } from '@/modules/clients/domain/entities';

const repository = new PrismaCustomerRepository();
const useCases = new CustomerUseCases(repository);

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customer = await useCases.getById(id);
        if (!customer) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
        }
        return NextResponse.json(customer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        if (body.dataNascimento) {
            body.dataNascimento = new Date(body.dataNascimento);
        }

        const customer = await useCases.update(id, body);
        return NextResponse.json(customer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await useCases.remove(id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
