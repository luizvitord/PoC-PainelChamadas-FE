import React from 'react';
import { Label } from '@/components/ui/label';

interface Consultorio {
  id: number;
  numero: number;
}

interface RoomSelectProps {
  value: string;                    // ID selecionado
  onChange: (value: string) => void;
  options: Consultorio[];
  label?: string;
}

export default function RoomSelect({
  value,
  onChange,
  options,
  label = 'Consultation Room'
}: RoomSelectProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground"
      >
        <option value="">Selecione um consultório</option>

        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            Consultório {opt.numero}
          </option>
        ))}
      </select>
    </div>
  );
}
