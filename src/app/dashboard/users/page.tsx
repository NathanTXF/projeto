"use client";

import { useState, useEffect } from "react";
import { Users, Search, Loader2, UserPlus, Shield } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { ManagementPageHeader } from "@/components/layout/ManagementPageHeader";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { UserList } from "@/modules/users/presentation/components/UserList";
import { UserForm } from "@/modules/users/presentation/components/UserForm";
import { User } from "@/modules/users/domain/entities";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { SystemIntegrityAlert } from "@/components/shared/SystemIntegrityAlert";

type UserUpsertPayload = Record<string, unknown>;

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserLevel, setCurrentUserLevel] = useState<number | null>(null);

    // Modern modal states
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isIntegrityAlertOpen, setIsIntegrityAlertOpen] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [integrityErrorMessage, setIntegrityErrorMessage] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setUsers(data);

            const profileRes = await fetch('/api/profile');
            const profileData = await profileRes.json();
            if (profileData.nivelAcesso) setCurrentUserLevel(profileData.nivelAcesso);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha inesperada";
            toast.error("Erro ao carregar dados: " + message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (values: UserUpsertPayload) => {
        try {
            setIsSubmitting(true);
            const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
            const method = selectedUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                const data = await response.json();
                setIsDialogOpen(false);
                fetchUsers();
                if (!selectedUser && data._senhaGerada) {
                    // Senha gerada automaticamente — exibe ao admin
                    toast.success(`✅ Usuário criado! Senha gerada: ${data._senhaGerada}`, {
                        duration: 15000,
                        description: 'Anote esta senha e compartilhe com o usuário. Ela não será exibida novamente.',
                    });
                } else {
                    toast.success(selectedUser ? "Usuário atualizado!" : "Usuário criado!");
                }
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
        setUserIdToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!userIdToDelete) return;

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/users/${userIdToDelete}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Usuário excluído com sucesso!");
                setIsDeleteConfirmOpen(false);
                setUserIdToDelete(null);
                fetchUsers();
            } else {
                let errorMessage = "Este usuário não pode ser excluído pois possui registros vinculados no sistema.";
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
            toast.error("Erro na requisição: " + message);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.usuario.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-7 animate-in fade-in duration-500 pb-12">
            <ManagementPageHeader
                icon={Users}
                title="Gerenciamento de Usuários"
                description="Administre os acessos corporativos e permissões do sistema."
                action={{
                    label: "Novo Usuário",
                    icon: UserPlus,
                    onClick: () => {
                        setSelectedUser(null);
                        setIsDialogOpen(true);
                    },
                    variant: "secondary",
                }}
                stats={(
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="ui-lift flex items-center gap-3 rounded-lg bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                            <Users className="h-6 w-6 text-primary-foreground/60" />
                            <div>
                                <p className="text-[10px] font-medium text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Total</p>
                                <p className="text-xl font-semibold text-primary-foreground leading-none">{loading ? "..." : users.length}</p>
                            </div>
                        </div>
                        <div className="ui-lift flex items-center gap-3 rounded-lg bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                            <Shield className="h-6 w-6 text-primary" />
                            <div>
                                <p className="text-[10px] font-medium text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Admins</p>
                                <p className="text-xl font-semibold text-primary-foreground leading-none">{loading ? "..." : users.filter((user) => user.nivelAcesso === 1).length}</p>
                            </div>
                        </div>
                        <div className="ui-lift hidden sm:flex items-center gap-3 rounded-lg bg-primary-foreground/10 px-5 py-4 border border-primary-foreground/10">
                            <UserPlus className="h-6 w-6 text-amber-400" />
                            <div>
                                <p className="text-[10px] font-medium text-primary-foreground/80 uppercase tracking-widest leading-none mb-1.5">Vendedores</p>
                                <p className="text-xl font-semibold text-primary-foreground leading-none">{loading ? "..." : users.filter((user) => user.nivelAcesso !== 1).length}</p>
                            </div>
                        </div>
                    </div>
                )}
            />

            <Card className="border border-border/70 shadow-sm rounded-xl bg-card overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/70 pb-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar usuários..."
                                className="pl-10 h-10 ui-focus-ring"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Badge className="h-10 px-3 rounded-md bg-muted text-muted-foreground border border-border/70 text-[11px] font-medium whitespace-nowrap">
                            {filteredUsers.length} de {users.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground font-medium">
                            <Loader2 className="h-8 w-8 animate-spin text-sidebar" />
                            <span>Carregando usuários...</span>
                        </div>
                    ) : (
                        <UserList
                            users={filteredUsers}
                            userLevel={currentUserLevel || 0}
                            onEdit={(user) => {
                                setSelectedUser(user);
                                setIsDialogOpen(true);
                            }}
                            onDelete={handleDelete}
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-xl">
                    {/* Solid Primary Header */}
                    <div className="relative bg-primary px-6 py-5">
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 shadow-inner">
                                <Users className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold text-primary-foreground leading-none">
                                    {selectedUser ? "Editar Usuário" : "Novo Usuário"}
                                </DialogTitle>
                                <DialogDescription className="text-primary-foreground/80 text-sm mt-1">
                                    {selectedUser
                                        ? "Atualize as permissões corporativas do colaborador."
                                        : "Cadastre um novo colaborador com acesso restrito."}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    {/* Scrollable Form Body */}
                    <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 py-4">
                        <UserForm
                            initialData={selectedUser}
                            onSubmit={handleCreateOrUpdate}
                            isLoading={isSubmitting}
                            isAdmin={currentUserLevel === 1}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                itemName="usuário"
            />

            <SystemIntegrityAlert
                open={isIntegrityAlertOpen}
                onOpenChange={setIsIntegrityAlertOpen}
                message={integrityErrorMessage}
            />
        </div>
    );
}
