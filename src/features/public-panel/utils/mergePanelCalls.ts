import { TriageCall } from '@/types/patient';

export function mergePanelCalls(calls: TriageCall[], limit: number) {
  const callsById = new Map<string, TriageCall>();

  for (const call of calls) {
    const existingCall = callsById.get(call.callId);
    callsById.set(call.callId, mergeDuplicateCall(existingCall, call));
  }

  return Array.from(callsById.values())
    .sort(comparePanelCallsDesc)
    .slice(0, limit);
}

function mergeDuplicateCall(existingCall: TriageCall | undefined, nextCall: TriageCall) {
  if (!existingCall) {
    return nextCall;
  }

  return {
    ...existingCall,
    ...nextCall,
    shouldAnnounce: Boolean(existingCall.shouldAnnounce || nextCall.shouldAnnounce),
  };
}

function comparePanelCallsDesc(left: TriageCall, right: TriageCall) {
  const timestampDiff = right.timestamp.getTime() - left.timestamp.getTime();

  if (timestampDiff !== 0) {
    return timestampDiff;
  }

  return compareCallIdsDesc(left.callId, right.callId);
}

function compareCallIdsDesc(leftCallId: string, rightCallId: string) {
  const leftNumber = Number(leftCallId);
  const rightNumber = Number(rightCallId);

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber !== rightNumber) {
    return rightNumber - leftNumber;
  }

  return rightCallId.localeCompare(leftCallId);
}
