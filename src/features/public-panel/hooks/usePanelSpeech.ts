import { useEffect, useRef, useState } from 'react';

import { PANEL_RECENT_CALLS_LIMIT } from '../constants';
import { PublicPanelCallViewModel, PublicPanelViewModel } from '../types';
import { selectPreferredSpeechVoice } from '../utils/selectPreferredSpeechVoice';

const PANEL_SPEECH_RATE = 0.86;
const PANEL_SPEECH_PITCH = 1;
const PANEL_SPEECH_VOLUME = 1;

function supportsSpeechSynthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

interface QueuedSpeech {
  callId: string;
  speechText: string;
}

interface SpeechSynthesisEventTarget {
  addEventListener?: (type: 'voiceschanged', listener: () => void) => void;
  removeEventListener?: (type: 'voiceschanged', listener: () => void) => void;
}

export function usePanelSpeech(recentCalls: PublicPanelCallViewModel[]): PublicPanelViewModel {
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const queueRef = useRef<QueuedSpeech[]>([]);
  const queuedCallIdsRef = useRef(new Set<string>());
  const spokenCallIdsRef = useRef(new Set<string>());
  const callRegistryRef = useRef(new Map<string, PublicPanelCallViewModel>());
  const isSpeakingRef = useRef(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [announcedCallIds, setAnnouncedCallIds] = useState<string[]>([]);
  const latestCall = recentCalls[0] ?? null;

  const speakNextRef = useRef<() => void>(() => undefined);

  recentCalls.forEach((call) => {
    callRegistryRef.current.set(call.callId, call);
  });

  speakNextRef.current = () => {
    if (!supportsSpeechSynthesis() || isSpeakingRef.current || queueRef.current.length === 0) {
      return;
    }

    const synthesis = window.speechSynthesis;
    const nextSpeech = queueRef.current.shift();

    if (!nextSpeech) {
      return;
    }

    queuedCallIdsRef.current.delete(nextSpeech.callId);
    isSpeakingRef.current = true;
    setActiveCallId(nextSpeech.callId);
    setAnnouncedCallIds((currentCallIds) => [
      nextSpeech.callId,
      ...currentCallIds.filter((callId) => callId !== nextSpeech.callId),
    ]);

    const utterance = new SpeechSynthesisUtterance(nextSpeech.speechText);
    const availableVoices = synthesis.getVoices();
    const preferredVoice = selectPreferredSpeechVoice(availableVoices.length > 0 ? availableVoices : voicesRef.current);

    utterance.lang = 'pt-BR';
    utterance.rate = PANEL_SPEECH_RATE;
    utterance.pitch = PANEL_SPEECH_PITCH;
    utterance.volume = PANEL_SPEECH_VOLUME;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    const finishSpeech = () => {
      spokenCallIdsRef.current.add(nextSpeech.callId);
      isSpeakingRef.current = false;
      speakNextRef.current();
    };

    utterance.onend = finishSpeech;
    utterance.onerror = finishSpeech;

    synthesis.speak(utterance);
  };

  useEffect(() => {
    if (!supportsSpeechSynthesis()) {
      return undefined;
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
        isSpeakingRef.current = false;
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
      isSpeakingRef.current = false;
      synthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!latestCall || !supportsSpeechSynthesis()) {
      return;
    }

    if (
      spokenCallIdsRef.current.has(latestCall.callId) ||
      queuedCallIdsRef.current.has(latestCall.callId) ||
      activeCallId === latestCall.callId
    ) {
      return;
    }

    queueRef.current.push({ callId: latestCall.callId, speechText: latestCall.speechText });
    queuedCallIdsRef.current.add(latestCall.callId);
    speakNextRef.current();
  }, [activeCallId, latestCall]);

  if (!supportsSpeechSynthesis()) {
    return {
      currentCall: recentCalls[0] ?? null,
      previousCalls: recentCalls.slice(1, PANEL_RECENT_CALLS_LIMIT + 1),
    };
  }

  const currentCall = activeCallId ? callRegistryRef.current.get(activeCallId) ?? null : null;
  const previousCalls = announcedCallIds
    .filter((callId) => callId !== activeCallId)
    .map((callId) => callRegistryRef.current.get(callId))
    .filter((call): call is PublicPanelCallViewModel => Boolean(call))
    .slice(0, PANEL_RECENT_CALLS_LIMIT);

  return {
    currentCall,
    previousCalls,
  };
}
