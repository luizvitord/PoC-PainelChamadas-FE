export function normalizeSpeechText(text: string) {
  return text.replace(/\s+/g, ' ').replace(/\s([,.!?;:])/g, '$1').trim();
}
