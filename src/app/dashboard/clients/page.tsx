"use client";

import { useState, useEffect } from "react";
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
import { Plus, Users, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function ClientsPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
    const [loading, setLoading] = useState(true);
    const [userLevel, setUserLevel] = useState<number | null>(null);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/clients");
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
    }, []);

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

        try {
            const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });
            if (response.ok) {
                toast.success("Cliente excluído");
                fetchCustomers();
            }
        } catch (error) {
            toast.error("Erro ao excluir cliente");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-sm">
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
                    )}
                </div>

                {/* Mini stats strip */}
                <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <Users className="h-6 w-6 text-primary-foreground/60" />
                        <div>
                            <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Total</p>
                            <p className="text-xl font-black text-primary-foreground leading-none">{loading ? "..." : customers.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                        <UserCheck className="h-6 w-6 text-emerald-400" />
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
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600"></div>
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
                    {/* Solid Primary Header */}
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
                    {/* Scrollable Form Body */}
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
        </div>
    );
}
