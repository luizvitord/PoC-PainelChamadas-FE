import { describe, expect, it } from 'vitest';

import { PROTOCOLO_PADRAO } from '@/test/protocoloFixture';

import { getAvailablePriorities, getWaitTimeMinutes } from './priorityRules';

describe('getAvailablePriorities', () => {
  it('returns the colors the protocol accepts for each attendance type, most urgent first', () => {
    expect(getAvailablePriorities(PROTOCOLO_PADRAO, 'psychiatric')).toEqual(['red', 'orange', 'yellow', 'green', 'blue']);
    expect(getAvailablePriorities(PROTOCOLO_PADRAO, 'clinical')).toEqual(['red', 'orange']);
    expect(getAvailablePriorities(PROTOCOLO_PADRAO, 'samu')).toEqual(['orange']);
  });

  it('sorts by urgency regardless of the order the protocol arrives in', () => {
    expect(getAvailablePriorities([...PROTOCOLO_PADRAO].reverse(), 'psychiatric')).toEqual([
      'red', 'orange', 'yellow', 'green', 'blue',
    ]);
  });

  it('returns no colors while there is no protocol', () => {
    expect(getAvailablePriorities([], 'clinical')).toEqual([]);
  });
});

describe('getWaitTimeMinutes', () => {
  it('returns the protocol time for the color and attendance type', () => {
    expect(getWaitTimeMinutes(PROTOCOLO_PADRAO, 'orange', 'clinical')).toBe(10);
    expect(getWaitTimeMinutes(PROTOCOLO_PADRAO, 'blue', 'psychiatric')).toBe(240);
    expect(getWaitTimeMinutes(PROTOCOLO_PADRAO, 'red', 'psychiatric')).toBe(0);
  });

  it('returns null for a combination outside the protocol', () => {
    expect(getWaitTimeMinutes(PROTOCOLO_PADRAO, 'yellow', 'clinical')).toBeNull();
  });
});
