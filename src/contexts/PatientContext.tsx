import axios from 'axios';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient, PriorityLevel } from '@/types/patient';
import { AttendanceTypeBackend, PriorityBackend } from '@/lib/utils/backendMaps';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1111',
  headers: { 'Content-Type': 'application/json' }
});

interface PatientContextType {
  patients: Patient[];
  registerPatient: (data: { fullName: string; dateOfBirth: string; cpf: string }) => Promise<Patient>;
  callForTriage: (patientId: string) => Promise<void>;
  assignPriority: (patientId: string, priority: PriorityLevel, attendanceType: 'clinical' | 'psychiatric' | 'samu', notes: string) => Promise<void>;
  callForDoctor: (patientId: string, room: string) => Promise<void>;
  recallPatient: (patientId: string, room: string) => Promise<void>;
  completeConsultation: (patientId: string) => Promise<void>;
  abandonConsultation: (patientId: string) => Promise<void>;
  getWaitingForTriage: () => Patient[];
  getWaitingForDoctor: () => Patient[];
  refreshPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const mapBackendPriority = (risco?: string | null): PriorityLevel => {
  const map: Record<string, PriorityLevel> = {
    'VERMELHO': 'red', 'LARANJA': 'orange', 'AMARELO': 'yellow', 'VERDE': 'green', 'AZUL': 'blue'
  };
  return risco ? map[risco] || 'green' : 'green';
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);

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
        attendanceType: p.tipo === 'PSIQUIATRICO' ? 'psychiatric' : p.tipo === 'SAMU' ? 'samu' : 'clinical',
        triageNotes: p.triageNotes,
        registeredAt: new Date(),
        classifiedAt: p.classifiedAt ? new Date(p.classifiedAt) : null
      }));
      console.log('Fetched patients:', [...triagePatients, ...doctorPatients]);

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

    // Mapeamento: Pegamos o que vem do Java e transformamos para o padrão do Front
    return {
      ...response.data,
      id: response.data.id.toString(),
      // Verifique se no Java o campo é 'nome' ou 'fullName'. 
      // Se o Java retorna 'nome', mapeamos para 'fullName' aqui:
      fullName: response.data.nome || data.fullName,
      // Verifique se no Java o campo é 'ticketNumber', 'senha' ou 'numeroTicket'
      ticketNumber: `T-0${response.data.id}`,
      registeredAt: new Date(),
      status: 'waiting-triage'
    } as Patient;
  }, [refreshPatients]);

  const assignPriority = useCallback(async (patientId: string, priority: PriorityLevel, attendanceType: 'clinical' | 'psychiatric' | 'samu', triageNotes: string) => {
    const backendPriority = PriorityBackend[priority];
    const backendType = AttendanceTypeBackend[attendanceType];

    await api.put(`/pacientes/${patientId}/classificar`, {
      risco: backendPriority,
      tipo: backendType,
      triageNotes
    });
    await refreshPatients();
  }, [refreshPatients]);

  const callForDoctor = useCallback(async (patientId: string, room: string) => {
    await api.put(`/pacientes/${patientId}/chamar?consultorioId=${room}`);
    await refreshPatients();
  }, [refreshPatients]);

  const recallPatient = useCallback(async (patientId: string, room: string) => {
    await api.put(`/pacientes/${patientId}/rechamar`);
  }, []);

  const completeConsultation = useCallback(async (patientId: string) => {
    console.log(`Finalizando consulta para paciente ID: ${patientId}`);
    await api.put(`/pacientes/${patientId}/finalizar`);
    await refreshPatients();
  }, [refreshPatients]);

  const abandonConsultation = useCallback(async (patientId: string) => {
    await api.put(`/pacientes/${patientId}/desistencia`);
    await refreshPatients();
  }, [refreshPatients]);

  const callForTriage = useCallback(async (patientId: string) => {
    await api.put(`/pacientes/${patientId}/chamar-triagem`);
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: 'in-triage' } : p));
  }, []);



  const getWaitingForTriage = useCallback(() => patients.filter(p => p.status === 'waiting-triage'), [patients]);
  const getWaitingForDoctor = useCallback(() => patients.filter(p => p.status === 'waiting-doctor'), [patients]);

  return (
    <PatientContext.Provider value={{
      patients, registerPatient, callForTriage,
      assignPriority, callForDoctor, completeConsultation, abandonConsultation,
      getWaitingForTriage, getWaitingForDoctor, refreshPatients,
      recallPatient
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
