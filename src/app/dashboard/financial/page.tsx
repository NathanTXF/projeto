"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Filter,
    Loader2,
    FileText,
    Trash2,
    RotateCcw,
    AlertCircle,
    AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportButton } from "@/components/ui/ExportButton";
import { exportToCsv, exportToPdf, ExportColumn } from "@/lib/exportUtils";
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
    comprovante: z.any().optional(),
    valorTotal: z.number().min(0).optional(),
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
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isReversingPending, setIsReversingPending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isIntegrityAlertOpen, setIsIntegrityAlertOpen] = useState(false);
    const [integrityErrorMessage, setIntegrityErrorMessage] = useState("");

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            pagoEm: new Date().toISOString().split('T')[0],
            comprovante: undefined,
            valorTotal: undefined,
        } as PaymentFormValues, // Casting here ensures correct type inference
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
        setIsReversingPending(false); // Reset reversal state
        form.reset({
            pagoEm: transaction.pagoEm ? new Date(transaction.pagoEm).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            valorTotal: transaction.valorTotal,
            comprovante: undefined,
        });
        setIsDialogOpen(true);
    };

    const handleReverse = (id: string) => {
        setDeletingId(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/financial/${deletingId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success("Registro financeiro excluído e comissão estornada!");
                setIsDeleteConfirmOpen(false);
                setDeletingId(null);
                fetchData();
            } else {
                let errorMessage = "Erro desconhecido ao estornar.";
                try {
                    const errorData = await response.json();
                    if (errorData.error) errorMessage = errorData.error;
                } catch (e) { }

                if (response.status === 400) {
                    setIntegrityErrorMessage(errorMessage);
                    setIsIntegrityAlertOpen(true);
                    setIsDeleteConfirmOpen(false);
                } else {
                    toast.error(errorMessage);
                }
            }
        } catch (error: any) {
            toast.error("Erro na requisição: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleReversalPending = () => {
        setIsReversingPending(!isReversingPending);
    };

    const onSubmit = async (values: any) => { // Using any to accomodate dynamic valorTotal
        if (!selectedTransaction) return;

        try {
            setIsSubmitting(true);

            let uploadedUrl = "";

            // Upload do arquivo se existir
            if (values.comprovante && values.comprovante[0]) {
                const formData = new FormData();
                formData.append('file', values.comprovante[0]);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Falha ao subir comprovante");
                const uploadData = await uploadRes.json();
                uploadedUrl = uploadData.url;
            }

            const isEdit = selectedTransaction.status === 'Pago';
            const actionPayload = isReversingPending ? {
                action: 'CANCEL_PAYMENT'
            } : (isEdit ? {
                action: 'EDIT',
                pagoEm: values.pagoEm,
                valorTotal: Number(values.valorTotal),
                comprovanteUrl: uploadedUrl || undefined,
            } : {
                action: 'PAY',
                pagoEm: values.pagoEm,
                comprovanteUrl: uploadedUrl || undefined,
            });

            const response = await fetch(`/api/financial/${selectedTransaction.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(actionPayload),
            });

            if (response.ok) {
                toast.success(isReversingPending ? "Pagamento estornado com sucesso!" : "Comissão salva com sucesso!");
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

    const exportColumns: ExportColumn<FinancialTransaction>[] = [
        { header: "Cód. Fin", accessor: (t) => t.id.substring(0, 8).toUpperCase() },
        { header: "Beneficiário (Vendedor)", accessor: (t) => t.vendedorNome || "Desconhecido" },
        { header: "Competência", accessor: (t) => t.mesAno },
        { header: "Valor do Rateio", accessor: (t) => `R$ ${Number(t.valorTotal || 0).toFixed(2)}` },
        { header: "Comprovante", accessor: (t) => t.comprovanteUrl ? "Anexado" : "Pendente" },
        { header: "Status", accessor: (t) => t.status },
        { header: "Liquidado Em", accessor: (t) => t.pagoEm ? new Date(t.pagoEm).toLocaleDateString("pt-BR") : "-" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Enterprise Hero Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-[#00355E] p-8 shadow-sm">
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
                            <DollarSign className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">Financeiro</h1>
                            <p className="mt-1 text-primary-foreground/80 font-medium text-sm">Controle de liquidação de comissões e fluxo de caixa.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <ExportButton
                            onExportCsv={() => exportToCsv("financeiro", exportColumns, transactions)}
                            onExportPdf={() => exportToPdf("Relatório Financeiro", "financeiro", exportColumns, transactions)}
                        />
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground transition-all font-bold px-6 py-3 h-auto"
                        >
                            <Filter className="h-5 w-5" />
                            Filtrar Período
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="border border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
                <CardHeader className="bg-white border-b border-slate-100 pb-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">Pagamentos de Comissão</CardTitle>
                            <CardDescription className="text-slate-500 font-medium mt-1">Lista de comissões aprovadas aguardando pagamento.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-sidebar [&_th]:text-sidebar-foreground font-bold">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-semibold text-sidebar-foreground h-12">Vendedor</TableHead>
                                <TableHead className="font-semibold text-sidebar-foreground">Mês/Ano</TableHead>
                                <TableHead className="font-semibold text-sidebar-foreground">Valor Total</TableHead>
                                <TableHead className="font-semibold text-sidebar-foreground">Status</TableHead>
                                <TableHead className="text-right font-semibold text-sidebar-foreground">Ações</TableHead>
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
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
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
                                                    ? 'bg-primary/10 text-primary border-primary/20 font-bold px-2.5 py-0.5 shadow-sm'
                                                    : 'bg-amber-100/80 text-amber-700 hover:bg-amber-200/80 border-amber-200/50 font-bold px-2.5 py-0.5 shadow-sm'}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {t.status === 'Pago' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                                    {t.status}
                                                </div>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {(t.status === 'Em aberto' || t.status === 'Pago') ? (
                                                <div className="flex justify-end gap-2">
                                                    {t.comprovanteUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-primary hover:text-primary-foreground hover:bg-primary/90"
                                                            asChild
                                                        >
                                                            <a href={t.comprovanteUrl} target="_blank" rel="noopener noreferrer">
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {t.status === 'Em aberto' && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleReverse(t.id)}
                                                            disabled={deletingId === t.id && isSubmitting}
                                                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shadow-none"
                                                            title="Excluir Financeiro e Estornar Comissão"
                                                        >
                                                            {deletingId === t.id && isSubmitting ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant={t.status === 'Pago' ? "outline" : "default"}
                                                        onClick={() => handleOpenPaymentDialog(t)}
                                                        className={`rounded-xl shadow-md transition-all font-semibold gap-1.5 hover:scale-[1.02] ${t.status === 'Pago' ? 'border-primary text-primary hover:bg-primary/5' : 'bg-primary hover:bg-primary/90 border-none text-primary-foreground hover:shadow-lg'}`}
                                                    >
                                                        <DollarSign className="h-4 w-4" />
                                                        {t.status === 'Pago' ? 'Editar' : 'Pagar'}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2 pr-2">
                                                    <CheckCircle2 className="h-5 w-5 text-primary/50" />
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
                    {/* Solid Financial Header */}
                    <div className="relative bg-primary px-6 py-5">
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                                <DollarSign className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-primary-foreground leading-none">Pagar Comissão</DialogTitle>
                                <DialogDescription className="text-primary-foreground/80 text-sm mt-1">
                                    Registrar liquidação de pagamento para o colaborador.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="px-6 py-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                {selectedTransaction && (
                                    <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-sm text-slate-500 font-medium mb-1">Valor a ser pago</p>
                                        {selectedTransaction.status === 'Pago' ? (
                                            <FormField
                                                control={form.control as any}
                                                name="valorTotal"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5 mt-2">
                                                        <FormControl>
                                                            <div className="relative">
                                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                                                    className="pl-10 h-10 rounded-xl border-slate-200 bg-white font-bold text-lg text-primary focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        ) : (
                                            <p className="text-3xl font-bold text-primary font-outfit">{formatCurrency(selectedTransaction.valorTotal)}</p>
                                        )}
                                        <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Vendedor</span>
                                            <span className="font-semibold text-slate-700">{selectedTransaction.vendedorNome}</span>
                                        </div>

                                        {isReversingPending && (
                                            <div className="mt-4 p-3 rounded-lg bg-orange-100 border border-orange-200 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                                                <RotateCcw className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-orange-800 text-xs uppercase">Estorno em Andamento</p>
                                                    <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                                                        Ao salvar, este pagamento será **cancelado** e voltará ao status pendente. O comprovante será removido.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!isReversingPending ? (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <FormField
                                            control={form.control as any}
                                            name="pagoEm"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Data de Pagamento</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                            <Input type="date" {...(field as any)} className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:bg-white transition-colors" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control as any}
                                            name="comprovante"
                                            render={({ field: { value, onChange, ...fieldProps } }) => (
                                                <FormItem className="space-y-1.5">
                                                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Anexar Comprovante (Opcional)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                            <Input
                                                                type="file"
                                                                accept="application/pdf,image/*"
                                                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:bg-white transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                                onChange={(event) => onChange(event.target.files)}
                                                                {...(fieldProps as any)}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center bg-orange-50/30 border-2 border-dashed border-orange-200 rounded-2xl mb-6">
                                        <RotateCcw className="h-10 w-10 text-orange-300 mb-2 animate-pulse" />
                                        <p className="text-orange-600 font-bold text-sm">Pronto para Estornar</p>
                                        <p className="text-orange-500 text-xs px-10 text-center mt-1">Clique em "Salvar Alterações" para confirmar.</p>
                                    </div>
                                )}

                                <DialogFooter className="pt-6 gap-2 sm:gap-0 flex-col sm:flex-row border-t border-slate-100 mt-2">
                                    <div className="flex gap-2">
                                        {selectedTransaction?.status === 'Pago' && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={toggleReversalPending}
                                                className={`rounded-xl border-none font-semibold gap-2 transition-all mr-auto ${isReversingPending
                                                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    : "bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                                                    }`}
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                {isReversingPending ? "Desfazer Estorno" : "Estornar Pagamento"}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
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
                                            className={`rounded-xl shadow-lg transition-all hover:scale-[1.02] border-none font-semibold gap-2 ${isReversingPending
                                                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200"
                                                : "bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground shadow-sidebar/20"
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" />Processando...</>
                                            ) : isReversingPending ? (
                                                "Confirmar Estorno"
                                            ) : selectedTransaction?.status === 'Pago' ? (
                                                "Salvar Alterações"
                                            ) : (
                                                "Confirmar Pagamento"
                                            )}
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <div className="bg-rose-600 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                                <Trash2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white leading-none">Confirmar Exclusão</DialogTitle>
                                <DialogDescription className="text-white/80 text-sm mt-1">
                                    Esta ação não pode ser desfeita.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 border border-rose-100 mb-6">
                            <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold text-rose-900 mb-1 leading-tight">Impacto Sistêmico</p>
                                <p className="text-rose-700/90 leading-relaxed font-medium">
                                    Ao apagar este registro, a **Comissão original será reaberta**. Você terá que aprová-la novamente se quiser que este pagamento volte a existir.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="rounded-xl border-slate-200 text-slate-600"
                            >
                                Manter Registro
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200 border-none font-bold gap-2"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Excluir e Reabrir Comissão
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Modal de Alerta de Integridade (Bloqueio) ── */}
            <Dialog open={isIntegrityAlertOpen} onOpenChange={setIsIntegrityAlertOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                    <div className="bg-amber-500 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white leading-none">Ação Bloqueada</DialogTitle>
                                <DialogDescription className="text-white/80 text-sm mt-1">
                                    Segurança de integridade financeira.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100 mb-6">
                            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                            <div>
                                <p className="font-bold text-amber-900 mb-1">Não é possível processar</p>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    {integrityErrorMessage}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsIntegrityAlertOpen(false)}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold py-6"
                        >
                            Compreendido
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
