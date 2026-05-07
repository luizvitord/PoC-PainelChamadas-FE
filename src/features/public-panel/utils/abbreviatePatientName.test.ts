import { describe, expect, it } from 'vitest';

import { abbreviatePatientName } from './abbreviatePatientName';

describe('abbreviatePatientName', () => {
  it('returns an empty string for empty values', () => {
    expect(abbreviatePatientName()).toBe('');
    expect(abbreviatePatientName('')).toBe('');
  });

  it('keeps names with up to three parts untouched', () => {
    expect(abbreviatePatientName('Maria Clara Santos')).toBe('Maria Clara Santos');
  });

  it('abbreviates middle names after the second name', () => {
    expect(abbreviatePatientName('Maria Clara Santos Oliveira')).toBe('Maria Clara S. Oliveira');
  });
});
