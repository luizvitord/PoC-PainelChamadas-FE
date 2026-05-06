import { describe, expect, it } from 'vitest';

import { selectPreferredSpeechVoice } from './selectPreferredSpeechVoice';

describe('selectPreferredSpeechVoice', () => {
  it('prioritizes pt-BR voices with a preferred provider name', () => {
    const selectedVoice = selectPreferredSpeechVoice([
      { default: false, lang: 'en-US', name: 'Google US English' } as SpeechSynthesisVoice,
      { default: false, lang: 'pt-PT', name: 'Portuguese Europe' } as SpeechSynthesisVoice,
      { default: false, lang: 'pt-BR', name: 'Google português do Brasil' } as SpeechSynthesisVoice,
    ]);

    expect(selectedVoice?.name).toBe('Google português do Brasil');
  });

  it('returns null when no voices are available', () => {
    expect(selectPreferredSpeechVoice([])).toBeNull();
  });
});
