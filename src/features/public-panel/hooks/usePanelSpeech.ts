import { useEffect, useRef, useState } from 'react';

import { PANEL_RECENT_CALLS_LIMIT } from '../constants';
import { PublicPanelCallViewModel, PublicPanelViewModel } from '../types';
import { selectPreferredSpeechVoice } from '../utils/selectPreferredSpeechVoice';

const PANEL_SPEECH_RATE = 0.86;
const PANEL_SPEECH_PITCH = 1;
const PANEL_SPEECH_VOLUME = 1;
const PANEL_MIN_CALL_DISPLAY_MS = 5000;
const PANEL_IGNORED_SPEECH_CHECK_MS = 750;

function supportsSpeechSynthesis() {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

interface QueuedCall {
  callId: string;
  speechText: string;
}

interface SpeechSynthesisEventTarget {
  addEventListener?: (type: 'voiceschanged', listener: () => void) => void;
  removeEventListener?: (type: 'voiceschanged', listener: () => void) => void;
}

export function usePanelSpeech(recentCalls: PublicPanelCallViewModel[]): PublicPanelViewModel {
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const queueRef = useRef<QueuedCall[]>([]);
  const queuedCallIdsRef = useRef(new Set<string>());
  const spokenCallIdsRef = useRef(new Set<string>());
  const callRegistryRef = useRef(new Map<string, PublicPanelCallViewModel>());
  const isPresentingRef = useRef(false);
  const presentationTokenRef = useRef<symbol | null>(null);
  const presentationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoredSpeechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [displayedCallIds, setDisplayedCallIds] = useState<string[]>([]);

  const presentNextRef = useRef<() => void>(() => undefined);

  recentCalls.forEach((call) => {
    callRegistryRef.current.set(call.callId, call);
  });

  presentNextRef.current = () => {
    if (isPresentingRef.current || queueRef.current.length === 0) {
      return;
    }

    const nextCall = queueRef.current.shift();

    if (!nextCall) {
      return;
    }

    const presentationToken = Symbol(nextCall.callId);
    const presentationStartedAt = Date.now();

    queuedCallIdsRef.current.delete(nextCall.callId);
    presentationTokenRef.current = presentationToken;
    isPresentingRef.current = true;
    setActiveCallId(nextCall.callId);
    setDisplayedCallIds((currentCallIds) => [
      nextCall.callId,
      ...currentCallIds.filter((callId) => callId !== nextCall.callId),
    ]);

    const finishPresentation = () => {
      if (presentationTokenRef.current !== presentationToken) {
        return;
      }

      if (ignoredSpeechTimeoutRef.current) {
        clearTimeout(ignoredSpeechTimeoutRef.current);
        ignoredSpeechTimeoutRef.current = null;
      }

      spokenCallIdsRef.current.add(nextCall.callId);
      isPresentingRef.current = false;
      presentationTokenRef.current = null;
      presentationTimeoutRef.current = null;
      presentNextRef.current();
    };

    const finishAfterMinimumDuration = () => {
      if (ignoredSpeechTimeoutRef.current) {
        clearTimeout(ignoredSpeechTimeoutRef.current);
        ignoredSpeechTimeoutRef.current = null;
      }

      const elapsed = Date.now() - presentationStartedAt;
      const remaining = Math.max(PANEL_MIN_CALL_DISPLAY_MS - elapsed, 0);

      if (presentationTimeoutRef.current) {
        clearTimeout(presentationTimeoutRef.current);
      }

      presentationTimeoutRef.current = setTimeout(finishPresentation, remaining);
    };

    if (!supportsSpeechSynthesis()) {
      finishAfterMinimumDuration();
      return;
    }

    const synthesis = window.speechSynthesis;

    const utterance = new SpeechSynthesisUtterance(nextCall.speechText);
    const availableVoices = synthesis.getVoices();
    const voices = availableVoices.length > 0 ? availableVoices : voicesRef.current;
    const preferredVoice = selectPreferredSpeechVoice(voices);

    if (voices.length === 0) {
      finishAfterMinimumDuration();
      return;
    }

    utterance.lang = 'pt-BR';
    utterance.rate = PANEL_SPEECH_RATE;
    utterance.pitch = PANEL_SPEECH_PITCH;
    utterance.volume = PANEL_SPEECH_VOLUME;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = finishAfterMinimumDuration;
    utterance.onerror = finishAfterMinimumDuration;

    try {
      synthesis.speak(utterance);

      ignoredSpeechTimeoutRef.current = setTimeout(() => {
        if (
          presentationTokenRef.current === presentationToken &&
          !synthesis.speaking &&
          !synthesis.pending
        ) {
          finishAfterMinimumDuration();
        }
      }, PANEL_IGNORED_SPEECH_CHECK_MS);
    } catch (error) {
      console.error('Falha ao iniciar text-to-speech do painel:', error);
      finishAfterMinimumDuration();
    }
  };

  useEffect(() => {
    if (!supportsSpeechSynthesis()) {
      return () => {
        queueRef.current = [];
        queuedCallIdsRef.current.clear();
        spokenCallIdsRef.current.clear();
        isPresentingRef.current = false;
        presentationTokenRef.current = null;
        if (presentationTimeoutRef.current) {
          clearTimeout(presentationTimeoutRef.current);
          presentationTimeoutRef.current = null;
        }
        if (ignoredSpeechTimeoutRef.current) {
          clearTimeout(ignoredSpeechTimeoutRef.current);
          ignoredSpeechTimeoutRef.current = null;
        }
      };
    }

    const synthesis = window.speechSynthesis;
    const eventTarget = synthesis as SpeechSynthesis & SpeechSynthesisEventTarget;

    const loadVoices = () => {
      voicesRef.current = synthesis.getVoices();
    };

    loadVoices();

    if (typeof eventTarget.addEventListener === 'function' && typeof eventTarget.removeEventListener === 'function') {
      eventTarget.addEventListener('voiceschanged', loadVoices);

      return () => {
        eventTarget.removeEventListener?.('voiceschanged', loadVoices);
        queueRef.current = [];
        queuedCallIdsRef.current.clear();
        spokenCallIdsRef.current.clear();
        isPresentingRef.current = false;
        presentationTokenRef.current = null;
        if (presentationTimeoutRef.current) {
          clearTimeout(presentationTimeoutRef.current);
          presentationTimeoutRef.current = null;
        }
        if (ignoredSpeechTimeoutRef.current) {
          clearTimeout(ignoredSpeechTimeoutRef.current);
          ignoredSpeechTimeoutRef.current = null;
        }
        synthesis.cancel();
      };
    }

    const previousOnVoicesChanged = synthesis.onvoiceschanged;
    synthesis.onvoiceschanged = loadVoices;

    return () => {
      synthesis.onvoiceschanged = previousOnVoicesChanged;
      queueRef.current = [];
      queuedCallIdsRef.current.clear();
      spokenCallIdsRef.current.clear();
      isPresentingRef.current = false;
      presentationTokenRef.current = null;
      if (presentationTimeoutRef.current) {
        clearTimeout(presentationTimeoutRef.current);
        presentationTimeoutRef.current = null;
      }
      if (ignoredSpeechTimeoutRef.current) {
        clearTimeout(ignoredSpeechTimeoutRef.current);
        ignoredSpeechTimeoutRef.current = null;
      }
      synthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const callsToAnnounce = recentCalls
      .filter((call) => call.shouldAnnounce)
      .filter((call) => (
        !spokenCallIdsRef.current.has(call.callId) &&
        !queuedCallIdsRef.current.has(call.callId) &&
        !displayedCallIds.includes(call.callId) &&
        activeCallId !== call.callId
      ))
      .reverse();

    callsToAnnounce.forEach((call) => {
      queueRef.current.push({ callId: call.callId, speechText: call.speechText });
      queuedCallIdsRef.current.add(call.callId);
    });

    presentNextRef.current();
  }, [activeCallId, displayedCallIds, recentCalls]);

  const currentCall = activeCallId ? callRegistryRef.current.get(activeCallId) ?? null : recentCalls[0] ?? null;
  const historicalCallIds = recentCalls
    .filter((call) => !call.shouldAnnounce)
    .map((call) => call.callId);
  const previousCalls = [...displayedCallIds, ...historicalCallIds]
    .filter((callId, index, callIds) => callId !== currentCall?.callId && callIds.indexOf(callId) === index)
    .map((callId) => callRegistryRef.current.get(callId))
    .filter((call): call is PublicPanelCallViewModel => Boolean(call))
    .slice(0, PANEL_RECENT_CALLS_LIMIT);

  return {
    currentCall,
    previousCalls,
  };
}
