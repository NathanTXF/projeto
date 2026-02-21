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
        <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow>
                        <TableHead className="font-bold">Nome</TableHead>
                        <TableHead className="font-bold">Usuário</TableHead>
                        <TableHead className="font-bold">Nível</TableHead>
                        <TableHead className="font-bold">Horário</TableHead>
                        <TableHead className="text-right font-bold">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-32 text-muted-foreground italic">
                                Nenhum usuário cadastrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-slate-50/30 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                            {user.nome.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-slate-900">{user.nome}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 font-medium">
                                    @{user.usuario}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            user.nivelAcesso === 1 && "bg-purple-50 text-purple-700 border-purple-200",
                                            user.nivelAcesso === 2 && "bg-blue-50 text-blue-700 border-blue-200",
                                            user.nivelAcesso === 3 && "bg-slate-50 text-slate-700 border-slate-200"
                                        )}
                                    >
                                        {user.nivelAcesso === 1 ? (
                                            <>
                                                <Shield className="mr-1 h-3 w-3" />
                                                Gestor
                                            </>
                                        ) : user.nivelAcesso === 2 ? (
                                            <>
                                                <UserIcon className="mr-1 h-3 w-3" />
                                                Vendedor+
                                            </>
                                        ) : (
                                            <>
                                                <UserIcon className="mr-1 h-3 w-3" />
                                                Vendedor
                                            </>
                                        )}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        {user.horarioInicio || '08:00'} - {user.horarioFim || '18:00'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {userLevel === 1 && (
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(user)}
                                                className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-rose-50"
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
    );
}
