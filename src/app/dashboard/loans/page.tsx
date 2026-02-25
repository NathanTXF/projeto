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
import { HandCoins, FileText, PlusCircle, CheckCircle, Trash2, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/ui/ExportButton";
import { exportToCsv, exportToPdf, ExportColumn } from "@/lib/exportUtils";

export default function LoansPage() {
    const [loans, setLoans] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | undefined>();
    const [loading, setLoading] = useState(true);
    const [userLevel, setUserLevel] = useState<number | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isIntegrityAlertOpen, setIsIntegrityAlertOpen] = useState(false);
    const [integrityErrorMessage, setIntegrityErrorMessage] = useState("");
    const [loanIdToDelete, setLoanIdToDelete] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleDelete = (id: string) => {
        setLoanIdToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!loanIdToDelete) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/loans/${loanIdToDelete}`, { method: "DELETE" });
            if (response.ok) {
                toast.success("Registro excluído com sucesso!");
                setIsDeleteConfirmOpen(false);
                setLoanIdToDelete(null);
                fetchLoans();
            } else {
                let errorMessage = "Erro desconhecido ao excluir.";
                try {
                    const errorData = await response.json();
                    if (errorData.error) errorMessage = errorData.error;
                } catch (e) { }

                if (response.status === 400) {
                    setIntegrityErrorMessage(errorMessage);
                    setIsIntegrityAlertOpen(true);
                    setIsDeleteConfirmOpen(false);
                } else {
                    toast.error(errorMessage);
                }
            }
        } catch (error: any) {
            toast.error("Erro na requisição: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const exportColumns: ExportColumn<any>[] = [
        { header: "Cód.", accessor: (l) => l.cod || "-" },
        { header: "Cliente", accessor: (l) => l.clienteNome || "Desconhecido" },
        { header: "CPF", accessor: (l) => l.clienteCpf || "-" },
        { header: "Banco", accessor: (l) => l.bancoNome || "-" },
        { header: "Produto/Tabela", accessor: (l) => `${l.tipoNome || '-'} - ${l.tabelaNome || '-'}` },
        { header: "Prazo", accessor: (l) => l.prazo ? `${l.prazo}x` : "-" },
        { header: "Vl. Parcela", accessor: (l) => `R$ ${Number(l.valorParcela || 0).toFixed(2)}` },
        { header: "Vl. Bruto", accessor: (l) => `R$ ${Number(l.valorBruto || 0).toFixed(2)}` },
        { header: "Vl. Líquido", accessor: (l) => `R$ ${Number(l.valorLiquido || 0).toFixed(2)}` },
        { header: "Vendedor", accessor: (l) => l.vendedorNome || "-" },
        { header: "Status", accessor: (l) => l.status || "-" },
        { header: "Registrado em", accessor: (l) => l.dataEmprestimo ? new Date(l.dataEmprestimo).toLocaleDateString('pt-BR') : "-" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#00355E] p-8 shadow-sm">
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                            <HandCoins className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Vendas (Empréstimos)</h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-sm">
                                Gerencie as propostas e contratos de empréstimos registrados no sistema.
                            </p>
                        </div>
                    </div>
                    {userLevel !== 3 && (
                        <div className="flex gap-3">
                            <ExportButton
                                onExportCsv={() => exportToCsv("contratos", exportColumns, loans)}
                                onExportPdf={() => exportToPdf("Relatório de Contratos", "contratos", exportColumns, loans)}
                            />
                            <Button
                                onClick={() => {
                                    setSelectedLoan(undefined);
                                    setIsDialogOpen(true);
                                }}
                                variant="secondary"
                                className="gap-2 rounded-xl font-bold shadow-sm px-6 py-3 transition-all active:scale-95"
                            >
                                <PlusCircle className="h-5 w-5" />
                                Nova Venda
                            </Button>
                        </div>
                    )}
                </div>
                {/* Mini stats */}
                <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <FileText className="h-6 w-6 text-primary-foreground/60" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Total</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{loading ? "..." : loans.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <CheckCircle className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Ativos</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{loading ? "..." : loans.filter(l => l.status === 'ATIVO' || l.status === 'APROVADO').length}</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <PlusCircle className="h-6 w-6 text-amber-400" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Novos (mês)</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">
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
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
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
                <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    {/* Solid Primary Header */}
                    <div className="relative bg-primary px-6 py-5">
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                                <HandCoins className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-primary-foreground leading-none">
                                    {selectedLoan ? "Editar Venda" : "Registrar Nova Venda"}
                                </DialogTitle>
                                <DialogDescription className="text-primary-foreground/80 text-sm mt-1">
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

            {/* ── Modal de Confirmação de Exclusão ── */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <div className="bg-rose-600 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                                <Trash2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white leading-none">Excluir Venda</DialogTitle>
                                <DialogDescription className="text-white/80 text-sm mt-1">
                                    Esta ação removerá o contrato permanentemente.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-600 font-medium mb-6">
                            Tem certeza que deseja remover esta venda do sistema? Isso afetará o cálculo de comissões futuras.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="rounded-xl border-slate-200 text-slate-600 font-bold order-2 sm:order-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-100 border-none font-bold gap-2 order-1 sm:order-2"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Confirmar Exclusão
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Modal de Alerta de Integridade (Bloqueio) ── */}
            <Dialog open={isIntegrityAlertOpen} onOpenChange={setIsIntegrityAlertOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <div className="bg-amber-500 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white leading-none">Ação Bloqueada</DialogTitle>
                                <DialogDescription className="text-white/80 text-sm mt-1">
                                    Segurança de dados do sistema.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100 mb-6">
                            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                            <div>
                                <p className="font-bold text-amber-900 mb-1">Não é possível excluir</p>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    {integrityErrorMessage}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsIntegrityAlertOpen(false)}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold py-6"
                        >
                            Compreendido
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
