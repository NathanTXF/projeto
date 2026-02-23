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
            <div className="h-[400px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="font-medium">Carregando configurações...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-sm">
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                            <Building2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Configurações da Empresa</h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-sm">Gerencie a identidade visual e dados institucionais da plataforma.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border border-border shadow-md rounded-2xl overflow-hidden bg-card">
                <CardHeader className="bg-muted/30 border-b border-border p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold">Informações Institucionais</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium text-xs">Dados utilizados em cabeçalhos, contratos e relatórios.</CardDescription>
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
