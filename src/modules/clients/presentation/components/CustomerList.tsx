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

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Cód</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF/CNPJ</TableHead>
                            <TableHead>Idade</TableHead>
                            <TableHead>Sexo</TableHead>
                            <TableHead>Cidade/UF</TableHead>
                            <TableHead>Celular</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                    Nenhum cliente encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>{customer.cod}</TableCell>
                                    <TableCell className="font-medium">{customer.nome}</TableCell>
                                    <TableCell>{customer.cpfCnpj}</TableCell>
                                    <TableCell>
                                        {customer.dataNascimento ? calculateAge(customer.dataNascimento) : "-"}
                                    </TableCell>
                                    <TableCell className="capitalize">{customer.sexo}</TableCell>
                                    <TableCell>{customer.cidade} / {customer.estado}</TableCell>
                                    <TableCell>{customer.celular}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {userLevel !== 3 && (
                                            <>
                                                <Button variant="ghost" size="icon" onClick={() => onEdit(customer)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => customer.id && onDelete(customer.id)}>
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
            </div>
        </div>
    );
}
