"use client";

import { Role } from "@/modules/roles/domain/entities";
import { Edit2, ShieldX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";

interface RoleListProps {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (id: string) => void;
}

export function RoleList({ roles, onEdit, onDelete }: RoleListProps) {
    if (roles.length === 0) {
        return (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                <ShieldX className="h-10 w-10 text-slate-300 mb-2" />
                <p>Nenhum perfil encontrado</p>
            </div>
        );
    }

    return (
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-600 bg-slate-50 uppercase font-bold tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Nome do Perfil</th>
                        <th className="px-6 py-4 text-center">Usuários</th>
                        <th className="px-6 py-4">Permissões</th>
                        <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {roles.map((role) => (
                        <tr key={role.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 text-base">{role.name}</span>
                                    <span className="text-xs text-slate-500 font-medium">{role.description || 'Sem descrição'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-3">
                                    {role.userCount || 0} vinculados
                                </Badge>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-indigo-600 font-bold text-sm">
                                        {role.permissions?.length || 0} permissões ativas
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(role)}
                                        className="h-8 w-8 p-0 rounded-lg text-sidebar border-sidebar/20 hover:bg-sidebar/10 shadow-sm"
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
