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

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/clients");
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            }
        } catch (error) {
            toast.error("Erro ao carregar clientes");
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground">
                        Gerencie o cadastro de seus clientes e visualize suas informações.
                    </p>
                </div>
                <Button onClick={() => {
                    setSelectedCustomer(undefined);
                    setIsDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cliente
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <CustomerList
                    customers={customers}
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
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
