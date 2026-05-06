import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

import { NewConsultorioDialog } from './components/NewConsultorioDialog';
import { useNewConsultorio } from './hooks/useNewConsultorio';

const cardBaseClassName =
  'h-full min-h-[260px] rounded-2xl border-0 bg-white p-8 shadow-sm outline-none transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center justify-between';

const iconBoxBaseClassName =
  'mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border transition-transform group-hover:scale-110';

export function NewConsultorio() {
  const {
    consultorioNumero,
    consultorios,
    handleAddConsultorio,
    handleNumeroChange,
    handleOpen,
    handleOpenChange,
    isOpen,
  } = useNewConsultorio();

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void handleOpen();
          }
        }}
        className={`${cardBaseClassName} group cursor-pointer border-b-8 border-orange-500`}
        aria-label="Abrir gestão de novo consultório"
      >
        <div className="flex flex-col items-center">
          <div className={`${iconBoxBaseClassName} bg-orange-50 border-orange-100`}>
            <Plus className="h-11 w-11 text-orange-600" />
          </div>
          <h3 className="text-lg font-black text-gray-800 uppercase mb-2 min-h-[56px] flex items-center justify-center">
            Novo Consultório
          </h3>
        </div>

        <p className="text-xs text-gray-500 font-medium leading-relaxed min-h-[40px] flex items-center justify-center">
          Adicionar nova sala de atendimento
        </p>
      </Card>

      <NewConsultorioDialog
        isOpen={isOpen}
        consultorioNumero={consultorioNumero}
        consultorios={consultorios}
        onNumeroChange={handleNumeroChange}
        onOpenChange={handleOpenChange}
        onSubmit={handleAddConsultorio}
      />
    </>
  );
}
