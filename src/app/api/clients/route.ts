import { NextResponse } from 'next/server';
import { PrismaCustomerRepository } from '@/modules/clients/infrastructure/repositories';
import { CustomerUseCases } from '@/modules/clients/application/useCases';
import { CustomerSchema } from '@/modules/clients/domain/entities';

const repository = new PrismaCustomerRepository();
const useCases = new CustomerUseCases(repository);

export async function GET() {
    try {
        const customers = await useCases.listAll();
        return NextResponse.json(customers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Parse date correctly if string in JSON
        if (body.dataNascimento) {
            body.dataNascimento = new Date(body.dataNascimento);
        }

        const validatedData = CustomerSchema.parse(body);
        const customer = await useCases.create(validatedData as any);

        return NextResponse.json(customer, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
