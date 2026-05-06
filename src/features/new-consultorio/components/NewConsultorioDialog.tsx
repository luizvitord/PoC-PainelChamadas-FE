import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Consultorio } from '@/services/ConsultorioService';

interface NewConsultorioDialogProps {
  consultorioNumero: string;
  consultorios: Consultorio[];
  isOpen: boolean;
  onNumeroChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function NewConsultorioDialog({
  consultorioNumero,
  consultorios,
  isOpen,
  onNumeroChange,
  onOpenChange,
  onSubmit,
}: NewConsultorioDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden border-0 bg-white p-0 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <DialogHeader className="border-b border-slate-200 px-8 pb-5 pt-8 text-left">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
            Adicionar Consultório
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm font-medium text-slate-500">
            Insira o número do novo consultório.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-8 py-6">
          <div className="space-y-2">
            <label
              htmlFor="new-consultorio-numero"
              className="text-sm font-black uppercase tracking-[0.08em] text-slate-700"
            >
              Número do Consultório
            </label>
            <input
              id="new-consultorio-numero"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="1"
              max="9"
              step="1"
              placeholder="Ex: 1"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-900 outline-none transition focus:border-[#008140] focus:bg-white focus:ring-2 focus:ring-[#008140]/10"
              value={consultorioNumero}
              onChange={(event) => onNumeroChange(event.target.value)}
              onKeyDown={(event) => {
                const allowedKeys = [
                  'Backspace',
                  'Tab',
                  'ArrowLeft',
                  'ArrowRight',
                  'ArrowUp',
                  'ArrowDown',
                  'Delete',
                  'Home',
                  'End',
                  'Enter',
                ];

                if (allowedKeys.includes(event.key)) {
                  return;
                }

                if (!/^\d$/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              onPaste={(event) => {
                const pastedText = event.clipboardData.getData('text');

                if (!/^\d+$/.test(pastedText)) {
                  event.preventDefault();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.08em] text-slate-700">Consultórios cadastrados</p>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              {consultorios.length === 0 ? (
                <p className="text-sm font-medium text-slate-500">Nenhum consultório cadastrado.</p>
              ) : (
                <ul className="space-y-2">
                  {consultorios.map((consultorio) => (
                    <li
                      key={consultorio.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      {`Consultório ${consultorio.numero ?? consultorio.id}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-8 py-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-slate-300 px-6 font-bold uppercase tracking-[0.08em] text-slate-700"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl bg-[#008140] px-6 font-bold uppercase tracking-[0.08em] text-white hover:bg-[#006434]"
            onClick={onSubmit}
          >
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
