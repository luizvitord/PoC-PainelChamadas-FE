import { describe, expect, it } from 'vitest';

import { formatRoomForSpeech } from './formatRoomForSpeech';

describe('formatRoomForSpeech', () => {
  it('formats numeric rooms with explicit number wording', () => {
    expect(formatRoomForSpeech('03')).toBe('consultório número 3');
  });

  it('formats alphanumeric rooms without forcing number wording', () => {
    expect(formatRoomForSpeech('A1')).toBe('consultório A1');
  });

  it('returns a generic fallback when the room is missing', () => {
    expect(formatRoomForSpeech()).toBe('consultório');
  });
});
