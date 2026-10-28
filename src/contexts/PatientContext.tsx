import axios from 'axios';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient, PriorityLevel } from '@/types/patient';
import { AttendanceTypeBackend, PriorityBackend } from '@/lib/utils/backendMaps';
import { BackendPatient, mapBackendPatient } from '@/lib/utils/mapBackendPatient';

import { API_BASE_URL } from '@/lib/appConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

interface PatientContextType {
  patients: Patient[];
  registerPatient: (data: { fullName: string; dateOfBirth: string; cpf: string }) => Promise<Patient>;
  callForTriage: (patientId: string) => Promise<void>;
  rechamarTriagem: (patientId: string) => Promise<void>;
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

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);

  const refreshPatients = useCallback(async () => {
    try {
      const [triageRes, doctorRes] = await Promise.all([
        api.get<BackendPatient[]>('/pacientes/aguardando-triagem'),
        api.get<BackendPatient[]>('/pacientes/aguardando-medico')
      ]);

      const triagePatients = triageRes.data.map((p) => mapBackendPatient(p, 'waiting-triage'));
      const doctorPatients = doctorRes.data.map((p) => mapBackendPatient(p, 'waiting-doctor'));
      console.log('Fetched patients:', [...triagePatients, ...doctorPatients]);

      setPatients([...triagePatients, ...doctorPatients]);
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }, []);

  useEffect(() => { refreshPatients(); }, [refreshPatients]);

  const registerPatient = useCallback(async (data: { fullName: string; dateOfBirth: string; cpf: string }) => {
    const response = await api.post<BackendPatient>('/pacientes', {
      nome: data.fullName,
      cpf: data.cpf,
      dataNascimento: data.dateOfBirth
    });

    await refreshPatients();

    return {
      ...mapBackendPatient(response.data, 'waiting-triage'),
      ticketNumber: `T-0${response.data.id}`,
    };
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
  }, []);

  const rechamarTriagem = useCallback(async (patientId: string) => {
    await api.put(`/pacientes/${patientId}/rechamar-triagem`);
  }, []);



  const getWaitingForTriage = useCallback(() => patients.filter(p => p.status === 'waiting-triage'), [patients]);
  const getWaitingForDoctor = useCallback(() => patients.filter(p => p.status === 'waiting-doctor'), [patients]);

  return (
    <PatientContext.Provider value={{
      patients, registerPatient, callForTriage, rechamarTriagem,
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
