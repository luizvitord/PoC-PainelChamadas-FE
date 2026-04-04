import { useEffect, useRef } from 'react';

import { PublicPanelCallViewModel } from '../types';
import { selectPreferredSpeechVoice } from '../utils/selectPreferredSpeechVoice';

const PANEL_SPEECH_RATE = 0.86;
const PANEL_SPEECH_PITCH = 1;
const PANEL_SPEECH_VOLUME = 1;

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
    const availableVoices = synthesis.getVoices();
    const preferredVoice = selectPreferredSpeechVoice(availableVoices.length > 0 ? availableVoices : voicesRef.current);

    utterance.lang = 'pt-BR';
    utterance.rate = PANEL_SPEECH_RATE;
    utterance.pitch = PANEL_SPEECH_PITCH;
    utterance.volume = PANEL_SPEECH_VOLUME;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthesis.cancel();
    synthesis.speak(utterance);
    lastSpokenCallIdRef.current = currentCall.callId;
  }, [currentCall?.callId, currentCall?.speechText, currentCall]);
}
