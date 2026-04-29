import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { TriageCall } from '@/types/patient';

import { PublicPanelDataModel } from '../types';
import { BackendPanelCall, mapBackendPanelCall } from '../utils/mapBackendPanelCall';
import { mapCallToViewModel } from '../utils/mapCallToViewModel';
import { mergePanelCalls } from '../utils/mergePanelCalls';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1111';
const PANEL_CALLS_LIMIT = 10;

export function usePublicPanelData(): PublicPanelDataModel {
  const [recentCalls, setRecentCalls] = useState<TriageCall[]>([]);
  const knownCallIdsRef = useRef(new Set<string>());
  const initialHistoryLoadedRef = useRef(false);

  useEffect(() => {
    let closed = false;

    async function loadRecentCalls() {
      try {
        const response = await axios.get<BackendPanelCall[]>(`${API_BASE_URL}/painel/chamadas/recentes`);

        if (!closed) {
          const loadedCalls = response.data.map((backendCall) => {
            const callId = String(backendCall.id);
            const shouldAnnounce = initialHistoryLoadedRef.current && !knownCallIdsRef.current.has(callId);
            return mapBackendPanelCall(backendCall, shouldAnnounce);
          });

          loadedCalls.forEach((call) => knownCallIdsRef.current.add(call.callId));
          initialHistoryLoadedRef.current = true;

          setRecentCalls((prev) => mergePanelCalls([...loadedCalls, ...prev], PANEL_CALLS_LIMIT));
        }
      } catch (error) {
        console.error('Falha ao carregar chamadas recentes do painel:', error);
      }
    }

    loadRecentCalls();

    const source = new EventSource(`${API_BASE_URL}/painel/chamadas/stream`);

    const handleOpen = () => {
      loadRecentCalls();
    };

    const handlePatientCalled = (event: MessageEvent<string>) => {
      try {
        const call = mapBackendPanelCall(JSON.parse(event.data) as BackendPanelCall, true);
        knownCallIdsRef.current.add(call.callId);

        setRecentCalls((prev) => mergePanelCalls([call, ...prev], PANEL_CALLS_LIMIT));
      } catch (error) {
        console.error('Falha ao processar chamada recebida por SSE:', error);
      }
    };

    source.addEventListener('open', handleOpen);
    source.addEventListener('patient-called', handlePatientCalled as EventListener);

    source.onerror = () => {
      console.warn('Conexão SSE do painel interrompida; o navegador tentará reconectar automaticamente.');
    };

    return () => {
      closed = true;
      source.removeEventListener('open', handleOpen);
      source.removeEventListener('patient-called', handlePatientCalled as EventListener);
      source.close();
    };
  }, []);

  return {
    recentCalls: recentCalls.map(mapCallToViewModel),
  };
}
