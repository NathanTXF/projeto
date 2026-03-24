import { prisma } from '@/lib/prisma';
import { Company, CompanyRepository } from '../domain/entities';

export class PrismaCompanyRepository implements CompanyRepository {
    async get(): Promise<Company | null> {
        const company = await prisma.company.findFirst();
        if (!company) {
            return null;
        }

        return {
            id: company.id,
            nome: company.nome,
            cnpj: company.cnpj,
            contato: company.contato ?? '',
            endereco: company.endereco ?? '',
            logoUrl: company.logoUrl,
            reportLogoUrl: company.reportLogoUrl,
        };
    }

    async update(data: Partial<Company>): Promise<Company> {
        const existing = await prisma.company.findFirst();

        const persistData = {
            nome: data.nome,
            cnpj: data.cnpj,
            contato: data.contato,
            endereco: data.endereco,
            logoUrl: data.logoUrl,
            reportLogoUrl: data.reportLogoUrl,
        };

        if (!existing) {
            const created = await prisma.company.create({
                data: {
                    nome: persistData.nome ?? '',
                    cnpj: persistData.cnpj ?? '',
                    contato: persistData.contato ?? '',
                    endereco: persistData.endereco ?? '',
                    logoUrl: persistData.logoUrl,
                    reportLogoUrl: persistData.reportLogoUrl,
                }
            });

            return {
                id: created.id,
                nome: created.nome,
                cnpj: created.cnpj,
                contato: created.contato ?? '',
                endereco: created.endereco ?? '',
                logoUrl: created.logoUrl,
                reportLogoUrl: created.reportLogoUrl,
            };
        }

        const updated = await prisma.company.update({
            where: { id: existing.id },
            data: persistData
        });

        return {
            id: updated.id,
            nome: updated.nome,
            cnpj: updated.cnpj,
            contato: updated.contato ?? '',
            endereco: updated.endereco ?? '',
            logoUrl: updated.logoUrl,
            reportLogoUrl: updated.reportLogoUrl,
        };
    }
}
