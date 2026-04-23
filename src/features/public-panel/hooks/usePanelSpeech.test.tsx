import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PublicPanelCallViewModel } from '../types';
import { usePanelSpeech } from './usePanelSpeech';

const speakMock = vi.fn();
const cancelMock = vi.fn();
const getVoicesMock = vi.fn(() => [{ lang: 'pt-BR', name: 'Brasil' }]);
const addEventListenerMock = vi.fn();
const removeEventListenerMock = vi.fn();

class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice?: SpeechSynthesisVoice;
  onend?: () => void;
  onerror?: () => void;

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

const doctorCall: PublicPanelCallViewModel = {
  callId: 'call-2',
  patientName: 'Joao Pedro Lima',
  displayName: 'JOAO PEDRO LIMA',
  currentDestinationLabel: 'CONSULTÓRIO 3',
  recentDestinationLabel: 'Consultório 3',
  speechText: 'Joao Pedro Lima. Favor comparecer ao consultório número 3.',
  type: 'doctor',
};

describe('usePanelSpeech', () => {
  beforeEach(() => {
    speakMock.mockClear();
    cancelMock.mockClear();
    getVoicesMock.mockClear();
    addEventListenerMock.mockClear();
    removeEventListenerMock.mockClear();

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        addEventListener: addEventListenerMock,
        cancel: cancelMock,
        getVoices: getVoicesMock,
        onvoiceschanged: null,
        removeEventListener: removeEventListenerMock,
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
    const { result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0].text).toBe(triageCall.speechText);
    expect(speakMock.mock.calls[0][0].lang).toBe('pt-BR');
    expect(speakMock.mock.calls[0][0].rate).toBe(0.86);
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);
  });

  it('does not repeat speech for the same call id', () => {
    const { rerender } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [{ ...triageCall }] });

    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('speaks again when the call id changes', () => {
    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [doctorCall, triageCall] });

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);

    act(() => {
      speakMock.mock.calls[0][0].onend?.();
    });

    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(result.current.currentCall?.callId).toBe(doctorCall.callId);
  });

  it('uses the preferred pt-BR voice when available', () => {
    getVoicesMock.mockReturnValue([
      { default: false, lang: 'en-US', name: 'Google US English' },
      { default: true, lang: 'pt-BR', name: 'Google português do Brasil' },
    ]);

    renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    expect(speakMock.mock.calls[0][0].voice?.name).toBe('Google português do Brasil');
  });

  it('queues subsequent calls until the current speech finishes', () => {
    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [doctorCall, triageCall] });

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0].text).toBe(triageCall.speechText);
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);
    expect(result.current.previousCalls).toHaveLength(0);

    act(() => {
      speakMock.mock.calls[0][0].onend?.();
    });

    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(speakMock.mock.calls[1][0].text).toBe(doctorCall.speechText);
    expect(result.current.currentCall?.callId).toBe(doctorCall.callId);
    expect(result.current.previousCalls.map((call) => call.callId)).toEqual([triageCall.callId]);
  });

  it('subscribes to and cleans up the voiceschanged listener', () => {
    const { unmount } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    expect(addEventListenerMock).toHaveBeenCalledWith('voiceschanged', expect.any(Function));

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('voiceschanged', expect.any(Function));
    expect(cancelMock).toHaveBeenCalledTimes(1);
  });
});
