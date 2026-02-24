"use client";

import { AuxiliarySection } from "@/modules/auxiliary/presentation/components/AuxiliarySection";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function AuxiliaryPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#00355E] p-8 shadow-sm">
                <div className="relative flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                        <Database className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Cadastros Auxiliares</h1>
                        <p className="mt-1 text-primary-foreground/80 font-medium text-sm">Gerencie as entidades auxiliares utilizadas em todo o sistema.</p>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Database className="h-5 w-5 text-sidebar-foreground" />
                    Ferramentas de Gestão
                </h2>
                <p className="text-sm text-slate-500 font-medium">Configure as tabelas de suporte do ERP Dinheiro Fácil.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white transition-all hover:shadow-md h-full">
                    <CardContent className="h-full p-0 flex flex-col justify-between">
                        <AuxiliarySection
                            title="Órgãos"
                            description="Convênios atendidos pela empresa"
                            apiUrl="/api/auxiliary/organs"
                        />
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white transition-all hover:shadow-md h-full">
                    <CardContent className="h-full p-0 flex flex-col justify-between">
                        <AuxiliarySection
                            title="Bancos"
                            description="Instituições financeiras parceiras"
                            apiUrl="/api/auxiliary/banks"
                        />
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white transition-all hover:shadow-md h-full">
                    <CardContent className="h-full p-0 flex flex-col justify-between">
                        <AuxiliarySection
                            title="Tipos de Empréstimo"
                            description="Categorias de produtos de crédito"
                            apiUrl="/api/auxiliary/loan-types"
                        />
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white transition-all hover:shadow-md h-full">
                    <CardContent className="h-full p-0 flex flex-col justify-between">
                        <AuxiliarySection
                            title="Grupos"
                            description="Agrupamentos de tabelas"
                            apiUrl="/api/auxiliary/loan-groups"
                        />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border border-slate-100 shadow-sm rounded-2xl bg-white transition-all hover:shadow-md h-full">
                    <CardContent className="h-full p-0 flex flex-col justify-between">
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
