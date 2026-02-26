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
import { Card, CardContent } from "@/components/ui/card";
import { Customer, calculateAge } from "../../domain/entities";
import { Edit, Trash2, Search, UserCircle, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/Badge";

interface CustomerListProps {
    customers: Customer[];
    userLevel?: number;
    onEdit: (customer: Customer) => void;
    onDelete: (id: string) => void;
}

export function CustomerList({ customers, userLevel, onEdit, onDelete }: CustomerListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCustomers = customers.filter((c) =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cpfCnpj.includes(searchTerm)
    );

    return (
        <div className="space-y-4">
            {/* ── Barra de Busca ── */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Buscar por nome ou CPF..."
                    className="pl-10 rounded-xl border-slate-300 bg-white shadow-sm focus-visible:ring-sidebar/20 focus-visible:border-sidebar transition-all h-11"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        {filteredCustomers.length} resultado{filteredCustomers.length !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* ── Tabela de Clientes ── */}
            <Card className="border border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-sidebar [&_th]:text-sidebar-foreground font-bold">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-semibold text-sidebar-foreground text-xs uppercase tracking-wider h-12 pl-6">Cliente</TableHead>
                                    <TableHead className="font-semibold text-sidebar-foreground text-xs uppercase tracking-wider">CPF/CNPJ</TableHead>
                                    <TableHead className="font-semibold text-sidebar-foreground text-xs uppercase tracking-wider">Idade</TableHead>
                                    <TableHead className="font-semibold text-sidebar-foreground text-xs uppercase tracking-wider">Sexo</TableHead>
                                    <TableHead className="font-semibold text-sidebar-foreground text-xs uppercase tracking-wider">Localidade</TableHead>
                                    <TableHead className="font-semibold text-sidebar-foreground text-xs uppercase tracking-wider">Celular</TableHead>
                                    <TableHead className="text-right font-semibold text-sidebar-foreground text-xs uppercase tracking-wider pr-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-32">
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <UserCircle className="h-10 w-10 text-slate-300" />
                                                <p className="font-medium">Nenhum cliente encontrado.</p>
                                                <p className="text-xs text-slate-300">
                                                    {searchTerm ? "Tente ajustar sua busca." : "Cadastre seu primeiro cliente."}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer.id} className="group hover:bg-indigo-50/30 transition-colors border-slate-100/80">
                                            {/* Nome com Avatar */}
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                        <AvatarFallback className="bg-sidebar text-white text-xs font-bold">
                                                            {customer.nome.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-800 text-sm">{customer.nome}</span>
                                                        <span className="text-xs text-slate-500 font-bold">Cód. {customer.cod}</span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* CPF/CNPJ */}
                                            <TableCell>
                                                <span className="text-sm text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    {customer.cpfCnpj}
                                                </span>
                                            </TableCell>

                                            {/* Idade */}
                                            <TableCell className="text-sm text-slate-600 font-medium">
                                                {customer.dataNascimento ? (
                                                    <span>{calculateAge(customer.dataNascimento)} anos</span>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </TableCell>

                                            {/* Sexo */}
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        customer.sexo === "masculino"
                                                            ? "bg-sidebar/10 text-sidebar border-sidebar/20 font-bold text-[10px]"
                                                            : "bg-pink-50 text-pink-700 border-pink-100 font-bold text-[10px]"
                                                    }
                                                >
                                                    {customer.sexo === "masculino" ? "M" : "F"}
                                                </Badge>
                                            </TableCell>

                                            {/* Cidade/UF */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                    <span>{customer.cidade}/{customer.estado}</span>
                                                </div>
                                            </TableCell>

                                            {/* Celular */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                    <span>{customer.celular}</span>
                                                </div>
                                            </TableCell>

                                            {/* Ações */}
                                            <TableCell className="text-right pr-6">
                                                {userLevel !== 3 && (
                                                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onEdit(customer)}
                                                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            onClick={() => customer.id && onDelete(customer.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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
                </CardContent>
            </Card>
        </div>
    );
}
