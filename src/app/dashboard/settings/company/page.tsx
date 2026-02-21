"use client";

import { useState, useEffect } from "react";
import { Building2, Save, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { CompanyForm } from "@/modules/company/presentation/components/CompanyForm";

export default function CompanySettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/company');
            const data = await response.json();
            setSettings(data);
        } catch (error: any) {
            toast.error("Erro ao carregar configurações: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: any) => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast.success("Configurações atualizadas!");
                fetchSettings();
            } else {
                const errorData = await response.json();
                toast.error("Erro: " + errorData.error);
            }
        } catch (error: any) {
            toast.error("Erro na requisição: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span>Carregando configurações...</span>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <Building2 className="h-8 w-8 text-indigo-600" />
                    Dados da Empresa
                </h1>
                <p className="text-slate-500">Configure as informações institucionais e identidade visual.</p>
            </div>

            <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Informações Gerais</CardTitle>
                            <CardDescription>Estes dados serão usados em cabeçalhos e relatórios.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <CompanyForm
                        initialData={settings}
                        onSubmit={handleUpdate}
                        isLoading={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
