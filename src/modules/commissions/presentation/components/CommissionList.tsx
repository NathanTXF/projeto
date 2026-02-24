"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, XCircle, Save } from "lucide-react";
import { Commission } from "../../domain/entities";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface CommissionListProps {
    commissions: any[];
    onApprove: (id: string, data?: any) => void;
    onCancel: (id: string) => void;
}

const statusColors: Record<string, string> = {
    EM_ABERTO: "bg-yellow-100 text-yellow-800 border-yellow-200",
    APROVADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELADO: "bg-red-100 text-red-800 border-red-200",
    PENDENTE_GERACAO: "bg-blue-100 text-blue-800 border-blue-200",
};

export function CommissionList({ commissions, onApprove, onCancel }: CommissionListProps) {
    const [pendingData, setPendingData] = useState<Record<string, { tipo: string, referencia: number }>>({});

    const handleDataChange = (id: string, field: string, value: any) => {
        setPendingData(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || { tipo: 'PORCENTAGEM', referencia: 0 }),
                [field]: value
            }
        }));
    };

    return (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-sidebar [&_th]:text-sidebar-foreground font-bold border-b-none">
                    <TableRow>
                        <TableHead className="font-semibold text-sidebar-foreground">Vendedor</TableHead>
                        <TableHead className="font-semibold text-sidebar-foreground">Contrato</TableHead>
                        <TableHead className="font-semibold text-sidebar-foreground">Cliente</TableHead>
                        <TableHead className="font-semibold text-sidebar-foreground text-center">Referência</TableHead>
                        <TableHead className="font-semibold text-sidebar-foreground">Tipo</TableHead>
                        <TableHead className="font-semibold text-sidebar-foreground">Valor Comissão</TableHead>
                        <TableHead className="font-semibold text-sidebar-foreground">Status</TableHead>
                        <TableHead className="text-right font-semibold text-sidebar-foreground">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {commissions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                Nenhuma comissão encontrada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        commissions.map((c) => {
                            const isPending = c.status === 'PENDENTE_GERACAO';
                            const currentData = pendingData[c.id] || {
                                tipo: c.tipoComissao || 'PORCENTAGEM',
                                referencia: c.valorReferencia || 0
                            };

                            const valorCalculado = isPending
                                ? (currentData.tipo === 'PORCENTAGEM'
                                    ? (Number(c.loan.valorLiquido) * currentData.referencia) / 100
                                    : currentData.referencia)
                                : Number(c.valorCalculado);

                            return (
                                <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-semibold text-slate-800">{c.vendedor?.nome || 'N/A'}</TableCell>
                                    <TableCell className="font-semibold text-slate-500 font-outfit text-xs">#{c.loan?.cod || 'N/A'}</TableCell>
                                    <TableCell className="text-slate-600">{c.loan?.cliente?.nome || 'N/A'}</TableCell>
                                    <TableCell className="text-center min-w-[120px]">
                                        {isPending ? (
                                            <Input
                                                type="number"
                                                className="h-8 w-20 mx-auto text-center font-bold"
                                                value={currentData.referencia}
                                                onChange={(e) => handleDataChange(c.id, 'referencia', Number(e.target.value))}
                                            />
                                        ) : (
                                            <span className="font-bold text-slate-600">
                                                {c.tipoComissao === 'PORCENTAGEM' ? `${c.valorReferencia}%` : `R$ ${c.valorReferencia}`}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {isPending ? (
                                            <Select
                                                value={currentData.tipo}
                                                onValueChange={(v) => handleDataChange(c.id, 'tipo', v)}
                                            >
                                                <SelectTrigger className="h-8 w-32 text-[10px] font-bold uppercase">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PORCENTAGEM">Porcentagem</SelectItem>
                                                    <SelectItem value="VALOR_FIXO">Valor Fixo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                {c.tipoComissao.replace('_', ' ')}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-bold text-emerald-600 font-outfit text-md">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorCalculado)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${statusColors[c.status]} font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 border-none`}>
                                            {c.status.replace('_', ' ').replace('PENDENTE GERACAO', 'NÃO GERADA')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <div className="flex justify-end gap-1">
                                            {(c.status === 'EM_ABERTO' || isPending) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-8 w-8 rounded-xl transition-colors ${isPending ? 'text-blue-500 hover:bg-blue-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                    onClick={() => onApprove(c.id, isPending ? { ...currentData, loanId: c.loanId, vendedorId: c.vendedorId, mesAno: c.mesAno, valorBase: Number(c.loan.valorLiquido) } : undefined)}
                                                >
                                                    {isPending ? <Save className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                </Button>
                                            )}
                                            {c.status === 'EM_ABERTO' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" onClick={() => onCancel(c.id)}>
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
