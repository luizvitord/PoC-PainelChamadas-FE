export const AttendanceTypeLabel = {
  clinical: 'Clínico',
  psychiatric: 'Psiquiátrico',
  samu: 'SAMU',
} as const;

export type AttendanceType = keyof typeof AttendanceTypeLabel;