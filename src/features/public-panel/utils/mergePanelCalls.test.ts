import { describe, expect, it } from 'vitest';
import { TriageCall } from '@/types/patient';

import { mergePanelCalls } from './mergePanelCalls';

function call(callId: string, timestamp: string, shouldAnnounce = false): TriageCall {
  return {
    callId,
    ticketNumber: callId,
    patientName: `Paciente ${callId}`,
    type: 'doctor',
    room: '1',
    timestamp: new Date(timestamp),
    shouldAnnounce,
  };
}

function invalidDateCall(callId: string): TriageCall {
  return {
    ...call(callId, '2026-04-28T10:00:00'),
    timestamp: new Date('not-a-date'),
  };
}

describe('mergePanelCalls', () => {
  it('orders calls by timestamp descending regardless of arrival order', () => {
    const mergedCalls = mergePanelCalls([
      call('1', '2026-04-28T10:00:00'),
      call('3', '2026-04-28T10:02:00'),
      call('2', '2026-04-28T10:01:00'),
    ], 10);

    expect(mergedCalls.map((item) => item.callId)).toEqual(['3', '2', '1']);
  });

  it('uses numeric call id as a descending tie breaker', () => {
    const mergedCalls = mergePanelCalls([
      call('8', '2026-04-28T10:00:00'),
      call('10', '2026-04-28T10:00:00'),
      call('9', '2026-04-28T10:00:00'),
    ], 10);

    expect(mergedCalls.map((item) => item.callId)).toEqual(['10', '9', '8']);
  });

  it('deduplicates calls and preserves announce intent when a duplicate arrives from another source', () => {
    const mergedCalls = mergePanelCalls([
      call('5', '2026-04-28T10:00:00', false),
      call('5', '2026-04-28T10:00:00', true),
    ], 10);

    expect(mergedCalls).toHaveLength(1);
    expect(mergedCalls[0].shouldAnnounce).toBe(true);
  });

  it('applies the requested limit to non-pending history after sorting', () => {
    const mergedCalls = mergePanelCalls([
      call('1', '2026-04-28T10:00:00'),
      call('2', '2026-04-28T10:01:00'),
      call('3', '2026-04-28T10:02:00'),
    ], 2);

    expect(mergedCalls.map((item) => item.callId)).toEqual(['3', '2']);
  });

  it('keeps pending announcements even when the history limit is reached', () => {
    const mergedCalls = mergePanelCalls([
      call('1', '2026-04-28T10:00:00'),
      call('2', '2026-04-28T10:01:00'),
      call('3', '2026-04-28T10:02:00', true),
    ], 1);

    expect(mergedCalls.map((item) => item.callId)).toEqual(['3', '2']);
  });

  it('treats invalid timestamps as the oldest calls when sorting', () => {
    const mergedCalls = mergePanelCalls([
      invalidDateCall('99'),
      call('1', '2026-04-28T10:00:00'),
      call('2', '2026-04-28T10:01:00'),
    ], 10);

    expect(mergedCalls.map((item) => item.callId)).toEqual(['2', '1', '99']);
  });

  it('does not replace a valid duplicate timestamp with an invalid one', () => {
    const mergedCalls = mergePanelCalls([
      call('5', '2026-04-28T10:00:00', false),
      invalidDateCall('5'),
    ], 10);

    expect(mergedCalls[0].timestamp).toEqual(new Date('2026-04-28T10:00:00'));
  });
});
