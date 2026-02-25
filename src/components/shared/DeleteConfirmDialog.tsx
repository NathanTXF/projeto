import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting: boolean;
    itemName: string;
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    isDeleting,
    itemName,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <p className="text-slate-600 font-medium mb-6">
                        Tem certeza que deseja remover este {itemName.toLowerCase()}? Se ele estiver vinculado a outros registros, a ação será bloqueada automaticamente.
                    </p>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl border-slate-200 text-slate-600 font-semibold"
                        >
                            Manter Registro
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200 border-none font-bold gap-2"
                        >
                            {isDeleting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" />Excluindo...</>
                            ) : (
                                <><Trash2 className="h-4 w-4" />Confirmar Exclusão</>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
