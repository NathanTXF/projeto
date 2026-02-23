"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Settings2, ShieldCheck } from "lucide-react";
import { Role } from "@/modules/roles/domain/entities";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import { useMemo } from "react";

const roleClientSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    permissions: z.array(z.string()).min(1, 'Selecione no mínimo uma permissão'),
});

type RoleFormData = z.infer<typeof roleClientSchema>;

interface RoleFormProps {
    initialData?: Role | null;
    onSubmit: (data: RoleFormData) => void;
    isLoading: boolean;
}

export function RoleForm({ initialData, onSubmit, isLoading }: RoleFormProps) {
    const { register, handleSubmit, control, formState: { errors } } = useForm<RoleFormData>({
        resolver: zodResolver(roleClientSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            permissions: initialData?.permissions || [],
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-semibold flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-indigo-500" />
                        Nome do Perfil
                    </Label>
                    <Input
                        id="name"
                        placeholder="Ex: Gerente Financeiro"
                        {...register("name")}
                        className={`bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-700 font-semibold flex items-center gap-2">
                        Descrição (Opcional)
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Descreva a responsabilidade deste perfil..."
                        {...register("description")}
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 resize-none"
                        rows={3}
                    />
                </div>

                <div className="mt-4 border-t pt-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <ShieldCheck className="w-5 h-5 text-indigo-500" />
                        Permissões do Sistema
                    </h3>

                    {errors.permissions && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{errors.permissions.message}</p>}

                    <Controller
                        name="permissions"
                        control={control}
                        render={({ field }) => (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(groupedPermissions).map(([moduleName, permissions]) => (
                                    <div key={moduleName} className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm">
                                        <h4 className="font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2 capitalize">
                                            {moduleName.toLowerCase().replace('_', ' ')}
                                        </h4>
                                        <div className="space-y-3">
                                            {permissions.map((perm) => (
                                                <div key={perm.id} className="flex items-start space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        id={perm.name}
                                                        value={perm.name}
                                                        className="mt-1 w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500"
                                                        checked={field.value.includes(perm.name)}
                                                        onChange={(e) => {
                                                            const updated = e.target.checked
                                                                ? [...field.value, perm.name]
                                                                : field.value.filter((p) => p !== perm.name);
                                                            field.onChange(updated);
                                                        }}
                                                    />
                                                    <div className="flex flex-col">
                                                        <label htmlFor={perm.name} className="text-sm font-medium text-slate-700 cursor-pointer">
                                                            {perm.description || perm.name}
                                                        </label>
                                                        <span className="text-xs text-slate-400 font-mono mt-0.5">{perm.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] font-semibold tracking-wide"
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
