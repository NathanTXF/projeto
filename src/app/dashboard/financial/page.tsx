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
    Filter
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
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
                    <Button className="gap-2 rounded-xl shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-none">
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
                        <p className="text-xs text-emerald-600/70 mt-1">Acumulado total</p>
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
                        <p className="text-xs text-rose-600/70 mt-1">Comissões e despesas</p>
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
                        <p className="text-xs text-blue-200 mt-1">Disponível em caixa</p>
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
                                        Carregando movimentações...
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
                                        <TableCell className="text-slate-600 max-w-xs truncate">
                                            {t.descricao}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                                {t.categoria}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={t.tipo === 'ENTRADA' ? 'default' : 'destructive'}
                                                className={t.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none' : 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-none'}
                                            >
                                                {t.tipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${t.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'}`}>
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
        </div>
    );
}
