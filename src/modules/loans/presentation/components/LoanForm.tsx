"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoanSchema, Loan, LoanStatus } from "../../domain/entities";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Customer } from "@/modules/clients/domain/entities";
import { AuxiliaryEntity } from "@/modules/auxiliary/domain/entities";
import { Loader2, Search } from "lucide-react";

interface LoanFormProps {
    initialData?: Loan & { cliente?: { nome: string, cpfCnpj: string } };
    onSuccess?: () => void;
}

export function LoanForm({ initialData, onSuccess }: LoanFormProps) {
    const router = useRouter();
    const [banks, setBanks] = useState<AuxiliaryEntity[]>([]);
    const [organs, setOrgans] = useState<AuxiliaryEntity[]>([]);
    const [types, setTypes] = useState<AuxiliaryEntity[]>([]);
    const [groups, setGroups] = useState<AuxiliaryEntity[]>([]);
    const [tables, setTables] = useState<AuxiliaryEntity[]>([]);

    // Autocomplete State
    const [clientSearch, setClientSearch] = useState("");
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        // Se estiver editando, verificar se há comissões aprovadas/pagas
        if (initialData?.id) {
            fetch(`/api/commissions?loanId=${initialData.id}`)
                .then(res => res.json())
                .then(commissions => {
                    const hasProcessed = commissions.some((c: any) => c.status !== "Em aberto");
                    if (hasProcessed) {
                        setIsLocked(true);
                        toast.info("Edição bloqueada: Esta venda já possui comissões processadas.");
                    }
                })
                .catch(() => { });
        }
    }, [initialData]);

    const handleSearch = async (query: string) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/clients/search?q=${query}`);
            const data = await res.json();
            setSearchResults(data || []);
        } catch (error) {
            console.error("Search error", error);
        } finally {
            setIsSearching(false);
        }
    };

    const form = useForm<z.infer<typeof LoanSchema>>({
        resolver: zodResolver(LoanSchema),
        defaultValues: initialData ? {
            ...initialData,
            dataInicio: new Date(initialData.dataInicio),
        } : {
            dataInicio: new Date(),
            status: "ATIVO" as LoanStatus,
            prazo: 84,
            valorParcela: 0,
            valorBruto: 0,
            valorLiquido: 0,
            clienteId: "",
            vendedorId: "",
            orgaoId: undefined,
            bancoId: undefined,
            tipoId: undefined,
            grupoId: undefined,
            tabelaId: undefined,
            observacao: "",
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true);
                const [b, o, ty, g, ta] = await Promise.all([
                    fetch("/api/auxiliary/banks").then((r) => r.json()),
                    fetch("/api/auxiliary/organs").then((r) => r.json()),
                    fetch("/api/auxiliary/loan-types").then((r) => r.json()),
                    fetch("/api/auxiliary/loan-groups").then((r) => r.json()),
                    fetch("/api/auxiliary/loan-tables").then((r) => r.json()),
                ]);

                if (initialData?.cliente) {
                    setClientSearch(`${initialData.cliente.nome} (${initialData.cliente.cpfCnpj})`);
                }

                setBanks(b || []);
                setOrgans(o || []);
                setTypes(ty || []);
                setGroups(g || []);
                setTables(ta || []);
            } catch (error) {
                toast.error("Erro ao carregar dados auxiliares");
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: Loan) => {
        setSubmitting(true);
        try {
            const response = await fetch(
                initialData ? `/api/loans/${initialData.id}` : "/api/loans",
                {
                    method: initialData ? "PATCH" : "POST",
                    body: JSON.stringify(data),
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Falha ao salvar venda");
            }

            toast.success(initialData ? "Venda atualizada" : "Venda registrada com sucesso!");

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/dashboard/loans");
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="clienteId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Cliente</FormLabel>
                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Buscar por nome ou CPF..."
                                            className="pl-9 h-11 rounded-xl"
                                            value={clientSearch}
                                            onChange={(e) => {
                                                setClientSearch(e.target.value);
                                                handleSearch(e.target.value);
                                            }}
                                            onFocus={() => setShowResults(true)}
                                        />
                                    </div>

                                    {showResults && (searchResults.length > 0 || isSearching) && (
                                        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {isSearching ? (
                                                <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span className="text-sm">Buscando...</span>
                                                </div>
                                            ) : (
                                                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                                                    {searchResults.map((c) => (
                                                        <div
                                                            key={c.id}
                                                            className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                                            onClick={() => {
                                                                field.onChange(c.id);
                                                                setClientSearch(`${c.nome} (${c.cpfCnpj})`);
                                                                setShowResults(false);
                                                            }}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800 text-sm">{c.nome}</span>
                                                                <span className="text-[10px] text-slate-500 font-mono tracking-tighter">{c.cpfCnpj}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dataInicio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data da Venda</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        value={field.value instanceof Date
                                            ? field.value.toISOString().split('T')[0]
                                            : field.value || ""}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="orgaoId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Órgão</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o órgão" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {organs.map((o) => (
                                            <SelectItem key={o.id} value={o.id.toString()}>{o.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bancoId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Banco</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o banco" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {banks.map((b) => (
                                            <SelectItem key={b.id} value={b.id.toString()}>{b.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="tipoId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Empréstimo</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {types.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="grupoId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grupo</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {groups.map((g) => (
                                            <SelectItem key={g.id} value={g.id.toString()}>{g.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tabelaId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tabela</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tables.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="valorBruto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Bruto (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="valorLiquido"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Líquido (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="valorParcela"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Parcela (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="prazo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prazo (Parcelas)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ATIVO">Ativo</SelectItem>
                                        <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                        <SelectItem value="ATRASADO">Atrasado</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={submitting || isLocked}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isLocked ? "Edição Bloqueada (Comissões Processadas)" : (initialData ? "Atualizar Registro" : "Registrar Venda")}
                </Button>
            </form>
        </Form >
    );
}
