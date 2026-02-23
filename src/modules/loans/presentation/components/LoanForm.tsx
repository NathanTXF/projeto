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
import {
    Loader2,
    Search,
    User,
    Calendar,
    Building2,
    Landmark,
    DollarSign,
    ClipboardList,
    Save,
    Lock,
    Tag,
    Layers,
    Table2,
    Timer,
    Activity,
} from "lucide-react";

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

    // Currency Formatting Helpers
    const formatBRL = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const parseCurrency = (value: string) => {
        const digits = value.replace(/\D/g, "");
        return Number(digits) / 100;
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: number) => void) => {
        const value = parseCurrency(e.target.value);
        onChange(value);
    };

    useEffect(() => {
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
        console.log("Submitting Loan Data:", data);
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
                console.error("Loan Submission Error Response:", errorData);
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
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ── Seção: Cliente & Data ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                            <User className="h-4 w-4 text-indigo-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Cliente & Data
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                        <FormField
                            control={form.control}
                            name="clienteId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Cliente
                                    </FormLabel>
                                    <div className="relative">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Buscar por nome ou CPF..."
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                                value={clientSearch}
                                                onChange={(e) => {
                                                    setClientSearch(e.target.value);
                                                    handleSearch(e.target.value);
                                                }}
                                                onFocus={() => setShowResults(true)}
                                            />
                                        </div>

                                        {showResults && (searchResults.length > 0 || isSearching) && (
                                            <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                {isSearching ? (
                                                    <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span className="text-sm">Buscando...</span>
                                                    </div>
                                                ) : (
                                                    <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-50">
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
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Data da Venda
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="date"
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors"
                                                {...field}
                                                value={field.value instanceof Date
                                                    ? field.value.toISOString().split('T')[0]
                                                    : field.value || ""}
                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* ── Seção: Dados do Contrato ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                            <ClipboardList className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Dados do Contrato
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                        <FormField
                            control={form.control}
                            name="orgaoId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Órgão
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500 focus:bg-white transition-colors">
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
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Banco
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500 focus:bg-white transition-colors">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                        <FormField
                            control={form.control}
                            name="tipoId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Tipo
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500 focus:bg-white transition-colors">
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
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Grupo
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500 focus:bg-white transition-colors">
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
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Tabela
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500 focus:bg-white transition-colors">
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
                </div>

                {/* ── Seção: Valores ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
                            <DollarSign className="h-4 w-4 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            Valores & Condições
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                        <FormField
                            control={form.control}
                            name="valorBruto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Valor Bruto
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors font-mono"
                                                placeholder="R$ 0,00"
                                                value={formatBRL(field.value || 0)}
                                                onChange={e => handleCurrencyChange(e, field.onChange)}
                                            />
                                        </div>
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
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Valor Líquido
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors font-mono"
                                                placeholder="R$ 0,00"
                                                value={formatBRL(field.value || 0)}
                                                onChange={e => handleCurrencyChange(e, field.onChange)}
                                            />
                                        </div>
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
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Valor Parcela
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors font-mono"
                                                placeholder="R$ 0,00"
                                                value={formatBRL(field.value || 0)}
                                                onChange={e => handleCurrencyChange(e, field.onChange)}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                        <FormField
                            control={form.control}
                            name="prazo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Prazo (Parcelas)
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-colors font-mono"
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                        </div>
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
                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Status
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-indigo-500 focus:bg-white transition-colors">
                                                <SelectValue placeholder="Selecione o status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ATIVO">
                                                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Ativo</span>
                                            </SelectItem>
                                            <SelectItem value="FINALIZADO">
                                                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" />Finalizado</span>
                                            </SelectItem>
                                            <SelectItem value="CANCELADO">
                                                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" />Cancelado</span>
                                            </SelectItem>
                                            <SelectItem value="ATRASADO">
                                                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" />Atrasado</span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* ── Botão Salvar ── */}
                <Button
                    type="submit"
                    disabled={submitting || isLocked}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] gap-2"
                >
                    {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
                    ) : isLocked ? (
                        <><Lock className="h-4 w-4" />Edição Bloqueada (Comissões Processadas)</>
                    ) : (
                        <><Save className="h-4 w-4" />{initialData ? "Atualizar Registro" : "Registrar Venda"}</>
                    )}
                </Button>
            </form>
        </Form>
    );
}
