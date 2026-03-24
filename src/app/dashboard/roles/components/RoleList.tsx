"use client";

import { Role } from "@/modules/roles/domain/entities";
import { Edit2, ShieldX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface RoleListProps {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (id: string) => void;
}

export function RoleList({ roles, onEdit, onDelete }: RoleListProps) {
    if (roles.length === 0) {
        return (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
                <ShieldX className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p>Nenhum perfil encontrado</p>
            </div>
        );
    }

    return (
        <div className="relative overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-foreground border-b border-border/70">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="h-11 text-[11px] font-medium uppercase tracking-[0.12em]">Nome do Perfil</TableHead>
                        <TableHead className="h-11 text-center text-[11px] font-medium uppercase tracking-[0.12em]">Usuários</TableHead>
                        <TableHead className="h-11 text-[11px] font-medium uppercase tracking-[0.12em]">Permissões</TableHead>
                        <TableHead className="h-11 text-center text-[11px] font-medium uppercase tracking-[0.12em]">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.map((role) => (
                        <TableRow key={role.id} className="hover:bg-muted/30 transition-colors border-border/60">
                            <TableCell className="py-3.5">
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground text-[15px] tracking-tight">{role.name}</span>
                                    <span className="text-xs text-muted-foreground font-medium">{role.description || "Sem descrição"}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center py-3.5">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-medium px-3">
                                    {role.userCount || 0} vinculados
                                </Badge>
                            </TableCell>
                            <TableCell className="py-3.5">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-emerald-700 font-medium text-sm">
                                        {role.permissions?.length || 0} permissões ativas
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="py-3.5">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(role)}
                                        className="h-8 w-8 p-0 rounded-lg text-primary border-primary/20 hover:bg-primary/10 shadow-sm"
                                        title="Editar Perfil"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(role.id)}
                                        className="h-8 w-8 p-0 rounded-lg text-rose-600 border-rose-200 hover:bg-rose-50"
                                        title="Excluir Perfil"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
