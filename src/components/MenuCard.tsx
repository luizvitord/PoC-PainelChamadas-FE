// components/MenuCard.tsx
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MenuCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  borderColor: string;       // ex: 'border-[#005a2b]'
  iconBg: string;            // ex: 'bg-green-50'
  iconBorder: string;        // ex: 'border-green-200'
  iconColor: string;         // ex: 'text-[#005a2b]'
  restricted?: boolean;
}

const cardBase =
  'h-full min-h-[260px] rounded-2xl border-0 p-8 shadow-sm outline-none transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center justify-between';

const iconBoxBase =
  'mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border transition-transform group-hover:scale-110';

export function MenuCard({
  to,
  icon: Icon,
  title,
  description,
  borderColor,
  iconBg,
  iconBorder,
  iconColor,
  restricted = false,
}: MenuCardProps) {
  return (
    <Link to={to} className="block group h-full">
      <Card
        className={`${cardBase} border-b-8 ${borderColor} ${restricted ? 'relative overflow-hidden' : 'bg-white'}`}
        style={
          restricted
            ? { backgroundImage: 'repeating-linear-gradient(-45deg, #ffffff 0, #ffffff 12px, rgba(139, 92, 246, 0.05) 12px, rgba(139, 92, 246, 0.02) 24px)' }
            : undefined
        }
      >
        {restricted && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wider text-slate-500 shadow-sm backdrop-blur-sm">
            <Lock className="h-3 w-3" />
            Restrito
          </span>
        )}

        <div className="flex flex-col items-center">
          <div className={`${iconBoxBase} ${iconBg} ${iconBorder}`}>
            <Icon className={`h-11 w-11 ${iconColor}`} />
          </div>
          <h3 className="text-[1.25rem] font-black uppercase tracking-[0.05em] text-gray-800 flex items-center justify-center min-h-[56px]">
            {title}
          </h3>
        </div>

        <p className="text-[1rem] font-semibold text-gray-600 leading-[1.3] min-h-[40px] flex items-center justify-center">
          {description}
        </p>
      </Card>
    </Link>
  );
}