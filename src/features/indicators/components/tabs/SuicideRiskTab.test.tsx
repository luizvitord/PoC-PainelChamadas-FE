import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import geralJson from '../../mocks/geral.json';
import samuJson from '../../mocks/samu.json';
import type { IndicadoresResponse } from '../../types';
import { SuicideRiskTab } from './SuicideRiskTab';

const geral = geralJson as IndicadoresResponse;
const samu = samuJson as IndicadoresResponse;

const card = (titulo: string) => screen.getByText(titulo).parentElement!;
const valor = (titulo: string) => card(titulo).querySelector('p')?.textContent;
const resumo = () => screen.getByText(/Total de atendidos com marcação/).closest('p')!;

describe('SuicideRiskTab', () => {
  it('mostra cada opção marcada pelo médico com o percentual sobre quem tem marcação (Geral)', () => {
    render(<SuicideRiskTab risco={geral} />);

    expect(valor('Tentativa de suicídio')).toBe('1');
    expect(card('Tentativa de suicídio')).toHaveTextContent('8% dos atendidos');
    expect(valor('Ideação suicida sem tentativa')).toBe('2');
    expect(card('Ideação suicida sem tentativa')).toHaveTextContent('15% dos atendidos');
    expect(valor('Não relacionado a comportamento suicida')).toBe('10');
    expect(card('Não relacionado a comportamento suicida')).toHaveTextContent('77% dos atendidos');
  });

  it('mostra o total com marcação e os atendidos sem avaliação', () => {
    render(<SuicideRiskTab risco={geral} />);

    expect(resumo()).toHaveTextContent('Total de atendidos com marcação: 13');
    expect(resumo()).toHaveTextContent(/Sem marcação .*: 1$/);
  });

  it('mostra os números do SAMU', () => {
    render(<SuicideRiskTab risco={samu} />);

    expect(valor('Tentativa de suicídio')).toBe('0');
    expect(card('Tentativa de suicídio')).toHaveTextContent('0% dos atendidos');
    expect(valor('Ideação suicida sem tentativa')).toBe('1');
    expect(card('Ideação suicida sem tentativa')).toHaveTextContent('50% dos atendidos');
    expect(resumo()).toHaveTextContent('Total de atendidos com marcação: 2');
    expect(resumo()).toHaveTextContent(/Sem marcação .*: 0$/);
  });

  it('mostra — enquanto não há dados', () => {
    render(<SuicideRiskTab />);

    expect(valor('Tentativa de suicídio')).toBe('—');
    expect(card('Tentativa de suicídio')).toHaveTextContent('—% dos atendidos');
    expect(resumo()).toHaveTextContent('Total de atendidos com marcação: —');
  });
});
