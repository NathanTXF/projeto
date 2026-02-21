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
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor Comissão</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
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
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.vendedor?.nome || 'N/A'}</TableCell>
                                <TableCell>#{c.loan?.cod || 'N/A'}</TableCell>
                                <TableCell>{c.loan?.cliente?.nome || 'N/A'}</TableCell>
                                <TableCell>{c.mesAno}</TableCell>
                                <TableCell>
                                    <span className="text-xs uppercase font-semibold text-muted-foreground">
                                        {c.tipoComissao.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold text-emerald-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(c.valorCalculado))}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={statusColors[c.status]}>
                                        {c.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {c.status === 'EM_ABERTO' && (
                                        <>
                                            <Button variant="ghost" size="icon" className="text-emerald-600" onClick={() => onApprove(c.id)}>
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onCancel(c.id)}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </>
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
