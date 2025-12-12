import { PriorityLevel } from '@/types/patient';

export type AttendanceType = 'clinical' | 'psychiatric' | 'samu';

export function getAvailablePriorities(attendance: AttendanceType): PriorityLevel[] {
  switch (attendance) {
    case 'clinical':
      return ['red', 'orange'];
    case 'psychiatric':
      return ['red', 'orange', 'yellow', 'green', 'blue'];
    case 'samu':
      return ['orange'];
    default:
      return ['red'];
  }
}
