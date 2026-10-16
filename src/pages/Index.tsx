import Header from '@/components/Header';
import { MenuCard } from '@/components/MenuCard';
import { NewConsultorio } from '@/features/new-consultorio/NewConsultorio';
import { ChartColumn, DoorOpen, HeartHandshake, Monitor, UserPlus } from 'lucide-react';

const MENU_ITEMS = [
  {
    to: '/reception',
    icon: UserPlus,
    title: 'Recepção',
    description: 'Registro de novos Pacientes',
    borderColor: 'border-[#005a2b]',
    iconBg: 'bg-green-50',
    iconBorder: 'border-green-200',
    iconColor: 'text-[#005a2b]',
  },
  {
    to: '/triage',
    icon: HeartHandshake,
    title: 'Acolhimento',
    description: 'Classificação de risco e priorização de atendimento.',
    borderColor: 'border-blue-600',
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    to: '/doctor',
    icon: DoorOpen,
    title: 'Consultório',
    description: 'Atendimento médico especializado',
    borderColor: 'border-black',
    iconBg: 'bg-gray-100',
    iconBorder: 'border-gray-300',
    iconColor: 'text-gray-900',
  },
  {
    to: '/panel',
    icon: Monitor,
    title: 'Painel',
    description: 'Visualização de chamadas e controle de fluxo da sala de espera',
    borderColor: 'border-[#ffcc00]',
    iconBg: 'bg-yellow-50',
    iconBorder: 'border-yellow-100',
    iconColor: 'text-yellow-600',
  },
  {
    to: '/indicators',
    icon: ChartColumn,
    title: 'Indicadores',
    description: 'Visualização de indicadores do atendimento',
    borderColor: 'border-purple-600',
    iconBg: 'bg-purple-50',
    iconBorder: 'border-purple-100',
    iconColor: 'text-purple-600',
    restricted: true,
  },
] as const;

export default function Index() {
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
          {MENU_ITEMS.map((item) => (
            <MenuCard key={item.to} {...item} />
          ))}
          <NewConsultorio />
        </div>
      </main>
    </div>
  );
}