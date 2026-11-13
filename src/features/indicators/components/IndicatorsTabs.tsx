import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtocoloTempo } from '@/types/protocolo';
import { ReactNode } from 'react';

import type { AtendidoPorHorario } from '../hooks/useAtendidosPorHorario';
import { Escopo } from '../utils/escopo';
import { DetalhamentoNivel, EmergencyLevelTab } from './tabs/EmergencyLevelTab';
import { HourlyTab } from './tabs/HourlyTab';
import { SuicideRiskTab } from './tabs/SuicideRiskTab';
import { VolumesTab } from './tabs/VolumesTab';
import { TemposEspera, WaitTimesTab } from './tabs/WaitTimesTab';

interface IndicatorsTabsProps {
  tempos?: TemposEspera;
  porRiscoETipo?: DetalhamentoNivel[];
  escopo?: Escopo;
  protocolos?: ProtocoloTempo[];
  atendidos?: { data?: AtendidoPorHorario[]; carregando?: boolean; erro?: string };
}

const INDICATOR_TABS: { value: string; label: string; render: (props: IndicatorsTabsProps) => ReactNode }[] = [
  // TODO IND-04: os volumes e desistências entram com os dados do IND-01.
  { value: 'volumes', label: 'Volumes e Fluxo', render: ({ escopo }) => <VolumesTab escopo={escopo} /> },
  { value: 'wait-times', label: 'Tempos de Espera', render: ({ tempos }) => <WaitTimesTab tempos={tempos} /> },
  {
    value: 'emergency-levels',
    label: 'Por Nível de Emergência',
    render: ({ porRiscoETipo, escopo, protocolos }) => (
      <EmergencyLevelTab porRiscoETipo={porRiscoETipo} escopo={escopo} protocolos={protocolos} />
    ),
  },
  {
    value: 'hourly',
    label: 'Atendidos por Horário',
    render: ({ atendidos }) => (
      <HourlyTab atendidos={atendidos?.data} carregando={atendidos?.carregando} erro={atendidos?.erro} />
    ),
  },
  // Aba do design novo; os números dependem de um indicador de risco suicida no back.
  { value: 'suicide-risk', label: 'Risco Suicida', render: () => <SuicideRiskTab /> },
];

const tabTriggerClassName =
  'rounded-lg border border-slate-200 bg-slate-100 px-5 py-2.5 text-[14px] font-extrabold uppercase tracking-[0.08em] text-slate-600 hover:bg-slate-200 hover:text-slate-800 data-[state=active]:border-[#008140] data-[state=active]:bg-[#008140] data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,129,64,0.28)]';

export function IndicatorsTabs(props: IndicatorsTabsProps) {
  return (
    <Tabs defaultValue="volumes">
      <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-2.5 rounded-none border-b-2 border-slate-100 bg-transparent p-0 pb-4">
        {INDICATOR_TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className={tabTriggerClassName}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {INDICATOR_TABS.map(({ value, render }) => (
        <TabsContent key={value} value={value} className="mt-0">
          {render(props)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
