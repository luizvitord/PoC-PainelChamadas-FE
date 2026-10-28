import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtocoloTempo } from '@/types/protocolo';
import { ReactNode } from 'react';

import { Escopo } from '../utils/escopo';
import { DetalhamentoNivel, EmergencyLevelTab } from './tabs/EmergencyLevelTab';
import { HourlyTab } from './tabs/HourlyTab';
import { VolumesTab } from './tabs/VolumesTab';
import { TemposEspera, WaitTimesTab } from './tabs/WaitTimesTab';

interface IndicatorsTabsProps {
  tempos?: TemposEspera;
  porRiscoETipo?: DetalhamentoNivel[];
  escopo?: Escopo;
  protocolos?: ProtocoloTempo[];
}

const INDICATOR_TABS: { value: string; label: string; render: (props: IndicatorsTabsProps) => ReactNode }[] = [
  // TODO IND-04: repassar o escopo e esconder no SAMU o que visivelNoEscopo (utils/escopo) indicar.
  { value: 'volumes', label: 'Volumes e Fluxo', render: () => <VolumesTab /> },
  { value: 'wait-times', label: 'Tempos de Espera', render: ({ tempos }) => <WaitTimesTab tempos={tempos} /> },
  {
    value: 'emergency-levels',
    label: 'Por Nível de Emergência',
    render: ({ porRiscoETipo, escopo, protocolos }) => (
      <EmergencyLevelTab porRiscoETipo={porRiscoETipo} escopo={escopo} protocolos={protocolos} />
    ),
  },
  { value: 'hourly', label: 'Atendidos por Horário', render: () => <HourlyTab /> },
];

const tabTriggerClassName =
  'rounded-lg border border-gray-200 bg-gray-100 px-5 py-3 text-base font-black uppercase tracking-[0.08em] text-gray-600 hover:bg-gray-200 hover:text-gray-800 data-[state=active]:border-[#008140] data-[state=active]:bg-[#008140] data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,129,64,0.28)]';

export function IndicatorsTabs(props: IndicatorsTabsProps) {
  return (
    <Tabs defaultValue="volumes">
      <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-3 rounded-none border-b-2 border-gray-100 bg-transparent p-0 pb-4">
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
