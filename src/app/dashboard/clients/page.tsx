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
            {/* ── Header Premium com Gradiente ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl shadow-indigo-200/40">
                {/* Padrão decorativo de fundo */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white/5 blur-xl" />
                    <div className="absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-indigo-400/20 blur-xl" />
                </div>

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 shadow-inner">
                            <Users className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">
                                Clientes
                            </h1>
                            <p className="mt-1 text-blue-100/90 font-medium">
                                Gerencie o cadastro de seus clientes e visualize suas informações.
                            </p>
                        </div>
                    </div>

                    {userLevel !== 3 && (
                        <Button
                            onClick={() => {
                                setSelectedCustomer(undefined);
                                setIsDialogOpen(true);
                            }}
                            className="gap-2 rounded-xl bg-white text-indigo-700 font-semibold shadow-lg shadow-indigo-900/20 hover:bg-blue-50 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-none px-5 py-2.5"
                        >
                            <UserPlus className="h-4 w-4" />
                            Novo Cliente
                        </Button>
                    )}
                </div>

                {/* Mini stats strip */}
                <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <Users className="h-5 w-5 text-blue-200" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Total</p>
                            <p className="text-lg font-bold text-white">{loading ? "..." : customers.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <UserCheck className="h-5 w-5 text-emerald-300" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Ativos</p>
                            <p className="text-lg font-bold text-white">{loading ? "..." : customers.length}</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <UserPlus className="h-5 w-5 text-amber-300" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Novos (mês)</p>
                            <p className="text-lg font-bold text-white">
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
                    {/* Gradient Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
                            <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/5 blur-lg" />
                        </div>
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white">
                                    {selectedCustomer ? "Editar Cliente" : "Novo Cliente"}
                                </DialogTitle>
                                <DialogDescription className="text-blue-100/80 text-sm mt-0.5">
                                    Preencha os dados abaixo para {selectedCustomer ? "atualizar" : "cadastrar"} o cliente.
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
