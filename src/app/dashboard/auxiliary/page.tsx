"use client";

import { AuxiliarySection } from "@/modules/auxiliary/presentation/components/AuxiliarySection";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function AuxiliaryPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Header Premium com Gradiente ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl shadow-indigo-200/40">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white/5 blur-xl" />
                    <div className="absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-indigo-400/20 blur-xl" />
                </div>
                <div className="relative flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 shadow-inner">
                        <Database className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">Cadastros Auxiliares</h1>
                        <p className="mt-1 text-blue-100/90 font-medium">Gerencie as entidades auxiliares utilizadas em todo o sistema.</p>
                    </div>
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
