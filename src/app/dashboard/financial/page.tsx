"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Filter,
    Loader2,
    Link as LinkIcon
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
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const paymentFormSchema = z.object({
    pagoEm: z.string().min(1, "Data de pagamento é obrigatória"),
    comprovanteUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface FinancialTransaction {
    id: string;
    commissionId: string;
    vendedorId: string;
    mesAno: string;
    valorTotal: number;
    status: 'Em aberto' | 'Pago';
    pagoEm?: string;
    comprovanteUrl?: string;
    vendedorNome?: string;
    vendedorFoto?: string;
}

export default function FinancialPage() {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            pagoEm: new Date().toISOString().split('T')[0],
            comprovanteUrl: "",
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
        } catch (error: any) {
            toast.error("Erro ao carregar dados financeiros: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPaymentDialog = (transaction: FinancialTransaction) => {
        setSelectedTransaction(transaction);
        form.reset({
            pagoEm: new Date().toISOString().split('T')[0],
            comprovanteUrl: "",
        });
        setIsDialogOpen(true);
    };

    const onSubmit = async (values: PaymentFormValues) => {
        if (!selectedTransaction) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/financial/${selectedTransaction.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'PAY',
                    pagoEm: values.pagoEm,
                    comprovanteUrl: values.comprovanteUrl || undefined,
                }),
            });

            if (response.ok) {
                toast.success("Comissão paga com sucesso!");
                setIsDialogOpen(false);
                fetchData();
            } else {
                const errorData = await response.json();
                toast.error("Erro ao registrar pagamento: " + errorData.error);
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Header Premium com Gradiente ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl shadow-indigo-200/40">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white/5 blur-xl" />
                    <div className="absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-indigo-400/20 blur-xl" />
                </div>
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 shadow-inner">
                            <DollarSign className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">Financeiro</h1>
                            <p className="mt-1 text-blue-100/90 font-medium">Controle de pagamento de comissões aos vendedores.</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2 rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all font-medium"
                    >
                        <Filter className="h-4 w-4" />
                        Filtrar por Período
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-lg overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-white/80 border-b border-slate-100 pb-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">Pagamentos de Comissão</CardTitle>
                            <CardDescription className="text-slate-500 font-medium mt-1">Lista de comissões aprovadas aguardando pagamento.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-semibold text-slate-700 h-12">Vendedor</TableHead>
                                <TableHead className="font-semibold text-slate-700">Mês/Ano</TableHead>
                                <TableHead className="font-semibold text-slate-700">Valor Total</TableHead>
                                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span className="font-medium">Carregando dados financeiros...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">
                                        Nenhuma comissão pendente ou paga encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t) => (
                                    <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                                        <TableCell className="font-medium text-slate-700">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                    <AvatarImage src={t.vendedorFoto || undefined} alt={t.vendedorNome} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                                        {t.vendedorNome?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-semibold text-slate-800">{t.vendedorNome}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600 font-medium bg-slate-100/50 w-fit px-2.5 py-1 rounded-md border border-slate-200/60">
                                                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                                                {t.mesAno}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold font-outfit text-slate-700 text-base">
                                            {formatCurrency(t.valorTotal)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={t.status === 'Pago' ? 'default' : 'secondary'}
                                                className={t.status === 'Pago'
                                                    ? 'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/80 border-emerald-200/50 font-bold px-2.5 py-0.5 shadow-sm'
                                                    : 'bg-amber-100/80 text-amber-700 hover:bg-amber-200/80 border-amber-200/50 font-bold px-2.5 py-0.5 shadow-sm'}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {t.status === 'Pago' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                                    {t.status}
                                                </div>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {t.status === 'Em aberto' ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOpenPaymentDialog(t)}
                                                    className="rounded-xl shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 border-none text-white font-semibold gap-1.5 hover:scale-[1.02]"
                                                >
                                                    <DollarSign className="h-4 w-4" />
                                                    Pagar
                                                </Button>
                                            ) : (
                                                <div className="flex justify-end pr-2 text-slate-400">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500/50" />
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal de Pagamento */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <div className="bg-gradient-to-br from-white to-slate-50/50 p-6">
                        <DialogHeader className="mb-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                                    <DollarSign className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-slate-800">Pagar Comissão</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium">
                                        Registrar pagamento para o vendedor.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {selectedTransaction && (
                            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-sm text-slate-500 font-medium mb-1">Valor a ser pago</p>
                                <p className="text-3xl font-bold text-emerald-600 font-outfit">{formatCurrency(selectedTransaction.valorTotal)}</p>
                                <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Vendedor</span>
                                    <span className="font-semibold text-slate-700">{selectedTransaction.vendedorNome}</span>
                                </div>
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="pagoEm"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-sm font-semibold text-slate-700">Data de Pagamento</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-colors" />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="comprovanteUrl"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-sm font-semibold text-slate-700">Link do Comprovante (Opcional)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="https://..."
                                                        {...field}
                                                        className="pl-9 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-colors"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="pt-6 gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-semibold"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.02] border-none font-semibold"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            "Confirmar Pagamento"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
