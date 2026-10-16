import { useState } from 'react';

// Proteção provisória: a senha vai junto no bundle do front. O controle de acesso de verdade precisa vir do back.
const ACCESS_PASSWORD = '1234';

// O desbloqueio fica só em memória: toda vez que a tela é aberta (menu, URL ou F5) a senha é pedida de novo.
export function useIndicatorsAccess() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = (password: string) => {
    if (password !== ACCESS_PASSWORD) return false;

    setIsUnlocked(true);
    return true;
  };

  return { isUnlocked, unlock };
}
