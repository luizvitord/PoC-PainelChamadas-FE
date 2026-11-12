import { useQuery } from '@tanstack/react-query';

import { getProtocolos } from '@/services/ProtocoloService';

// O protocolo muda raramente: fica em cache e é compartilhado entre a Triagem e os Indicadores.
export function useProtocolos() {
  return useQuery({
    queryKey: ['protocolos'],
    queryFn: getProtocolos,
    staleTime: 5 * 60 * 1000,
  });
}
