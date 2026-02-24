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
import { ExportButton } from "@/components/ui/ExportButton";
import { exportToCsv, exportToPdf, ExportColumn } from "@/lib/exportUtils";

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
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-sm">
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
                <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <FileText className="h-6 w-6 text-primary-foreground/60" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Total</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{loading ? "..." : loans.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <CheckCircle className="h-6 w-6 text-emerald-400" />
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
                <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    {/* Solid Blue Header */}
                    <div className="relative bg-blue-600 px-6 py-5">
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                                <HandCoins className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white leading-none">
                                    {selectedLoan ? "Editar Venda" : "Registrar Nova Venda"}
                                </DialogTitle>
                                <DialogDescription className="text-blue-100 text-sm mt-1">
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
