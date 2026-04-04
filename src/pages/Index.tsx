import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { NewConsultorio } from '@/features/new-consultorio/NewConsultorio.tsx';
import { DoorOpen, HeartHandshake, Monitor, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const cardBaseClassName =
    'h-full min-h-[260px] rounded-2xl border-0 bg-white p-8 shadow-sm outline-none transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center justify-between';
  const iconBoxBaseClassName =
    'mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border transition-transform group-hover:scale-110';

  const cardTitleClassName = "text-[1.25rem] font-black uppercase tracking-[0.05em] text-gray-800 flex items-center justify-center min-h-[56px]";
  const cardDescClassName = "text-[1rem] font-semibold text-gray-600 leading-[1.3] min-h-[40px] flex items-center justify-center";

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
    <Header title="Sistema de Gestão do Painel de Chamadas" />
      <main className="container mx-auto py-12 px-6 flex-grow flex flex-col justify-center">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">
            Menu Principal
          </h2>
          <div className="h-1.5 w-24 bg-[#ffcc00] mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto w-full items-stretch">
          <Link to="/reception" className="block group h-full">
            <Card className={`${cardBaseClassName} border-b-8 border-[#005a2b]`}>
              <div className="flex flex-col items-center">
                <div className={`${iconBoxBaseClassName} bg-green-50 border-green-200`}>
                  <UserPlus className="h-11 w-11 text-[#005a2b]" />
                </div>
                <h3 className={cardTitleClassName}>
                  Recepção
                </h3>
              </div>

              <p className={cardDescClassName}>
                Registro de novos Pacientes
              </p>
            </Card>
          </Link>

          <Link to="/triage" className="block group h-full">
            <Card className={`${cardBaseClassName} border-b-8 border-blue-600`}>
              <div className="flex flex-col items-center">
                <div className={`${iconBoxBaseClassName} bg-blue-50 border-blue-100`}>
                  <HeartHandshake className="h-11 w-11 text-blue-600" />
                </div>
                <h3 className={cardTitleClassName}>
                  Acolhimento
                </h3>
              </div>

              <p className={cardDescClassName}>
                Classificação de risco e priorização de atendimento.
              </p>
            </Card>
          </Link>

          <Link to="/doctor" className="block group h-full">
            <Card className={`${cardBaseClassName} border-b-8 border-black`}>
              <div className="flex flex-col items-center">
                <div className={`${iconBoxBaseClassName} bg-gray-100 border-gray-300`}>
                  <DoorOpen className="h-11 w-11 text-gray-900" />
                </div>
                <h3 className={cardTitleClassName}>
                  Consultório
                </h3>
              </div>

              <p className={cardDescClassName}>
                Atendimento médico especializado
              </p>
            </Card>
          </Link>

          <Link to="/panel" className="block group h-full">
            <Card className={`${cardBaseClassName} border-b-8 border-[#ffcc00]`}>
              <div className="flex flex-col items-center">
                <div className={`${iconBoxBaseClassName} bg-yellow-50 border-yellow-100`}>
                  <Monitor className="h-11 w-11 text-yellow-600" />
                </div>
                <h3 className={cardTitleClassName}>
                  Painel
                </h3>
              </div>

              <p className={cardDescClassName}>
                Visualização de chamadas e controle de fluxo da sala de espera
              </p>
            </Card>
          </Link>

          <NewConsultorio />
        </div>
      </main>
    </div>
  );
}
