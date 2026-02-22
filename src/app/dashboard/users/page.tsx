"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UserList } from "@/modules/users/presentation/components/UserList";
import { UserForm } from "@/modules/users/presentation/components/UserForm";
import { User } from "@/modules/users/domain/entities";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserLevel, setCurrentUserLevel] = useState<number | null>(null);

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
        } catch (error: any) {
            toast.error("Erro ao carregar dados: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (values: any) => {
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
                toast.success(selectedUser ? "Usuário atualizado!" : "Usuário criado!");
                setIsDialogOpen(false);
                fetchUsers();
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
        if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success("Usuário excluído!");
                fetchUsers();
            } else {
                const errorData = await response.json();
                toast.error("Erro: " + errorData.error);
            }
        } catch (error: any) {
            toast.error("Erro ao excluir: " + error.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.usuario.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl border border-slate-200 backdrop-blur-sm shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Users className="h-8 w-8 text-indigo-600" />
                        Gerenciamento de Usuários
                    </h1>
                    <p className="text-slate-500 mt-1">Administre os acessos e horários dos colaboradores.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => {
                            setSelectedUser(null);
                            setIsDialogOpen(true);
                        }}
                        className="gap-2 rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 transition-all font-medium px-4"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Usuário
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-lg rounded-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar usuários..."
                                className="pl-10 rounded-xl"
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
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>{selectedUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                        <DialogDescription>
                            {selectedUser
                                ? "Atualize os dados do colaborador abaixo."
                                : "Preencha os dados para cadastrar um novo colaborador."}
                        </DialogDescription>
                    </DialogHeader>
                    <UserForm
                        initialData={selectedUser}
                        onSubmit={handleCreateOrUpdate}
                        isLoading={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
