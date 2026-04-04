import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PublicPanelCallViewModel } from '../types';
import { usePanelSpeech } from './usePanelSpeech';

const speakMock = vi.fn();
const cancelMock = vi.fn();
const getVoicesMock = vi.fn(() => [{ lang: 'pt-BR', name: 'Brasil' }]);

class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice?: SpeechSynthesisVoice;

  constructor(text: string) {
    this.text = text;
  }
}

const triageCall: PublicPanelCallViewModel = {
  callId: 'call-1',
  patientName: 'Maria Clara Santos Oliveira',
  displayName: 'MARIA CLARA S. OLIVEIRA',
  currentDestinationLabel: 'ACOLHIMENTO',
  recentDestinationLabel: 'Acolhimento',
  speechText: 'Maria Clara Santos Oliveira. Favor comparecer ao acolhimento.',
  type: 'triage',
};

describe('usePanelSpeech', () => {
  beforeEach(() => {
    speakMock.mockClear();
    cancelMock.mockClear();
    getVoicesMock.mockClear();

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        cancel: cancelMock,
        getVoices: getVoicesMock,
        onvoiceschanged: null,
        speak: speakMock,
      },
    });

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      writable: true,
      value: MockSpeechSynthesisUtterance,
    });

    Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
      configurable: true,
      writable: true,
      value: MockSpeechSynthesisUtterance,
    });
  });

  it('speaks when a new call arrives', () => {
    renderHook(({ currentCall }) => usePanelSpeech(currentCall), {
      initialProps: { currentCall: triageCall },
    });

    expect(cancelMock).toHaveBeenCalled();
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0].text).toBe(triageCall.speechText);
    expect(speakMock.mock.calls[0][0].lang).toBe('pt-BR');
    expect(speakMock.mock.calls[0][0].rate).toBe(0.86);
  });

  it('does not repeat speech for the same call id', () => {
    const { rerender } = renderHook(({ currentCall }) => usePanelSpeech(currentCall), {
      initialProps: { currentCall: triageCall },
    });

    rerender({ currentCall: { ...triageCall } });

    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('speaks again when the call id changes', () => {
    const { rerender } = renderHook(({ currentCall }) => usePanelSpeech(currentCall), {
      initialProps: { currentCall: triageCall },
    });

    rerender({
      currentCall: {
        ...triageCall,
        callId: 'call-2',
      },
    });

    expect(speakMock).toHaveBeenCalledTimes(2);
  });

  it('uses the preferred pt-BR voice when available', () => {
    getVoicesMock.mockReturnValue([
      { default: false, lang: 'en-US', name: 'Google US English' },
      { default: true, lang: 'pt-BR', name: 'Google português do Brasil' },
    ]);

    renderHook(({ currentCall }) => usePanelSpeech(currentCall), {
      initialProps: { currentCall: triageCall },
    });

    expect(speakMock.mock.calls[0][0].voice?.name).toBe('Google português do Brasil');
  });
});
