import axios from 'axios';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient, PriorityLevel, TriageCall } from '@/types/patient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1111',
  headers: { 'Content-Type': 'application/json' }
});

interface PatientContextType {
  patients: Patient[];
  recentCalls: TriageCall[];
  registerPatient: (data: { fullName: string; dateOfBirth: string; cpf: string }) => Promise<Patient>;
  callForTriage: (patientId: string) => void;
  assignPriority: (patientId: string, priority: PriorityLevel, attendanceType: 'clinical' | 'psychiatric', notes: string) => Promise<void>;
  callForDoctor: (patientId: string, room: string) => Promise<void>;
  completeConsultation: (patientId: string) => Promise<void>;
  getWaitingForTriage: () => Patient[];
  getWaitingForDoctor: () => Patient[];
  refreshPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const mapBackendPriority = (risco: string): PriorityLevel => {
  const map: Record<string, PriorityLevel> = { 
    'VERMELHO': 'red', 'LARANJA': 'orange', 'AMARELO': 'yellow', 'VERDE': 'green', 'AZUL': 'blue' 
  };
  return map[risco] || 'green';
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentCalls, setRecentCalls] = useState<TriageCall[]>(() => {
      const saved = localStorage.getItem('recentCalls');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }));
      }
      return [];
    });

    useEffect(() => {
    localStorage.setItem('recentCalls', JSON.stringify(recentCalls));
    }, [recentCalls]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === 'recentCalls' && e.newValue) {
            const parsed = JSON.parse(e.newValue);
            const fixedDates = parsed.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }));
            setRecentCalls(fixedDates);
          }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
      }, []);

  const refreshPatients = useCallback(async () => {
    try {
      const [triageRes, doctorRes] = await Promise.all([
        api.get('/pacientes/aguardando-triagem'),
        api.get('/pacientes/aguardando-medico')
      ]);

      const triagePatients = triageRes.data.map((p: any) => ({
        ...p,
        id: p.id.toString(),
        fullName: p.nome,
        status: 'waiting-triage',
        dateOfBirth: p.dateOfBirth, 
        registeredAt: new Date() 
      }));

      const doctorPatients = doctorRes.data.map((p: any) => ({
        ...p,
        id: p.id.toString(),
        fullName: p.nome,
        status: 'waiting-doctor',
        priority: mapBackendPriority(p.risco),
        attendanceType: p.tipo === 'PSIQUIATRICO' ? 'psychiatric' : 'clinical',
        triageNotes: p.triageNotes,
        registeredAt: new Date()
      }));

      setPatients([...triagePatients, ...doctorPatients]);
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }, []);

  useEffect(() => { refreshPatients(); }, [refreshPatients]);

  const registerPatient = useCallback(async (data: { fullName: string; dateOfBirth: string; cpf: string }) => {
    const response = await api.post('/pacientes', {
      nome: data.fullName,
      cpf: data.cpf,
      dataNascimento: data.dateOfBirth
    });
    await refreshPatients();
    return {
        ...response.data,
        id: response.data.id.toString(), 
        registeredAt: new Date(), 
        status: 'waiting-triage'
    } as Patient;
  }, [refreshPatients]);

  const assignPriority = useCallback(async (patientId: string, priority: PriorityLevel, attendanceType: 'clinical' | 'psychiatric', triageNotes: string) => {
    const backendPriority = { 'red': 'VERMELHO', 'orange': 'LARANJA', 'yellow': 'AMARELO', 'green': 'VERDE', 'blue': 'AZUL' }[priority];
    const backendType = attendanceType === 'psychiatric' ? 'PSIQUIATRICO' : 'CLINICO';
    
    await api.put(`/pacientes/${patientId}/classificar`, {
      risco: backendPriority,
      tipo: backendType,
      triageNotes
    });
    await refreshPatients();
  }, [refreshPatients]);

  const callForDoctor = useCallback(async (patientId: string, room: string) => {

    const consultorioId = 1; 
    
    await api.put(`/pacientes/${patientId}/chamar?consultorioId=${consultorioId}`);
    
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setRecentCalls(prev => [{
        ticketNumber: patient.ticketNumber || 'N/A',
        patientName: patient.fullName,
        type: 'doctor' as const,
        room,
        priority: patient.priority,
        timestamp: new Date()
      }, ...prev].slice(0, 4));
    }
    
    await refreshPatients();
  }, [patients, refreshPatients]);

  const completeConsultation = useCallback(async (patientId: string) => {
    console.warn("Backend missing 'complete' endpoint. Optimistic update only.");
    setPatients(prev => prev.filter(p => p.id !== patientId));
  }, []);

  const callForTriage = useCallback((patientId: string) => {
     setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: 'in-triage' } : p));
     const patient = patients.find(p => p.id === patientId);
     if (patient) {
      setRecentCalls(prev => [{
        ticketNumber: patient.ticketNumber || 'SENHA', 
        timestamp: new Date(), 
        priority: 'green' as const, 
        patientName: patient.fullName,
        type: 'triage' as const, 
        room: 'Triagem',
      }, ...prev].slice(0, 10));
    }
  }, [patients]);

  

  const getWaitingForTriage = useCallback(() => patients.filter(p => p.status === 'waiting-triage'), [patients]);
  const getWaitingForDoctor = useCallback(() => patients.filter(p => p.status === 'waiting-doctor'), [patients]);

  return (
    <PatientContext.Provider value={{ 
      patients, recentCalls, registerPatient, callForTriage, 
      assignPriority, callForDoctor, completeConsultation, 
      getWaitingForTriage, getWaitingForDoctor, refreshPatients 
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) throw new Error('usePatients must be used within PatientProvider');
  return context;
};