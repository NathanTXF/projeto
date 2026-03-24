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
import { User } from "../../domain/entities";
import { Edit, Trash2, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { parseAccessSchedule, WeekDayKey } from "../../domain/accessSchedule";

interface UserListProps {
    users: UserListItem[];
    userLevel?: number;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}

interface UserListItem extends User {
    role?: {
        name: string;
    };
}

const DAY_LABELS: Record<WeekDayKey, string> = {
    "0": "Dom",
    "1": "Seg",
    "2": "Ter",
    "3": "Qua",
    "4": "Qui",
    "5": "Sex",
    "6": "Sab",
};

export function UserList({ users, userLevel, onEdit, onDelete }: UserListProps) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-foreground border-b border-border/70">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="h-11 text-[11px] font-medium uppercase tracking-[0.12em]">Nome</TableHead>
                        <TableHead className="h-11 text-[11px] font-medium uppercase tracking-[0.12em]">Usuário</TableHead>
                        <TableHead className="h-11 text-[11px] font-medium uppercase tracking-[0.12em]">Nível</TableHead>
                        <TableHead className="h-11 text-[11px] font-medium uppercase tracking-[0.12em]">Expediente</TableHead>
                        <TableHead className="h-11 text-[11px] font-medium uppercase tracking-[0.12em]">Status</TableHead>
                        <TableHead className="h-11 text-right text-[11px] font-medium uppercase tracking-[0.12em]">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-36 text-muted-foreground font-medium">
                                Nenhum usuário cadastrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id} className={cn("hover:bg-muted/30 transition-colors border-border/60", user.ativo === false && "bg-muted/20 opacity-75")}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                                            {user.nome.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-foreground">{user.nome}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground font-medium">@{user.usuario}</TableCell>
                                <TableCell>
                                    {user.role ? (
                                        <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border border-primary/20 font-medium text-[10px] uppercase tracking-[0.1em]">
                                            <Shield className="h-3 w-3 mr-1" />
                                            {user.role.name}
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "w-fit font-medium text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 border",
                                                user.nivelAcesso === 1 && "bg-purple-100/70 text-purple-700 border-purple-200",
                                                user.nivelAcesso === 2 && "bg-blue-100/70 text-blue-700 border-blue-200",
                                                user.nivelAcesso === 3 && "bg-muted text-muted-foreground border-border"
                                            )}
                                        >
                                            {user.nivelAcesso === 1 ? "Gestor" : user.nivelAcesso === 2 ? "Vendedor+" : "Vendedor"}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        const schedule = parseAccessSchedule({
                                            diasAcesso: user.diasAcesso,
                                            horarioInicio: user.horarioInicio,
                                            horarioFim: user.horarioFim,
                                            horarioInicioFds: user.horarioInicioFds,
                                            horarioFimFds: user.horarioFimFds,
                                        });
                                        const enabledDays = (Object.keys(schedule) as WeekDayKey[])
                                            .filter((day) => schedule[day].enabled)
                                            .sort((a, b) => Number(a) - Number(b));

                                        return (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/20 px-2 py-0.5 rounded-md w-fit border border-border/70">
                                                    <Clock className="h-3 w-3" />
                                                    {enabledDays.length > 0
                                                        ? `${schedule[enabledDays[0]].start} - ${schedule[enabledDays[0]].end}`
                                                        : "Sem acesso"}
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {enabledDays.map((day) => (
                                                        <span
                                                            key={`${user.id}-${day}`}
                                                            className="text-[10px] text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                                                        >
                                                            {DAY_LABELS[day]} {schedule[day].start}-{schedule[day].end}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn("text-[9px] font-medium uppercase px-2 py-0.5 border", user.ativo !== false ? "bg-emerald-100/70 text-emerald-700 border-emerald-200" : "bg-rose-100/70 text-rose-700 border-rose-200")}>
                                        {user.ativo !== false ? "Ativo" : "Inativo"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {userLevel === 1 && (
                                        <div className="flex justify-end gap-1 opacity-80 hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(user)}
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                onClick={() => user.id && onDelete(user.id)}
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
    );
}
