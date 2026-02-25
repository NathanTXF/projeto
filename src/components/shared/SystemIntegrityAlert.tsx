import { AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface SystemIntegrityAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
}

export function SystemIntegrityAlert({
    open,
    onOpenChange,
    message,
}: SystemIntegrityAlertProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <div className="bg-amber-500 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                            <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-white leading-none">Ação Bloqueada</DialogTitle>
                            <DialogDescription className="text-white/80 text-sm mt-1">
                                Segurança de integridade do sistema.
                            </DialogDescription>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100 mb-6">
                        <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                        <div>
                            <p className="font-bold text-amber-900 mb-1 leading-tight">Uso Identificado</p>
                            <p className="text-amber-800 text-sm leading-relaxed">
                                {message || "Este registro não pode ser excluído pois está sendo utilizado em outros cadastros ou contratos."}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold py-6 active:scale-95 transition-all text-base"
                    >
                        Pode deixar, entendi!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
