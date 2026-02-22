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
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Customer, calculateAge } from "../../domain/entities";
import { Edit, Trash2, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome ou CPF..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="border-none shadow-lg overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">Lista de Clientes</CardTitle>
                            <CardDescription>Gerencie todos os clientes cadastrados.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[80px] font-semibold text-slate-700">Cód</TableHead>
                                <TableHead className="font-semibold text-slate-700">Nome</TableHead>
                                <TableHead className="font-semibold text-slate-700">CPF/CNPJ</TableHead>
                                <TableHead className="font-semibold text-slate-700">Idade</TableHead>
                                <TableHead className="font-semibold text-slate-700">Sexo</TableHead>
                                <TableHead className="font-semibold text-slate-700">Cidade/UF</TableHead>
                                <TableHead className="font-semibold text-slate-700">Celular</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-slate-400 italic">
                                        Nenhum cliente encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium text-slate-600">{customer.cod}</TableCell>
                                        <TableCell className="font-semibold text-slate-800">{customer.nome}</TableCell>
                                        <TableCell className="text-slate-600">{customer.cpfCnpj}</TableCell>
                                        <TableCell className="text-slate-600">
                                            {customer.dataNascimento ? calculateAge(customer.dataNascimento) : "-"}
                                        </TableCell>
                                        <TableCell className="capitalize text-slate-600">{customer.sexo}</TableCell>
                                        <TableCell className="text-slate-600">{customer.cidade} / {customer.estado}</TableCell>
                                        <TableCell className="text-slate-600">{customer.celular}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {userLevel !== 3 && (
                                                <>
                                                    <Button variant="ghost" size="icon" onClick={() => onEdit(customer)} className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" onClick={() => customer.id && onDelete(customer.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
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
