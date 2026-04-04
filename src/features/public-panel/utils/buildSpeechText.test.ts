import { describe, expect, it } from 'vitest';

import { buildSpeechText } from './buildSpeechText';

describe('buildSpeechText', () => {
  it('builds the triage speech text', () => {
    expect(buildSpeechText({ patientName: 'Maria', type: 'triage' })).toBe('Maria. Favor comparecer ao acolhimento.');
  });

  it('builds the doctor speech text', () => {
    expect(buildSpeechText({ patientName: 'Joao', type: 'doctor', room: '3' })).toBe(
      'Joao. Favor comparecer ao consultório número 3.',
    );
  });
});
