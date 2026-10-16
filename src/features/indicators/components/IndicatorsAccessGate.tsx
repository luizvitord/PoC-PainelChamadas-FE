import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface IndicatorsAccessGateProps {
  onUnlock: (password: string) => boolean;
}

export function IndicatorsAccessGate({ onUnlock }: IndicatorsAccessGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!onUnlock(password)) {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <div className="w-full max-w-xl rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 border border-purple-100">
            <Lock className="h-7 w-7 text-purple-600" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-wide text-gray-800">Acesso Restrito</h2>
          <p className="text-center text-lg font-medium text-gray-500">Digite a senha para acessar os indicadores</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className={`h-12 text-base ${error ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
            autoFocus
          />
          {error && (
            <p className="text-base font-semibold text-red-500">Senha incorreta. Tente novamente.</p>
          )}
          <Button type="submit" className="h-12 text-base font-black uppercase tracking-wide bg-[#008140] hover:bg-[#005a2b]">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
