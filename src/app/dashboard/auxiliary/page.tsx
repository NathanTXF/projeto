"use client";

import { AuxiliarySection } from "@/modules/auxiliary/presentation/components/AuxiliarySection";
import { Card, CardContent } from "@/components/ui/card";

export default function AuxiliaryPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cadastros Auxiliares</h1>
                <p className="text-muted-foreground">
                    Gerencie as entidades auxiliares utilizadas em todo o sistema.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <AuxiliarySection
                            title="Órgãos"
                            description="Convênios atendidos pela empresa"
                            apiUrl="/api/auxiliary/organs"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <AuxiliarySection
                            title="Bancos"
                            description="Instituições financeiras parceiras"
                            apiUrl="/api/auxiliary/banks"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <AuxiliarySection
                            title="Tipos de Empréstimo"
                            description="Categorias de produtos de crédito"
                            apiUrl="/api/auxiliary/loan-types"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <AuxiliarySection
                            title="Grupos"
                            description="Agrupamentos de tabelas"
                            apiUrl="/api/auxiliary/loan-groups"
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardContent className="pt-6">
                        <AuxiliarySection
                            title="Tabelas de Comissão"
                            description="Tabelas de taxas e prazos"
                            apiUrl="/api/auxiliary/loan-tables"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
