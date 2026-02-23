"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Search, Loader2, ShieldPlus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { RoleList } from "./components/RoleList";
import { RoleForm } from "./components/RoleForm";
import { Role } from "@/modules/roles/domain/entities";

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/roles');
            const data = await response.json();
            if (response.ok) {
                setRoles(data);
            } else {
                toast.error("Erro ao carregar perfis: " + data.error);
            }
        } catch (error: any) {
            toast.error("Erro na requisição: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (values: any) => {
        try {
            setIsSubmitting(true);
            const url = selectedRole ? `/api/roles/${selectedRole.id}` : '/api/roles';
            const method = selectedRole ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                toast.success(selectedRole ? "Perfil atualizado!" : "Perfil criado!");
                setIsDialogOpen(false);
                fetchRoles();
            } else {
                const errorData = await response.json();
                toast.error("Erro: " + errorData.error);
            }
        } catch (error: any) {
            toast.error("Erro na requisição: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este perfil?")) return;

        try {
            const response = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Perfil excluído!");
                fetchRoles();
            } else {
                const errorData = await response.json();
                toast.error("Erro: " + errorData.error);
            }
        } catch (error: any) {
            toast.error("Erro ao excluir: " + error.message);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-8 shadow-sm">
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
                            <ShieldAlert className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">Perfis e Permissões</h1>
                            <p className="mt-1 text-indigo-100 font-medium">Controle de acesso granular (RBAC) do sistema.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedRole(null);
                            setIsDialogOpen(true);
                        }}
                        className="gap-2 rounded-xl bg-white text-indigo-700 font-bold shadow-sm hover:bg-indigo-50 transition-all duration-200 active:scale-95 border-none px-6 py-3"
                    >
                        <ShieldPlus className="h-5 w-5" />
                        Novo Perfil
                    </Button>
                </div>
                {/* Mini stats */}
                <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-4 border border-white/10">
                        <ShieldAlert className="h-6 w-6 text-indigo-200" />
                        <div>
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest leading-none mb-1">Total de Perfis</p>
                            <p className="text-xl font-black text-white leading-none">{loading ? "..." : roles.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar perfil..."
                                className="pl-10 rounded-xl bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <span>Carregando perfis...</span>
                        </div>
                    ) : (
                        <RoleList
                            roles={filteredRoles}
                            onEdit={(role) => {
                                setSelectedRole(role);
                                setIsDialogOpen(true);
                            }}
                            onDelete={handleDelete}
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-slate-50">
                    {/* Solid Indigo Header */}
                    <div className="relative bg-indigo-600 px-6 py-5">
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                                <ShieldAlert className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white leading-none">
                                    {selectedRole ? "Editar Perfil" : "Novo Perfil"}
                                </DialogTitle>
                                <DialogDescription className="text-indigo-100 text-sm mt-1">
                                    {selectedRole
                                        ? "Altere o nome e as permissões."
                                        : "Crie um novo perfil definindo suas permissões."}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    {/* Scrollable Form Body */}
                    <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 py-4">
                        <RoleForm
                            initialData={selectedRole}
                            onSubmit={handleCreateOrUpdate}
                            isLoading={isSubmitting}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
