import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  shouldAnnounce: true,
};

const doctorCall: PublicPanelCallViewModel = {
  callId: 'call-2',
  patientName: 'Joao Pedro Lima',
  displayName: 'JOAO PEDRO LIMA',
  currentDestinationLabel: 'CONSULTÓRIO 3',
  recentDestinationLabel: 'Consultório 3',
  speechText: 'Joao Pedro Lima. Favor comparecer ao consultório número 3.',
  type: 'doctor',
  shouldAnnounce: true,
};

const secondDoctorCall: PublicPanelCallViewModel = {
  callId: 'call-3',
  patientName: 'Ana Beatriz Costa',
  displayName: 'ANA BEATRIZ COSTA',
  currentDestinationLabel: 'CONSULTÓRIO 4',
  recentDestinationLabel: 'Consultório 4',
  speechText: 'Ana Beatriz Costa. Favor comparecer ao consultório número 4.',
  type: 'doctor',
  shouldAnnounce: true,
};

describe('usePanelSpeech', () => {
  beforeEach(() => {
    vi.useRealTimers();
    speakMock.mockClear();
    cancelMock.mockClear();
    getVoicesMock.mockReset();
    getVoicesMock.mockReturnValue([{ lang: 'pt-BR', name: 'Brasil' }]);
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
        pending: false,
        removeEventListener: removeEventListenerMock,
        speak: speakMock,
        speaking: true,
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

  afterEach(() => {
    vi.useRealTimers();
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

  it('does not speak calls loaded only as recent history', () => {
    const { result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [{ ...triageCall, shouldAnnounce: false }] },
    });

    expect(speakMock).not.toHaveBeenCalled();
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);
  });

  it('speaks again when the call id changes', () => {
    vi.useFakeTimers();

    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [doctorCall, triageCall] });

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);

    act(() => {
      speakMock.mock.calls[0][0].onend?.();
      vi.advanceTimersByTime(5000);
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
    vi.useFakeTimers();

    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [doctorCall, triageCall] });

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0].text).toBe(triageCall.speechText);
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);
    expect(result.current.previousCalls.map((call) => call.callId)).toEqual([]);

    act(() => {
      speakMock.mock.calls[0][0].onend?.();
      vi.advanceTimersByTime(5000);
    });

    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(speakMock.mock.calls[1][0].text).toBe(doctorCall.speechText);
    expect(result.current.currentCall?.callId).toBe(doctorCall.callId);
    expect(result.current.previousCalls.map((call) => call.callId)).toEqual([triageCall.callId]);
  });

  it('keeps the displayed current call synchronized with the spoken call when multiple calls arrive together', () => {
    vi.useFakeTimers();

    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [secondDoctorCall, doctorCall, triageCall] });

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0].text).toBe(triageCall.speechText);
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);
    expect(result.current.previousCalls.map((call) => call.callId)).toEqual([]);

    act(() => {
      speakMock.mock.calls[0][0].onend?.();
      vi.advanceTimersByTime(5000);
    });

    expect(speakMock).toHaveBeenCalledTimes(2);
    expect(speakMock.mock.calls[1][0].text).toBe(doctorCall.speechText);
    expect(result.current.currentCall?.callId).toBe(doctorCall.callId);

    act(() => {
      speakMock.mock.calls[1][0].onend?.();
      vi.advanceTimersByTime(5000);
    });

    expect(speakMock).toHaveBeenCalledTimes(3);
    expect(speakMock.mock.calls[2][0].text).toBe(secondDoctorCall.speechText);
    expect(result.current.currentCall?.callId).toBe(secondDoctorCall.callId);
  });

  it('keeps a call visible for at least five seconds when TTS is unavailable', () => {
    vi.useFakeTimers();

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [doctorCall, triageCall] });

    expect(speakMock).not.toHaveBeenCalled();
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(result.current.currentCall?.callId).toBe(triageCall.callId);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.currentCall?.callId).toBe(doctorCall.callId);
  });

  it('does not get stuck when speech synthesis has no available voices', () => {
    vi.useFakeTimers();
    getVoicesMock.mockReturnValue([]);

    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [doctorCall, triageCall] });

    expect(speakMock).not.toHaveBeenCalled();
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.currentCall?.callId).toBe(doctorCall.callId);
  });

  it('does not get stuck when the browser ignores a speech request', () => {
    vi.useFakeTimers();

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        addEventListener: addEventListenerMock,
        cancel: cancelMock,
        getVoices: getVoicesMock,
        onvoiceschanged: null,
        pending: false,
        removeEventListener: removeEventListenerMock,
        speak: speakMock,
        speaking: false,
      },
    });

    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [doctorCall, triageCall] });

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(result.current.currentCall?.callId).toBe(triageCall.callId);

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(result.current.currentCall?.callId).toBe(triageCall.callId);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.currentCall?.callId).toBe(doctorCall.callId);
  });

  it('waits until five seconds have elapsed when TTS finishes early', () => {
    vi.useFakeTimers();

    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [triageCall] },
    });

    rerender({ recentCalls: [doctorCall, triageCall] });

    act(() => {
      vi.advanceTimersByTime(1000);
      speakMock.mock.calls[0][0].onend?.();
    });

    expect(result.current.currentCall?.callId).toBe(triageCall.callId);

    act(() => {
      vi.advanceTimersByTime(3999);
    });

    expect(result.current.currentCall?.callId).toBe(triageCall.callId);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.currentCall?.callId).toBe(doctorCall.callId);
  });

  it('limits the previous calls list to six calls', () => {
    const calls = Array.from({ length: 8 }, (_, index) => ({
      ...doctorCall,
      callId: `history-${index}`,
      displayName: `PACIENTE ${index}`,
      shouldAnnounce: false,
    }));

    const { result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: calls },
    });

    expect(result.current.currentCall?.callId).toBe('history-0');
    expect(result.current.previousCalls.map((call) => call.callId)).toEqual([
      'history-1',
      'history-2',
      'history-3',
      'history-4',
      'history-5',
      'history-6',
    ]);
  });

  it('keeps only the bounded displayed calls needed for the recent list', () => {
    vi.useFakeTimers();

    const calls = Array.from({ length: 9 }, (_, index) => ({
      ...doctorCall,
      callId: `shown-${index}`,
      displayName: `PACIENTE ${index}`,
      speechText: `Paciente ${index}. Favor comparecer ao consultório número 3.`,
      shouldAnnounce: true,
    })).reverse();

    const { result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: calls },
    });

    for (let index = 0; index < 8; index += 1) {
      act(() => {
        speakMock.mock.calls[index][0].onend?.();
        vi.advanceTimersByTime(5000);
      });
    }

    expect(result.current.currentCall?.callId).toBe('shown-8');
    expect(result.current.previousCalls.map((call) => call.callId)).toEqual([
      'shown-7',
      'shown-6',
      'shown-5',
      'shown-4',
      'shown-3',
      'shown-2',
    ]);
  });

  it('keeps previously loaded recent calls when a new call becomes active', () => {
    const previousHistoryCall: PublicPanelCallViewModel = {
      callId: 'call-history',
      patientName: 'Carlos Silva',
      displayName: 'CARLOS SILVA',
      currentDestinationLabel: 'CONSULTÓRIO 2',
      recentDestinationLabel: 'Consultório 2',
      speechText: 'Carlos Silva. Favor comparecer ao consultório número 2.',
      type: 'doctor',
      shouldAnnounce: false,
    };

    const { rerender, result } = renderHook(({ recentCalls }) => usePanelSpeech(recentCalls), {
      initialProps: { recentCalls: [previousHistoryCall] },
    });

    rerender({ recentCalls: [triageCall, previousHistoryCall] });

    expect(result.current.currentCall?.callId).toBe(triageCall.callId);
    expect(result.current.previousCalls.map((call) => call.callId)).toEqual([previousHistoryCall.callId]);
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
