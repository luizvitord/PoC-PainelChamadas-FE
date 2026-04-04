function isNumericRoom(room: string) {
  return /^[0-9]+$/.test(room);
}

export function formatRoomForSpeech(room?: string) {
  const normalizedRoom = (room ?? '').trim();

  if (!normalizedRoom) {
    return 'consultório';
  }

  if (isNumericRoom(normalizedRoom)) {
    return `consultório número ${Number(normalizedRoom)}`;
  }

  return `consultório ${normalizedRoom}`;
}
