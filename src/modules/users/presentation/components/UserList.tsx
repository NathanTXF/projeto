"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "../../domain/entities";
import { Edit, Trash2, Shield, User as UserIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface UserListProps {
    users: User[];
    userLevel?: number;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}

export function UserList({ users, userLevel, onEdit, onDelete }: UserListProps) {
    return (
        <Card className="border-none shadow-lg overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-white border-b border-slate-100 pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl">Lista de Usuários</CardTitle>
                        <CardDescription>Gerencie os acessos ao sistema.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-sidebar [&_th]:text-sidebar-foreground font-bold border-b-none">
                            <TableRow>
                                <TableHead className="font-semibold text-sidebar-foreground">Nome</TableHead>
                                <TableHead className="font-semibold text-sidebar-foreground">Usuário</TableHead>
                                <TableHead className="font-semibold text-sidebar-foreground">Nível</TableHead>
                                <TableHead className="font-semibold text-sidebar-foreground">Expediente</TableHead>
                                <TableHead className="font-semibold text-sidebar-foreground">Status</TableHead>
                                <TableHead className="text-right font-semibold text-sidebar-foreground">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-32 text-slate-400 italic">
                                        Nenhum usuário cadastrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className={cn(
                                        "hover:bg-slate-50/50 transition-colors",
                                        user.ativo === false && "bg-slate-50 opacity-60"
                                    )}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white">
                                                    {user.nome.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-900">{user.nome}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 font-medium">
                                            @{user.usuario}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {(user as any).role ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="w-fit bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none font-bold text-[10px] uppercase tracking-wider"
                                                    >
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        {(user as any).role.name}
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "w-fit font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 border-none",
                                                            user.nivelAcesso === 1 && "bg-purple-100 text-purple-700",
                                                            user.nivelAcesso === 2 && "bg-blue-100 text-blue-700",
                                                            user.nivelAcesso === 3 && "bg-slate-100 text-slate-700"
                                                        )}
                                                    >
                                                        {user.nivelAcesso === 1 ? 'Gestor' : user.nivelAcesso === 2 ? 'Vendedor+' : 'Vendedor'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-white px-2 py-0.5 rounded-md w-fit border border-slate-100">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    {user.horarioInicio || '08:00'} - {user.horarioFim || '18:00'}
                                                </div>
                                                {user.horarioInicioFds && user.horarioFimFds && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md w-fit border border-amber-100">
                                                        <Clock className="h-2.5 w-2.5 text-amber-500" />
                                                        {user.horarioInicioFds} - {user.horarioFimFds} (FDS)
                                                    </div>
                                                )}
                                                {user.diasAcesso && (
                                                    <div className="text-[9px] text-slate-400 font-bold px-2 uppercase tracking-tighter">
                                                        Dias: {user.diasAcesso.split(',').map(d => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][Number(d)]).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 border-none",
                                                user.ativo !== false
                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                    : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                            )}>
                                                {user.ativo !== false ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {userLevel === 1 && (
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit(user)}
                                                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                        onClick={() => user.id && onDelete(user.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
