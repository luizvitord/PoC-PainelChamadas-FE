const PREFERRED_VOICE_NAMES = ['google', 'microsoft', 'luciana', 'francisca', 'portuguese', 'brazil'];

function scoreVoice(voice: SpeechSynthesisVoice) {
  const normalizedName = voice.name.toLowerCase();
  const normalizedLang = voice.lang.toLowerCase();

  let score = 0;

  if (normalizedLang === 'pt-br') {
    score += 100;
  } else if (normalizedLang.startsWith('pt-br')) {
    score += 90;
  } else if (normalizedLang.startsWith('pt')) {
    score += 70;
  }

  for (const preferredName of PREFERRED_VOICE_NAMES) {
    if (normalizedName.includes(preferredName)) {
      score += 10;
    }
  }

  if (voice.default) {
    score += 5;
  }

  return score;
}

export function selectPreferredSpeechVoice(voices: SpeechSynthesisVoice[]) {
  if (voices.length === 0) {
    return null;
  }

  return [...voices].sort((left, right) => scoreVoice(right) - scoreVoice(left))[0] ?? null;
}
