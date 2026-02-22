"use client";

import { useState, useEffect } from "react";
import { LoanList } from "@/modules/loans/presentation/components/LoanList";
import { LoanForm } from "@/modules/loans/presentation/components/LoanForm";
import { Loan } from "@/modules/loans/domain/entities";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HandCoins, FileText, PlusCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function LoansPage() {
    const [loans, setLoans] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | undefined>();
    const [loading, setLoading] = useState(true);
    const [userLevel, setUserLevel] = useState<number | null>(null);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/loans");
            if (response.ok) {
                const data = await response.json();
                setLoans(data);
            }

            const profileRes = await fetch("/api/profile");
            const profileData = await profileRes.json();
            if (profileData.nivelAcesso) setUserLevel(profileData.nivelAcesso);
        } catch (error) {
            toast.error("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleEdit = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este registro?")) return;

        try {
            const response = await fetch(`/api/loans/${id}`, { method: "DELETE" });
            if (response.ok) {
                toast.success("Registro excluído");
                fetchLoans();
            }
        } catch (error) {
            toast.error("Erro ao excluir registro");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Header Premium com Gradiente ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl shadow-indigo-200/40">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white/5 blur-xl" />
                    <div className="absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-indigo-400/20 blur-xl" />
                </div>
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 shadow-inner">
                            <HandCoins className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">Vendas (Empréstimos)</h1>
                            <p className="mt-1 text-blue-100/90 font-medium">
                                Gerencie as propostas e contratos de empréstimos registrados no sistema.
                            </p>
                        </div>
                    </div>
                    {userLevel !== 3 && (
                        <Button
                            onClick={() => {
                                setSelectedLoan(undefined);
                                setIsDialogOpen(true);
                            }}
                            className="gap-2 rounded-xl bg-white text-indigo-700 font-semibold shadow-lg shadow-indigo-900/20 hover:bg-blue-50 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-none px-5 py-2.5"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Nova Venda
                        </Button>
                    )}
                </div>
                {/* Mini stats */}
                <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <FileText className="h-5 w-5 text-blue-200" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Total</p>
                            <p className="text-lg font-bold text-white">{loading ? "..." : loans.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <CheckCircle className="h-5 w-5 text-emerald-300" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Ativos</p>
                            <p className="text-lg font-bold text-white">{loading ? "..." : loans.filter(l => l.status === 'ATIVO' || l.status === 'APROVADO').length}</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <PlusCircle className="h-5 w-5 text-amber-300" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Novos (mês)</p>
                            <p className="text-lg font-bold text-white">
                                {loading ? "..." : loans.filter(l => {
                                    if (!l.createdAt) return false;
                                    const now = new Date();
                                    const created = new Date(l.createdAt);
                                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600"></div>
                        <span className="text-sm font-medium text-slate-400">Carregando vendas...</span>
                    </div>
                </div>
            ) : (
                <LoanList
                    loans={loans}
                    userLevel={userLevel || 0}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    {/* Gradient Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
                            <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/5 blur-lg" />
                        </div>
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                                <HandCoins className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white">
                                    {selectedLoan ? "Editar Venda" : "Registrar Nova Venda"}
                                </DialogTitle>
                                <DialogDescription className="text-blue-100/80 text-sm mt-0.5">
                                    Preencha os dados do contrato abaixo.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    {/* Scrollable Form Body */}
                    <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 py-4">
                        <LoanForm
                            initialData={selectedLoan}
                            onSuccess={() => {
                                setIsDialogOpen(false);
                                fetchLoans();
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
