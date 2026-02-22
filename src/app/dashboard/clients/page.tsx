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
import { Plus } from "lucide-react";
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl border border-slate-200 backdrop-blur-sm shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Clientes</h1>
                    <p className="text-slate-500 mt-1">
                        Gerencie o cadastro de seus clientes e visualize suas informações.
                    </p>
                </div>
                {userLevel !== 3 && (
                    <Button
                        onClick={() => {
                            setSelectedCustomer(undefined);
                            setIsDialogOpen(true);
                        }}
                        className="gap-2 rounded-xl shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-none"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Cliente
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <CustomerList
                    customers={customers}
                    userLevel={userLevel || 0}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCustomer ? "Editar Cliente" : "Novo Cliente"}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados abaixo para {selectedCustomer ? "atualizar" : "cadastrar"} o cliente.
                        </DialogDescription>
                    </DialogHeader>
                    <CustomerForm
                        initialData={selectedCustomer}
                        onSuccess={() => {
                            setIsDialogOpen(false);
                            fetchCustomers();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
