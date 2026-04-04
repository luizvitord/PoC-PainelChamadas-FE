import { useEffect, useRef } from 'react';

import { PublicPanelCallViewModel } from '../types';

function supportsSpeechSynthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function usePanelSpeech(currentCall: PublicPanelCallViewModel | null) {
  const lastSpokenCallIdRef = useRef<string | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!supportsSpeechSynthesis()) {
      return undefined;
    }

    const synthesis = window.speechSynthesis;

    const loadVoices = () => {
      voicesRef.current = synthesis.getVoices();
    };

    loadVoices();
    synthesis.onvoiceschanged = loadVoices;

    return () => {
      if (synthesis.onvoiceschanged === loadVoices) {
        synthesis.onvoiceschanged = null;
      }

      synthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!currentCall || !supportsSpeechSynthesis()) {
      return;
    }

    if (lastSpokenCallIdRef.current === currentCall.callId) {
      return;
    }

    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(currentCall.speechText);
    const preferredVoice = voicesRef.current.find((voice) => voice.lang.toLowerCase().startsWith('pt-br'));

    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthesis.cancel();
    synthesis.speak(utterance);
    lastSpokenCallIdRef.current = currentCall.callId;
  }, [currentCall?.callId, currentCall?.speechText, currentCall]);
}
