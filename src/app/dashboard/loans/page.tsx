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

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/loans");
            if (response.ok) {
                const data = await response.json();
                setLoans(data);
            }
        } catch (error) {
            toast.error("Erro ao carregar empréstimos");
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vendas (Empréstimos)</h1>
                    <p className="text-muted-foreground">
                        Gerencie as propostas e contratos de empréstimos registrados no sistema.
                    </p>
                </div>
                <Button onClick={() => {
                    setSelectedLoan(undefined);
                    setIsDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Venda
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <LoanList
                    loans={loans}
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
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
