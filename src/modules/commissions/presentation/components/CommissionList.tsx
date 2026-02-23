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
import { CheckCircle, XCircle } from "lucide-react";
import { Commission } from "../../domain/entities";

interface CommissionListProps {
    commissions: any[];
    onApprove: (id: string) => void;
    onCancel: (id: string) => void;
}

const statusColors: Record<string, string> = {
    EM_ABERTO: "bg-yellow-100 text-yellow-800 border-yellow-200",
    APROVADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELADO: "bg-red-100 text-red-800 border-red-200",
};

export function CommissionList({ commissions, onApprove, onCancel }: CommissionListProps) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow>
                        <TableHead className="font-semibold text-slate-700">Vendedor</TableHead>
                        <TableHead className="font-semibold text-slate-700">Contrato</TableHead>
                        <TableHead className="font-semibold text-slate-700">Cliente</TableHead>
                        <TableHead className="font-semibold text-slate-700">Período</TableHead>
                        <TableHead className="font-semibold text-slate-700">Tipo</TableHead>
                        <TableHead className="font-semibold text-slate-700">Valor Comissão</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
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
                        commissions.map((c) => (
                            <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-semibold text-slate-800">{c.vendedor?.nome || 'N/A'}</TableCell>
                                <TableCell className="font-semibold text-slate-500 font-outfit text-xs">#{c.loan?.cod || 'N/A'}</TableCell>
                                <TableCell className="text-slate-600">{c.loan?.cliente?.nome || 'N/A'}</TableCell>
                                <TableCell className="text-slate-600 font-medium">{c.mesAno}</TableCell>
                                <TableCell>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                        {c.tipoComissao.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold text-emerald-600 font-outfit text-md">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(c.valorCalculado))}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`${statusColors[c.status]} font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 border-none`}>
                                        {c.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {c.status === 'EM_ABERTO' && (
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" onClick={() => onApprove(c.id)}>
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" onClick={() => onCancel(c.id)}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
