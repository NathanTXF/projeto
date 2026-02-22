"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar as CalendarIcon,
    Plus,
    ArrowUpCircle,
    ArrowDownCircle,
    Filter,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const transactionFormSchema = z.object({
    data: z.string().min(1, "Data é obrigatória"),
    valor: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valor deve ser positivo"),
    tipo: z.enum(["ENTRADA", "SAIDA"]),
    categoria: z.enum(["EMPRESTIMO", "COMISSAO", "DESPESA_FIXA", "DESPESA_VARIAVEL", "OUTROS"]),
    descricao: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface Transaction {
    id: string;
    data: string;
    valor: number;
    tipo: 'ENTRADA' | 'SAIDA';
    categoria: string;
    descricao: string;
    pagoEm?: string;
}

interface Balance {
    totalEntradas: number;
    totalSaidas: number;
    saldo: number;
}

export default function FinancialPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState<Balance>({ totalEntradas: 0, totalSaidas: 0, saldo: 0 });
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionFormSchema),
        defaultValues: {
            tipo: "SAIDA",
            categoria: "DESPESA_FIXA",
            data: new Date().toISOString().split('T')[0],
            valor: "",
            descricao: "",
        },
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/financial');
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setTransactions(data.transactions);
            setBalance(data.balance);
        } catch (error: any) {
            toast.error("Erro ao carregar dados financeiros: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: TransactionFormValues) => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/financial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    valor: Number(values.valor),
                }),
            });

            if (response.ok) {
                toast.success("Transação registrada com sucesso!");
                setIsDialogOpen(false);
                form.reset();
                fetchData();
            } else {
                const errorData = await response.json();
                toast.error("Erro ao registrar transação: " + errorData.error);
            }
        } catch (error: any) {
            toast.error("Erro na requisição: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl border border-slate-200 backdrop-blur-sm shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Financeiro</h1>
                    <p className="text-slate-500 mt-1">Gestão de fluxo de caixa e movimentações financeiras.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 rounded-xl transition-all hover:bg-slate-50">
                        <Filter className="h-4 w-4" />
                        Filtrar
                    </Button>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="gap-2 rounded-xl shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-none"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Transação
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50/50 to-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowUpCircle className="h-24 w-24 text-emerald-600" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-emerald-800">Total Entradas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">{formatCurrency(balance.totalEntradas)}</div>
                        <p className="text-xs text-emerald-600/70 mt-1 font-medium italic">Acumulado total</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-rose-50/50 to-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowDownCircle className="h-24 w-24 text-rose-600" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-rose-800">Total Saídas</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-700">{formatCurrency(balance.totalSaidas)}</div>
                        <p className="text-xs text-rose-600/70 mt-1 font-medium italic">Comissões e despesas</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-24 w-24 text-white" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-blue-100">Saldo Atual</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(balance.saldo)}</div>
                        <p className="text-xs text-blue-200 mt-1 font-medium italic">Disponível em caixa</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-lg overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">Movimentações</CardTitle>
                            <CardDescription>Lista completa de entradas e saídas.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-700">Data</TableHead>
                                <TableHead className="font-semibold text-slate-700">Descrição</TableHead>
                                <TableHead className="font-semibold text-slate-700">Categoria</TableHead>
                                <TableHead className="font-semibold text-slate-700">Tipo</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span>Carregando movimentações...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">
                                        Nenhuma transação registrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t) => (
                                    <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium text-slate-600">
                                            {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(t.data))}
                                        </TableCell>
                                        <TableCell className="text-slate-600 max-w-xs truncate font-medium">
                                            {t.descricao}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-100/50 text-slate-600 border-slate-200 uppercase text-[10px] font-bold tracking-tight">
                                                {t.categoria.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={t.tipo === 'ENTRADA' ? 'default' : 'destructive'}
                                                className={t.tipo === 'ENTRADA'
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold text-xs'
                                                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-none font-bold text-xs'}
                                            >
                                                {t.tipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold font-outfit ${t.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.tipo === 'SAIDA' ? '- ' : '+ '}
                                            {formatCurrency(t.valor)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Nova Transação Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Nova Transação</DialogTitle>
                        <DialogDescription>
                            Preencha os dados abaixo para registrar uma nova movimentação financeira.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4 bg-white">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tipo"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">Tipo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50">
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ENTRADA" className="text-emerald-600 font-medium">Entrada</SelectItem>
                                                    <SelectItem value="SAIDA" className="text-rose-600 font-medium">Saída</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="categoria"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">Categoria</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50">
                                                        <SelectValue placeholder="Selecione a categoria" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="EMPRESTIMO">Empréstimo</SelectItem>
                                                    <SelectItem value="COMISSAO">Comissão</SelectItem>
                                                    <SelectItem value="DESPESA_FIXA">Despesa Fixa</SelectItem>
                                                    <SelectItem value="DESPESA_VARIAVEL">Despesa Variável</SelectItem>
                                                    <SelectItem value="OUTROS">Outros</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="data"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">Data</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="rounded-xl border-slate-200 bg-slate-50/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="valor"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0,00" {...field} className="rounded-xl border-slate-200 bg-slate-50/50 font-medium" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="descricao"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase">Descrição</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Detalhes da transação..."
                                                className="rounded-xl border-slate-200 bg-slate-50/50 resize-none h-20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="rounded-xl hover:bg-slate-100"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        "Salvar Transação"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
