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
import { Plus } from "lucide-react";
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl border border-slate-200 backdrop-blur-sm shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Vendas (Empréstimos)</h1>
                    <p className="text-slate-500 mt-1">
                        Gerencie as propostas e contratos de empréstimos registrados no sistema.
                    </p>
                </div>
                {userLevel !== 3 && (
                    <Button
                        onClick={() => {
                            setSelectedLoan(undefined);
                            setIsDialogOpen(true);
                        }}
                        className="gap-2 rounded-xl shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-none"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Venda
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedLoan ? "Editar Venda" : "Registrar Nova Venda"}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados do contrato abaixo.
                        </DialogDescription>
                    </DialogHeader>
                    <LoanForm
                        initialData={selectedLoan}
                        onSuccess={() => {
                            setIsDialogOpen(false);
                            fetchLoans();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
