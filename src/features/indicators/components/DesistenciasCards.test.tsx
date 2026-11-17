import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import geralJson from '../mocks/geral.json';
import samuJson from '../mocks/samu.json';
import type { IndicadoresResponse } from '../types';
import { DesistenciasCards } from './DesistenciasCards';

const geral = geralJson as IndicadoresResponse;
const samu = samuJson as IndicadoresResponse;

const valor = (titulo: string) => screen.getByText(titulo).parentElement!.querySelector('p')?.textContent;

describe('DesistenciasCards', () => {
  it('mostra o total e cada etapa com os números do back (Geral)', () => {
    render(<DesistenciasCards desistencias={geral} escopo="GERAL" />);

    expect(valor('Total de desistências')).toBe('5');
    expect(valor('Acolhimento → Classificação')).toBe('2');
    expect(valor('Classificação → Consulta')).toBe('2');
    expect(valor('Após serem chamados')).toBe('1');
  });

  it('no SAMU esconde Acolhimento → Classificação e mantém as outras etapas', () => {
    render(<DesistenciasCards desistencias={samu} escopo="SAMU" />);

    expect(screen.queryByText('Acolhimento → Classificação')).not.toBeInTheDocument();
    expect(valor('Total de desistências')).toBe('0');
    expect(valor('Classificação → Consulta')).toBe('0');
    expect(valor('Após serem chamados')).toBe('0');
  });

  it('usa o total do back, mesmo quando ele passa da soma das etapas', () => {
    render(<DesistenciasCards desistencias={{ ...geral, totalDesistencias: 6 }} />);

    expect(valor('Total de desistências')).toBe('6');
  });

  it('mostra — enquanto não há dados', () => {
    render(<DesistenciasCards />);

    expect(valor('Total de desistências')).toBe('—');
    expect(valor('Classificação → Consulta')).toBe('—');
  });
});
