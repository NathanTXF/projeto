"use client";

import { AuxiliarySection } from "@/modules/auxiliary/presentation/components/AuxiliarySection";
import { Card, CardContent } from "@/components/ui/card";

export default function AuxiliaryPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl border border-slate-200 backdrop-blur-sm shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        Cadastros Auxiliares
                    </h1>
                    <p className="text-slate-500 mt-1">Gerencie as entidades auxiliares utilizadas em todo o sistema.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg rounded-2xl bg-white/70 backdrop-blur-sm transition-all hover:shadow-xl hover:bg-white/90">
                    <CardContent className="h-full flex flex-col justify-center">
                        <AuxiliarySection
                            title="Órgãos"
                            description="Convênios atendidos pela empresa"
                            apiUrl="/api/auxiliary/organs"
                        />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg rounded-2xl bg-white/70 backdrop-blur-sm transition-all hover:shadow-xl hover:bg-white/90">
                    <CardContent className="h-full flex flex-col justify-center">
                        <AuxiliarySection
                            title="Bancos"
                            description="Instituições financeiras parceiras"
                            apiUrl="/api/auxiliary/banks"
                        />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg rounded-2xl bg-white/70 backdrop-blur-sm transition-all hover:shadow-xl hover:bg-white/90">
                    <CardContent className="h-full flex flex-col justify-center">
                        <AuxiliarySection
                            title="Tipos de Empréstimo"
                            description="Categorias de produtos de crédito"
                            apiUrl="/api/auxiliary/loan-types"
                        />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg rounded-2xl bg-white/70 backdrop-blur-sm transition-all hover:shadow-xl hover:bg-white/90">
                    <CardContent className="h-full flex flex-col justify-center">
                        <AuxiliarySection
                            title="Grupos"
                            description="Agrupamentos de tabelas"
                            apiUrl="/api/auxiliary/loan-groups"
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-none shadow-lg rounded-2xl bg-white/70 backdrop-blur-sm">
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
