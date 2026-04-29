import { TriageCall } from '@/types/patient';

export function mergePanelCalls(calls: TriageCall[], limit: number) {
  const callsById = new Map<string, TriageCall>();

  for (const call of calls) {
    const existingCall = callsById.get(call.callId);
    callsById.set(call.callId, mergeDuplicateCall(existingCall, call));
  }

  const sortedCalls = Array.from(callsById.values()).sort(comparePanelCallsDesc);
  const pendingAnnouncementCalls = sortedCalls.filter((call) => call.shouldAnnounce);
  const historicalCalls = sortedCalls
    .filter((call) => !call.shouldAnnounce)
    .slice(0, limit);

  return [...pendingAnnouncementCalls, ...historicalCalls].sort(comparePanelCallsDesc);
}

function mergeDuplicateCall(existingCall: TriageCall | undefined, nextCall: TriageCall) {
  if (!existingCall) {
    return nextCall;
  }

  return {
    ...existingCall,
    ...nextCall,
    timestamp: getTimestamp(nextCall) > 0 ? nextCall.timestamp : existingCall.timestamp,
    shouldAnnounce: Boolean(existingCall.shouldAnnounce || nextCall.shouldAnnounce),
  };
}

function comparePanelCallsDesc(left: TriageCall, right: TriageCall) {
  const timestampDiff = getTimestamp(right) - getTimestamp(left);

  if (timestampDiff !== 0) {
    return timestampDiff;
  }

  return compareCallIdsDesc(left.callId, right.callId);
}

function getTimestamp(call: TriageCall) {
  const timestamp = call.timestamp.getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function compareCallIdsDesc(leftCallId: string, rightCallId: string) {
  const leftNumber = Number(leftCallId);
  const rightNumber = Number(rightCallId);

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber !== rightNumber) {
    return rightNumber - leftNumber;
  }

  return rightCallId.localeCompare(leftCallId);
}
