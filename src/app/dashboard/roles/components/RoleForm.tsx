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

interface ApiUserItem {
    id: string;
    nome: string;
    roleId?: string | null;
}

export function RoleForm({ initialData, onSubmit, isLoading }: RoleFormProps) {
    const [allUsers, setAllUsers] = useState<{ id: string, nome: string, roleId?: string | null }[]>([]);
    const [linkedUser, setLinkedUser] = useState<{ id: string, nome: string } | null>(null);

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then((data: unknown) => {
                if (Array.isArray(data)) {
                    // Filter: Only users with no role OR users already in this role
                    const apiUsers = data as ApiUserItem[];
                    const filteredUsers = apiUsers.filter((user) => !user.roleId || (initialData?.id && user.roleId === initialData.id));
                    setAllUsers(filteredUsers);
                }
            })
            .catch(console.error);
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
        DASHBOARD: "Dashboard",
        OVERVIEW: "Visão Geral",
        AGENDA: "Agenda",
        REPORTS: "Relatórios",
        AUXILIARY: "Cadastros Auxiliares",
        CLIENTS: "Clientes",
        LOANS: "Empréstimos",
        COMMISSIONS: "Comissões",
        FINANCIAL: "Financeiro",
        GOALS: "Gestão de Metas",
        COMPANY: "Empresa",
        USERS: "Usuários",
        ROLES: "Perfis de Acesso",
        AUDIT: "Auditoria",
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-5">

                <div className="space-y-4">
                    {!initialData && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/15 space-y-3">
                            <Label className="text-xs font-medium text-foreground flex items-center gap-2 uppercase tracking-widest">
                                <UserCircle className="w-4 h-4" />
                                Vincular a Usuário Existente
                            </Label>
                            <select
                                className="w-full h-10 px-3 rounded-lg border border-border/70 bg-background text-sm font-medium outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-primary/65 focus:ring-[3px] focus:ring-primary/20"
                                onChange={(e) => {
                                    const userId = e.target.value;
                                    if (userId) {
                                        const user = allUsers.find(u => u.id === userId);
                                        if (user) {
                                            setValue('name', user.nome);
                                            setValue('userIds', [user.id]);
                                            setLinkedUser({ id: user.id, nome: user.nome });
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
                            <p className="text-[10px] text-muted-foreground font-medium italic">
                                * Útil para Perfis Individuais: preenche o nome e seleciona o usuário automaticamente.
                            </p>
                        </div>
                    )}

                    {/* Exibe o nome apenas se NÃO houver usuário vinculado, ou se for edição */}
                    {(!linkedUser || initialData) ? (
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground font-semibold flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-primary" />
                                {linkedUser ? "Nome do Perfil (Vinculado)" : "Nome do Perfil"}
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ex: Gerente Financeiro"
                                {...register("name")}
                                className={`${errors.name ? 'border-red-500' : ''}`}
                            />
                            {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
                        </div>
                    ) : (
                        <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-900">Perfil Individual: {linkedUser.nome}</span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] text-emerald-700 hover:bg-emerald-100 uppercase font-medium"
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
                    <Label htmlFor="description" className="text-foreground font-semibold flex items-center gap-2">
                        Descrição (Opcional)
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Descreva a responsabilidade deste perfil..."
                        {...register("description")}
                        className="resize-none"
                        rows={3}
                    />
                </div>

                <div className="space-y-4 border-t border-border/70 pt-6">
                    <h3 className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Atribuição de Usuários
                    </h3>
                    <Controller
                        name="userIds"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-3">
                                {linkedUser ? (
                                    <div className="p-3 bg-primary/5 border border-primary/15 rounded-lg flex items-center gap-3">
                                        <div className="h-4 w-4 rounded border bg-primary border-primary flex items-center justify-center text-white">
                                            <ShieldCheck className="h-3 w-3" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {linkedUser.nome} <span className="text-[10px] uppercase text-primary font-medium ml-1">(Perfil Individual Vinculado)</span>
                                        </span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-card rounded-lg border border-border/70 shadow-inner">
                                        {allUsers.length > 0 ? (
                                            allUsers.map(user => {
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
                                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' : 'bg-muted/20 border-border/70 hover:bg-muted/35'}`}
                                                    >
                                                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'bg-background border-border'}`}>
                                                            {isSelected && <ShieldCheck className="h-3 w-3" />}
                                                        </div>
                                                        <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{user.nome}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-2 py-4 text-center text-xs text-muted-foreground italic">Carregando usuários ou nenhum encontrado...</div>
                                        )}
                                    </div>
                                )}
                                {!linkedUser && (
                                    <p className="text-[10px] text-muted-foreground font-medium">
                                        Selecione os usuários que deverão herdar as permissões deste perfil.
                                    </p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div className="mt-4 border-t border-border/70 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            Matriz de Permissões
                        </h3>
                        {initialData?.userCount !== undefined && (
                            <Badge variant="outline" className="bg-emerald-50/60 text-emerald-700 border-emerald-200 font-semibold">
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
                                    const allModuleNames = modulePermissions.map((permission) => String(permission.name));
                                    const isAllSelected = allModuleNames.every(name => field.value.includes(name));

                                    return (
                                        <div key={moduleName} className="bg-card rounded-xl p-6 border border-border/70 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-center mb-4 border-b border-border/60 pb-3">
                                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    {MODULE_TRANSLATIONS[moduleName] || moduleName.toLowerCase().replace('_', ' ')}
                                                </h4>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-medium uppercase tracking-wider text-primary hover:bg-primary/10"
                                                    onClick={() => {
                                                        const otherPermissions = field.value.filter((permission) => !allModuleNames.includes(permission));
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
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                {modulePermissions.map((perm) => {
                                                    const isChecked = field.value.includes(perm.name);
                                                    const permLabel = perm.description.split(' ')[0]; // Pegasus: Visualizar, Salvar, Editar, Excluir

                                                    return (
                                                        <div
                                                            key={perm.id}
                                                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer hover:bg-muted/30 ${isChecked ? 'bg-primary/10' : ''}`}
                                                            onClick={() => {
                                                                const updated = isChecked
                                                                    ? field.value.filter((p) => p !== perm.name)
                                                                    : [...field.value, perm.name];
                                                                field.onChange(updated);
                                                            }}
                                                        >
                                                            <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
                                                                {isChecked && <ShieldCheck className="h-3 w-3 text-white" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`text-[11px] font-medium ${isChecked ? 'text-foreground' : 'text-muted-foreground'} uppercase tracking-tighter`}>
                                                                    {permLabel}
                                                                </span>
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

            <div className="flex justify-end gap-3 pt-6 border-t border-border/70">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 rounded-lg bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground min-w-[140px] font-semibold tracking-wide shadow-sm"
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
