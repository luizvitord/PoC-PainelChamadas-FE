import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import { IndicatorsFeature } from '@/features/indicators/IndicatorsFeature';
export default function Indicators() {
  return <div className="min-h-screen bg-[#f5f8fb]"><Header title="Indicadores de Atendimento" /><div className="mx-auto w-full max-w-screen-2xl px-3 pt-6"><BackButton /></div><IndicatorsFeature /></div>;
}
