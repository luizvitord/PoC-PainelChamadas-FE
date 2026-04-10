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
    <div className="flex items-center gap-2">
      <Label className="text-gray-500 font-bold text-[20px] uppercase whitespace-nowrap">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-4 py-2 text-lg bg-white text-gray-700 shadow-sm cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <option value="">Selecione um consultório</option>

        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            Consultório {opt.id}
          </option>
        ))}
      </select>
    </div>
  );
}
