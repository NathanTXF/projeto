"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Settings2, ShieldCheck, Users, UserCircle } from "lucide-react";
import { Role } from "@/modules/roles/domain/entities";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";

const roleClientSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    permissions: z.array(z.string()).min(1, 'Selecione no mínimo uma permissão'),
    userIds: z.array(z.string()).optional(),
});

type RoleFormData = z.infer<typeof roleClientSchema>;

interface RoleFormProps {
    initialData?: Role | null;
    onSubmit: (data: RoleFormData) => void;
    isLoading: boolean;
}

export function RoleForm({ initialData, onSubmit, isLoading }: RoleFormProps) {
    const [allUsers, setAllUsers] = useState<{ id: string, nome: string }[]>([]);
    const [linkedUser, setLinkedUser] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAllUsers(data);
            })
            .catch(console.error);

        // Se estiver editando e houver usuários, podemos considerar o primeiro como o vínculo
        if (initialData?.users && initialData.users.length > 0) {
            setLinkedUser(initialData.users[0].nome);
        }
    }, [initialData]);

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<RoleFormData>({
        resolver: zodResolver(roleClientSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            permissions: initialData?.permissions || [],
            userIds: initialData?.users?.map(u => u.id) || [],
        },
    });

    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        return ALL_PERMISSIONS.reduce((acc, current) => {
            if (!acc[current.module]) {
                acc[current.module] = [];
            }
            acc[current.module].push(current);
            return acc;
        }, {} as Record<string, typeof ALL_PERMISSIONS>);
    }, []);

    const MODULE_TRANSLATIONS: Record<string, string> = {
        DASHBOARD: "DASHBOARD",
        USERS: "USUÁRIOS",
        ROLES: "PERFIS DE ACESSO",
        CLIENTS: "CLIENTES",
        LOANS: "VENDAS",
        COMMISSIONS: "COMISSÕES",
        FINANCIAL: "FINANCEIRO",
        AGENDA: "AGENDA",
        AUDIT: "AUDITORIA",
        AUXILIARY: "CADASTROS AUXILIARES",
        SETTINGS: "CONFIGURAÇÕES",
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-5">

                <div className="space-y-4">
                    {!initialData && (
                        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-3">
                            <Label className="text-xs font-bold text-indigo-900 flex items-center gap-2 uppercase tracking-widest">
                                <UserCircle className="w-4 h-4" />
                                Vincular a Usuário Existente
                            </Label>
                            <select
                                className="w-full h-10 px-3 rounded-xl border-slate-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                                onChange={(e) => {
                                    const userId = e.target.value;
                                    if (userId) {
                                        const user = allUsers.find(u => u.id === userId);
                                        if (user) {
                                            setValue('name', user.nome);
                                            setValue('userIds', [user.id]);
                                            setLinkedUser(user.nome);
                                        }
                                    } else {
                                        setLinkedUser(null);
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="">Perfil Geral (digite um nome abaixo)...</option>
                                {allUsers.map(user => (
                                    <option key={user.id} value={user.id}>{user.nome}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-indigo-600 font-medium italic">
                                * Útil para Perfis Individuais: preenche o nome e seleciona o usuário automaticamente.
                            </p>
                        </div>
                    )}

                    {/* Exibe o nome apenas se NÃO houver usuário vinculado, ou se for edição */}
                    {(!linkedUser || initialData) ? (
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700 font-bold flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-sidebar" />
                                {linkedUser ? "Nome do Perfil (Vinculado)" : "Nome do Perfil"}
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ex: Gerente Financeiro"
                                {...register("name")}
                                className={`bg-slate-50 border-slate-200 focus-visible:ring-sidebar/20 focus-visible:border-sidebar ${errors.name ? 'border-red-500' : ''}`}
                            />
                            {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
                        </div>
                    ) : (
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-bold text-emerald-900">Perfil Individual: {linkedUser}</span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] text-emerald-700 hover:bg-emerald-100 uppercase font-black"
                                onClick={() => {
                                    setLinkedUser(null);
                                    setValue('userIds', []);
                                }}
                            >
                                Alterar
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-700 font-semibold flex items-center gap-2">
                        Descrição (Opcional)
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Descreva a responsabilidade deste perfil..."
                        {...register("description")}
                        className="bg-slate-50 border-slate-200 focus-visible:ring-sidebar/20 focus-visible:border-sidebar resize-none"
                        rows={3}
                    />
                </div>

                <div className="space-y-4 border-t pt-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        Atribuição de Usuários
                    </h3>
                    <Controller
                        name="userIds"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-white rounded-xl border border-slate-100 shadow-inner">
                                    {allUsers.length > 0 ? (
                                        allUsers.map((user: { id: string, nome: string }) => {
                                            const isSelected = field.value?.includes(user.id);
                                            return (
                                                <div
                                                    key={user.id}
                                                    onClick={() => {
                                                        const current = field.value || [];
                                                        const updated = isSelected
                                                            ? current.filter(id => id !== user.id)
                                                            : [...current, user.id];
                                                        field.onChange(updated);
                                                    }}
                                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-slate-50/30 border-slate-100 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}>
                                                        {isSelected && <ShieldCheck className="h-3 w-3" />}
                                                    </div>
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{user.nome}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-2 py-4 text-center text-xs text-slate-400 italic">Carregando usuários ou nenhum encontrado...</div>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    Selecione os usuários que deverão herdar as permissões deste perfil.
                                </p>
                            </div>
                        )}
                    />
                </div>

                <div className="mt-4 border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            Matriz de Permissões
                        </h3>
                        {initialData?.userCount !== undefined && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                {initialData.userCount} usuários ativos com este perfil
                            </Badge>
                        )}
                    </div>

                    {errors.permissions && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{errors.permissions.message}</p>}

                    <Controller
                        name="permissions"
                        control={control}
                        render={({ field }) => (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => {
                                    const allModuleNames = modulePermissions.map(p => p.name);
                                    const isAllSelected = allModuleNames.every(name => field.value.includes(name));

                                    return (
                                        <div key={moduleName} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                                    {MODULE_TRANSLATIONS[moduleName] || moduleName.toLowerCase().replace('_', ' ')}
                                                </h4>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:bg-indigo-50"
                                                    onClick={() => {
                                                        const otherPermissions = field.value.filter(p => !allModuleNames.includes(p as any));
                                                        if (isAllSelected) {
                                                            field.onChange(otherPermissions);
                                                        } else {
                                                            field.onChange([...otherPermissions, ...allModuleNames]);
                                                        }
                                                    }}
                                                >
                                                    {isAllSelected ? 'Limpar Tudo' : 'Selecionar Tudo'}
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {modulePermissions.map((perm) => {
                                                    const isChecked = field.value.includes(perm.name);
                                                    return (
                                                        <div
                                                            key={perm.id}
                                                            className={`flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer hover:bg-slate-50 ${isChecked ? 'bg-indigo-50/30' : ''}`}
                                                            onClick={() => {
                                                                const updated = isChecked
                                                                    ? field.value.filter((p) => p !== perm.name)
                                                                    : [...field.value, perm.name];
                                                                field.onChange(updated);
                                                            }}
                                                        >
                                                            <div className={`mt-1 h-4 w-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                                                {isChecked && <ShieldCheck className="h-3 w-3 text-white" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`text-sm font-bold ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                                    {perm.description || perm.name}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-mono">{perm.name}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground min-w-[140px] font-semibold tracking-wide"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        initialData ? 'Salvar Alterações' : 'Criar Perfil'
                    )}
                </Button>
            </div>
        </form>
    );
}
