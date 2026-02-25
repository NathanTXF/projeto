"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CustomerList } from "@/modules/clients/presentation/components/CustomerList";
import { CustomerForm } from "@/modules/clients/presentation/components/CustomerForm";
import { Customer } from "@/modules/clients/domain/entities";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserCheck, UserPlus, Trash2, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/ui/ExportButton";
import { exportToCsv, exportToPdf, ExportColumn } from "@/lib/exportUtils";

function ClientsContent() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
    const [loading, setLoading] = useState(true);
    const [userLevel, setUserLevel] = useState<number | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isIntegrityAlertOpen, setIsIntegrityAlertOpen] = useState(false);
    const [integrityErrorMessage, setIntegrityErrorMessage] = useState("");
    const [customerIdToDelete, setCustomerIdToDelete] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const searchParams = useSearchParams();
    const vendedorId = searchParams.get("vendedorId");

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const query = vendedorId ? `?vendedorId=${vendedorId}` : "";
            const response = await fetch(`/api/clients${query}`);
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
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
        fetchCustomers();
    }, [vendedorId]);

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setCustomerIdToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!customerIdToDelete) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/clients/${customerIdToDelete}`, { method: "DELETE" });

            if (response.ok) {
                toast.success("Cliente excluído com sucesso!");
                setIsDeleteConfirmOpen(false);
                setCustomerIdToDelete(null);
                fetchCustomers();
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

    const exportColumns: ExportColumn<Customer>[] = [
        { header: "Cód.", accessor: (c) => c.cod || "-" },
        { header: "Nome", accessor: (c) => c.nome },
        { header: "CPF/CNPJ", accessor: (c) => c.cpfCnpj },
        { header: "E-mail", accessor: (c) => c.email || "-" },
        { header: "Celular", accessor: (c) => c.celular },
        { header: "Gênero", accessor: (c) => c.sexo === 'masculino' ? 'Masculino' : c.sexo === 'feminino' ? 'Feminino' : "-" },
        { header: "Nascimento", accessor: (c) => c.dataNascimento ? new Date(c.dataNascimento).toLocaleDateString("pt-BR") : "-" },
        { header: "Localidade", accessor: (c) => `${c.cidade}/${c.estado}` },
        { header: "Bairro", accessor: (c) => c.bairro || "-" },
        { header: "Matrícula", accessor: (c) => c.matricula || "-" },
        { header: "Observação", accessor: (c) => c.observacao ? c.observacao.substring(0, 30) + '...' : "-" },
        { header: "Cadastrado em", accessor: (c) => c.createdAt ? new Date(c.createdAt).toLocaleDateString("pt-BR") : "-" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#00355E] p-8 shadow-sm">
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                            <Users className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">
                                Clientes
                            </h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-sm">
                                Gerencie o cadastro corporativo de clientes e análise de crédito.
                            </p>
                        </div>
                    </div>

                    {userLevel !== 3 && (
                        <div className="flex gap-3">
                            <ExportButton
                                onExportCsv={() => exportToCsv("clientes", exportColumns, customers)}
                                onExportPdf={() => exportToPdf("Relatório de Clientes", "clientes", exportColumns, customers)}
                            />
                            <Button
                                onClick={() => {
                                    setSelectedCustomer(undefined);
                                    setIsDialogOpen(true);
                                }}
                                variant="secondary"
                                className="gap-2 rounded-xl font-bold shadow-sm px-6 py-3 transition-all active:scale-95"
                            >
                                <UserPlus className="h-5 w-5" />
                                Novo Cliente
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mini stats strip */}
                <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <Users className="h-6 w-6 text-primary-foreground/60" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Total</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{loading ? "..." : customers.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <UserCheck className="h-6 w-6 text-primary" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Ativos</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{loading ? "..." : customers.length}</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <UserPlus className="h-6 w-6 text-amber-400" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Novos (mês)</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">
                                {loading ? "..." : customers.filter(c => {
                                    if (!c.createdAt) return false;
                                    const now = new Date();
                                    const created = new Date(c.createdAt);
                                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Lista de Clientes ── */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
                        <span className="text-sm font-medium text-slate-400">Carregando clientes...</span>
                    </div>
                </div>
            ) : (
                <CustomerList
                    customers={customers}
                    userLevel={userLevel || 0}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* ── Dialog Novo/Editar Cliente ── */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <div className="relative bg-primary px-6 py-5">
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                                <Users className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-primary-foreground leading-none">
                                    {selectedCustomer ? "Editar Cliente" : "Novo Cliente"}
                                </DialogTitle>
                                <DialogDescription className="text-primary-foreground/80 text-sm mt-1">
                                    Preencha os dados abaixo para {selectedCustomer ? "atualizar" : "cadastrar"} o cadastro corporativo.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 py-4">
                        <CustomerForm
                            initialData={selectedCustomer}
                            onSuccess={() => {
                                setIsDialogOpen(false);
                                fetchCustomers();
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
                                <DialogTitle className="text-lg font-bold text-white leading-none">Excluir Cliente</DialogTitle>
                                <DialogDescription className="text-white/80 text-sm mt-1">
                                    Esta ação é permanente e irreversível.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-600 font-medium mb-6">
                            Tem certeza que deseja remover este cliente do sistema? Todos os dados básicos serão apagados.
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
                                    Integridade referencial do sistema.
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
                        <p className="text-slate-500 text-sm mb-6 text-center italic">
                            Dica: Remova as vendas associadas antes de tentar excluir o cliente.
                        </p>
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

export default function ClientsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
            </div>
        }>
            <ClientsContent />
        </Suspense>
    );
}
