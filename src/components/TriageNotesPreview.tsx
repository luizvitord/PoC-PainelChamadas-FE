import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TriageNotesPreviewProps {
  notes: string;
}

// Acima disso (ou com quebra de linha) a anotação não cabe nas 2 linhas da fila e ganha o botão.
export const NOTES_PREVIEW_LIMIT = 120;

// Anotação da triagem na fila do médico: até 2 linhas e, se for longa, "Ver anotação completa" abre
// o texto inteiro no próprio card. O overflow-wrap:anywhere quebra até palavras sem espaço; sem ele,
// um texto assim alargava a tabela e empurrava os botões para fora da tela.
export function TriageNotesPreview({ notes }: TriageNotesPreviewProps) {
  const [open, setOpen] = useState(false);
  const text = notes.trim();
  const isLong = text.length > NOTES_PREVIEW_LIMIT || text.includes('\n');

  if (!isLong) {
    return <p className="mt-1 text-sm text-slate-500 [overflow-wrap:anywhere]">{text}</p>;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-1">
      {!open && <p className="line-clamp-2 text-sm text-slate-500 [overflow-wrap:anywhere]">{text}</p>}

      <CollapsibleContent className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 [overflow-wrap:anywhere]">
        {text}
      </CollapsibleContent>

      <CollapsibleTrigger className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
        {open ? 'Ocultar anotação' : 'Ver anotação completa'}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </CollapsibleTrigger>
    </Collapsible>
  );
}
