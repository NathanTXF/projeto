"use client";

import { Role } from "@/modules/roles/domain/entities";
import { Edit2, ShieldX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
                <thead className="text-xs text-slate-500 bg-slate-50 uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Nome do Perfil</th>
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Permissões</th>
                        <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {roles.map((role) => (
                        <tr key={role.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-semibold text-slate-800">{role.name}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-slate-600 truncate block max-w-xs">{role.description || '-'}</span>
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                                    {role.permissions?.length || 0} permissões ativas
                                </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(role)}
                                        className="h-8 w-8 p-0 rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50"
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
