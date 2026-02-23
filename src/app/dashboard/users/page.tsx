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
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 shadow-sm">
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">Gerenciamento de Usuários</h1>
                            <p className="mt-1 text-blue-100 font-medium">Administre os acessos e horários dos colaboradores.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedUser(null);
                            setIsDialogOpen(true);
                        }}
                        className="gap-2 rounded-xl bg-white text-blue-700 font-bold shadow-sm hover:bg-blue-50 transition-all duration-200 active:scale-95 border-none px-6 py-3"
                    >
                        <UserPlus className="h-5 w-5" />
                        Novo Usuário
                    </Button>
                </div>
                {/* Mini stats */}
                <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-4 border border-white/10">
                        <Users className="h-6 w-6 text-blue-200" />
                        <div>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest leading-none mb-1">Total</p>
                            <p className="text-xl font-black text-white leading-none">{loading ? "..." : users.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-4 border border-white/10">
                        <Shield className="h-6 w-6 text-emerald-300" />
                        <div>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest leading-none mb-1">Admins</p>
                            <p className="text-xl font-black text-white leading-none">{loading ? "..." : users.filter(u => u.nivelAcesso === 1).length}</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-white/10 px-5 py-4 border border-white/10">
                        <UserPlus className="h-6 w-6 text-amber-300" />
                        <div>
                            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest leading-none mb-1">Vendedores</p>
                            <p className="text-xl font-black text-white leading-none">{loading ? "..." : users.filter(u => u.nivelAcesso !== 1).length}</p>
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
                                placeholder="Buscar usuários..."
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
                <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    {/* Solid Blue Header */}
                    <div className="relative bg-blue-600 px-6 py-5">
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white leading-none">
                                    {selectedUser ? "Editar Usuário" : "Novo Usuário"}
                                </DialogTitle>
                                <DialogDescription className="text-blue-100 text-sm mt-1">
                                    {selectedUser
                                        ? "Atualize os dados do colaborador abaixo."
                                        : "Preencha os dados para cadastrar um novo colaborador."}
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
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
