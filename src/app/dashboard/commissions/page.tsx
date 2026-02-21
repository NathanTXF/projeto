"use client";

import { useState, useEffect } from "react";
import { CommissionList } from "@/modules/commissions/presentation/components/CommissionList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("");

    const fetchCommissions = async (mesAno?: string) => {
        try {
            setLoading(true);
            const url = mesAno ? `/api/commissions?mesAno=${mesAno}` : "/api/commissions";
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setCommissions(data);
            }
        } catch (error) {
            toast.error("Erro ao carregar comissões");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`/api/commissions/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ action: "APPROVE" }),
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                toast.success("Comissão aprovada!");
                fetchCommissions(period);
            }
        } catch (error) {
            toast.error("Erro ao aprovar comissão");
        }
    };

    const handleCancel = async (id: string) => {
        try {
            const response = await fetch(`/api/commissions/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ action: "CANCEL" }),
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                toast.success("Comissão cancelada");
                fetchCommissions(period);
            }
        } catch (error) {
            toast.error("Erro ao cancelar comissão");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Comissões</h1>
                <p className="text-muted-foreground">
                    Gestão e aprovação de comissões por período e vendedor.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-emerald-50 border-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-900">Total a Pagar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                commissions.filter(c => c.status === 'APROVADO').reduce((acc, c) => acc + Number(c.valorCalculado), 0)
                            )}
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">Comissões aprovadas</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-900">Pendente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                commissions.filter(c => c.status === 'EM_ABERTO').reduce((acc, c) => acc + Number(c.valorCalculado), 0)
                            )}
                        </div>
                        <p className="text-xs text-amber-600 mt-1">Aguardando aprovação</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Listagem de Comissões</CardTitle>
                            <CardDescription>Visualize e gerencie os pagamentos pendentes.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <CommissionList
                            commissions={commissions}
                            onApprove={handleApprove}
                            onCancel={handleCancel}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
