"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Search, Loader2, ShieldPlus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { KpiCard } from "@/components/layout/KpiCard";
import { ManagementPageHeader } from "@/components/layout/ManagementPageHeader";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { RoleList } from "@/app/dashboard/roles/components/RoleList";
import { RoleForm } from "@/app/dashboard/roles/components/RoleForm";
import { Role } from "@/modules/roles/domain/entities";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { SystemIntegrityAlert } from "@/components/shared/SystemIntegrityAlert";

type RoleUpsertPayload = Record<string, unknown>;

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modern modal states
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isIntegrityAlertOpen, setIsIntegrityAlertOpen] = useState(false);
    const [roleIdToDelete, setRoleIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [integrityErrorMessage, setIntegrityErrorMessage] = useState("");

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
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha inesperada";
            toast.error("Erro na requisição: " + message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (values: RoleUpsertPayload) => {
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
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha inesperada";
            toast.error("Erro na requisição: " + message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        setRoleIdToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!roleIdToDelete) return;

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/roles/${roleIdToDelete}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Perfil excluído!");
                setIsDeleteConfirmOpen(false);
                setRoleIdToDelete(null);
                fetchRoles();
            } else {
                let errorMessage = "Este perfil não pode ser excluído pois possui usuários vinculados ou permissões críticas.";
                try {
                    const errorData = await response.json();
                    if (errorData.error) errorMessage = errorData.error;
                } catch { }

                if (response.status === 400) {
                    setIntegrityErrorMessage(errorMessage);
                    setIsIntegrityAlertOpen(true);
                    setIsDeleteConfirmOpen(false);
                } else {
                    toast.error(errorMessage);
                }
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha inesperada";
            toast.error("Erro ao excluir: " + message);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalRoles = roles.length;
    const visibleRoles = filteredRoles.length;

    return (
        <div className="space-y-7 animate-in fade-in duration-500 pb-12">
            <ManagementPageHeader
                icon={ShieldAlert}
                title="Perfis e Permissões"
                description="Controle de acesso granular (RBAC) do sistema."
                action={{
                    label: "Novo Perfil",
                    icon: ShieldPlus,
                    onClick: () => {
                        setSelectedRole(null);
                        setIsDialogOpen(true);
                    },
                    variant: "secondary",
                }}
                stats={(
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <KpiCard title="Perfis" value={loading ? "..." : totalRoles} icon={ShieldAlert} tone="primary" subtitle="Cadastrados" />
                        <KpiCard title="Visíveis" value={loading ? "..." : visibleRoles} icon={Search} tone="neutral" subtitle="Resultado do filtro" />
                        <KpiCard title="Governança" value="100%" icon={ShieldPlus} tone="emerald" subtitle="RBAC ativo" />
                    </div>
                )}
            />

            <Card className="border border-border/70 shadow-sm rounded-xl bg-card overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/70 pb-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar perfil..."
                                className="pl-10 h-10 ui-focus-ring"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Badge className="h-10 px-3 rounded-md bg-muted text-muted-foreground border border-border/70 text-[11px] font-medium whitespace-nowrap">
                            {visibleRoles} de {totalRoles}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span>Carregando perfis...</span>
                        </div>
                    ) : (
                        <RoleList
                            roles={filteredRoles}
                            onEdit={(role: Role) => {
                                setSelectedRole(role);
                                setIsDialogOpen(true);
                            }}
                            onDelete={handleDelete}
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-xl bg-card">
                    {/* Solid Sidebar Header */}
                    <div className="relative bg-sidebar px-6 py-5">
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 shadow-inner">
                                <ShieldAlert className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold text-sidebar-foreground leading-none">
                                    {selectedRole ? "Editar Perfil" : "Novo Perfil"}
                                </DialogTitle>
                                <DialogDescription className="text-sidebar-foreground/80 text-sm mt-1">
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

            <DeleteConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                itemName="perfil"
            />

            <SystemIntegrityAlert
                open={isIntegrityAlertOpen}
                onOpenChange={setIsIntegrityAlertOpen}
                message={integrityErrorMessage}
            />
        </div>
    );
}
