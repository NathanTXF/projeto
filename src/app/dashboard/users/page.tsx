"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Search, Loader2, UserPlus, Shield } from "lucide-react";
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Header Premium com Gradiente ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl shadow-indigo-200/40">
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
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">Gerenciamento de Usuários</h1>
                            <p className="mt-1 text-blue-100/90 font-medium">Administre os acessos e horários dos colaboradores.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedUser(null);
                            setIsDialogOpen(true);
                        }}
                        className="gap-2 rounded-xl bg-white text-indigo-700 font-semibold shadow-lg shadow-indigo-900/20 hover:bg-blue-50 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-none px-5 py-2.5"
                    >
                        <UserPlus className="h-4 w-4" />
                        Novo Usuário
                    </Button>
                </div>
                {/* Mini stats */}
                <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <Users className="h-5 w-5 text-blue-200" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Total</p>
                            <p className="text-lg font-bold text-white">{loading ? "..." : users.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <Shield className="h-5 w-5 text-emerald-300" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Admins</p>
                            <p className="text-lg font-bold text-white">{loading ? "..." : users.filter(u => u.nivelAcesso === 1).length}</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/10">
                        <UserPlus className="h-5 w-5 text-amber-300" />
                        <div>
                            <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wide">Vendedores</p>
                            <p className="text-lg font-bold text-white">{loading ? "..." : users.filter(u => u.nivelAcesso !== 1).length}</p>
                        </div>
                    </div>
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
