import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import { PriorityBadge } from '@/components/PriorityBadge';
import RoomSelect from '@/components/RoomSelect';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePatients } from '@/contexts/PatientContext';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTypeLabel } from '@/lib/attendanceTypes';
import { PRIORITY_CONFIG } from "@/types/patient";
import { CheckCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Doctor() {
  const { getWaitingForDoctor, callForDoctor, completeConsultation, abandonConsultation, refreshPatients, recallPatient } = usePatients();
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [room, setRoom] = useState('');
  const [consultorios, setConsultorios] = useState<any[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string>('');
  const [consultationLocked, setConsultationLocked] = useState(false);
  const [activePatient, setActivePatient] = useState<any | null>(null);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);
  const [patientToFinish, setPatientToFinish] = useState<any | null>(null);
  const [confirmAbandonOpen, setConfirmAbandonOpen] = useState(false);
  const [patientToAbandon, setPatientToAbandon] = useState<any | null>(null);
  
  // Variável adicionada pela equipe (tempo excedido)
  const [now, setNow] = useState(Date.now());

  // LÓGICA ATUALIZADA (Sua): Puxa do sessionStorage (se existir) para não perder ao trocar de tela
  const [calledPatientIds, setCalledPatientIds] = useState<Set<string>>(() => {
    const saved = sessionStorage.getItem('calledPatientIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const waitingPatients = getWaitingForDoctor();

  const handleOpenCallModal = (patient: any) => {
    setActivePatient(patient);
    setConsultationLocked(true);
  };

  const handleCall = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const handleCallPatient = async (patient: any) => {
    if (!room) return;
    setActivePatient(patient);

    try{

      await callForDoctor(patient.id, room);
  
      setActivePatientId(patient.id);
      setConsultationLocked(true);
  
      await refreshPatients();
    } catch(error){
      toast({ variant: "destructive", title: "Error", description: "Falha ao chamar o paciente." });
    }
  };

  const handleConfirmCallPatient = async () => {
  if (!activePatient || !room) return;

  try {
    await callForDoctor(activePatient.id, room);
    setActivePatientId(activePatient.id);
    
    // LÓGICA ATUALIZADA: Registra que o paciente já foi chamado e salva no navegador
    setCalledPatientIds(prev => {
      const updatedSet = new Set(prev).add(activePatient.id);
      sessionStorage.setItem('calledPatientIds', JSON.stringify(Array.from(updatedSet)));
      return updatedSet;
    });

    // setConsultationLocked(false); // fecha modal
    await refreshPatients();

    toast({
      title: 'Paciente chamado',
      description: `${activePatient.fullName} foi chamado para a sala ${room}`,
    });
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Erro',
      description: 'Falha ao chamar o paciente',
    });
  }
};

const handleRecallPatient = async () => {
  if (!activePatient || !room) return; 

  try {
    console.log("Rechamando paciente:", activePatient);
    
    
    await recallPatient(activePatient.id, room);

    toast({
      title: 'Paciente chamado novamente',
      description: `${activePatient.fullName} foi chamado novamente para a sala ${room}`,
    });
  } catch (err) {
    toast({
      variant: 'destructive',
      title: 'Erro',
      description: 'Não foi possível rechamar o paciente',
    });
  }
};

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPatients();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshPatients]);

  useEffect(() => {
    // Ajuste a URL se necessário
    fetch("http://localhost:1111/consultorios")
      .then(res => res.json())
      .then(data => setConsultorios(data))
      .catch(err => console.error("Erro ao carregar consultórios", err));
  }, []);

  useEffect(() => {
    if (selectedPatientId && consultorios.length > 0) {
      setRoom(String(consultorios[0].id));
    }
  }, [selectedPatientId, consultorios]);

  useEffect(() => {
  const interval = setInterval(() => {
    setNow(Date.now());
  }, 1000);

  return () => clearInterval(interval);
}, []);

  const handleConfirmCall = async () => {
    if (selectedPatientId && room) {
      try {
        await callForDoctor(selectedPatientId, room);
        toast({ title: 'Paciente Chamado', description: `Chamando para a sala ${room}` });
        setSelectedPatientId(null);
        setRoom('');
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Falha ao chamar o paciente." });
      }
    }
  };

  const handleFinishConsultation = async (patientId: string) =>{
    try{
        await completeConsultation(patientId);
        setConsultationLocked(false);
        toast({
          title: 'Finalizada',
          description: 'Consulta finalizada com sucesso.',
        });
      } catch(error){
          toast({ variant: "destructive", title: "Error", description: "Falha ao finalizar consulta." });
    }    
  };

const handleAbandonConsultation = async (patientId: string) => {
  try {
    await abandonConsultation(patientId);

    setConsultationLocked(false);
    setActivePatient(null);
    setActivePatientId(null);

    toast({
      title: 'Consulta encerrada',
      description: 'Paciente marcado como desistência.',
    });
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Falha ao registrar desistência.",
    });
  }
};

  return (
    <div className="min-h-screen bg-slate-50 font-['Barlow_Condensed',sans-serif]">
      <Header title="Painel Médico" />
      <div className="mx-auto w-full max-w-6xl px-6 pt-6">
        <BackButton />
      </div>

      <div className="section-main mx-auto w-full max-w-6xl px-6 py-8">
        <div className="card overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="card-header flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-7 py-6">
            <div className="flex items-center gap-3">
              <div className="card-header-bar h-9 w-1.5 rounded bg-indigo-600" />
              <h2 className="text-xl font-black uppercase tracking-[0.06em] text-slate-800">Fila de Espera Médica</h2>
            </div>
            <div className="room-select-wrap flex w-full max-w-[360px] items-center justify-end gap-2">
              <RoomSelect
                value={room}
                onChange={setRoom}
                options={consultorios}
                label="Consultório:"
              />
            </div>
          </div>

          <CardContent className="table-wrap p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-black uppercase tracking-[0.1em] text-slate-600">Chegada</th>
                    <th className="px-6 py-4 text-sm font-black uppercase tracking-[0.1em] text-slate-600">Tipo</th>
                    <th className="px-6 py-4 text-sm font-black uppercase tracking-[0.1em] text-slate-600">Paciente</th>
                    <th className="px-6 py-4 text-sm font-black uppercase tracking-[0.1em] text-slate-600">Classificação</th>
                    <th className="px-6 py-4 text-center text-sm font-black uppercase tracking-[0.1em] text-slate-600">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingPatients.length === 0 ? (
                    <tr>
                      <td className="px-6 py-10 text-center text-sm font-black uppercase tracking-[0.15em] text-slate-300" colSpan={5}>
                        Nenhum paciente na fila de espera
                      </td>
                    </tr>
                  ) : (
                    waitingPatients.map((patient) => {
                      const classifiedAtTime = patient.classifiedAt
                        ? (patient.classifiedAt instanceof Date
                            ? patient.classifiedAt.getTime()
                            : new Date(patient.classifiedAt).getTime())
                        : null;

                      const isOrange = patient.priority === 'orange';
                      const overdue = isOrange && classifiedAtTime && (now - classifiedAtTime > 10 * 60 * 1000);
                      const chegada = patient.classifiedAt || patient.registeredAt;

                      return (
                        <tr key={patient.id} className={`border-b border-slate-100 ${overdue ? 'animate-pulse bg-orange-50/60' : ''}`}>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-sm font-black text-slate-600">
                              {new Date(chegada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-black uppercase text-slate-600">
                              {AttendanceTypeLabel[patient.attendanceType]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[0.95rem] font-bold uppercase text-slate-800">{patient.fullName}</div>
                            {patient.triageNotes && (
                              <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                {patient.triageNotes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <PriorityBadge priority={patient.priority} showLabel={false} />
                              <span className="text-sm font-black uppercase text-slate-700">
                                {patient.priority ? PRIORITY_CONFIG[patient.priority].label : 'Não classificado'}
                              </span>
                              {overdue && <span className="text-[0.65rem] font-bold text-orange-600">TEMPO EXCEDIDO</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {patient.status === 'waiting-doctor' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-block">
                                      <Button
                                        disabled={!room}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenCallModal(patient);
                                        }}
                                        className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-black uppercase tracking-[0.06em] text-white hover:bg-indigo-700"
                                      >
                                        <Phone className="mr-2 h-4 w-4" />
                                        Selecionar para Consulta
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!room && (
                                    <TooltipContent>
                                      <p>Selecione um consultório</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            {patient.status === 'in-consultation' && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                variant="outline"
                                className="h-9 rounded-lg px-4 text-sm font-black uppercase tracking-[0.06em]"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Finalizar Consulta
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </div>
      </div>

      <Dialog open={consultationLocked} onOpenChange={() => {}}>
        <DialogContent className="w-full overflow-x-hidden sm:max-w-xl [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Chamar Paciente</DialogTitle>
            <DialogDescription>Revise as informações de triagem antes de chamar o paciente.</DialogDescription>
          </DialogHeader>

          {activePatient && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">{activePatient.fullName}</div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Dados do Paciente</span>
                </div>
                <span className="text-2xl font-bold text-indigo-600">{activePatient.ticketNumber}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-slate-500">Prioridade</span>
                  <div className="mt-1 flex items-center gap-2">
                    <PriorityBadge priority={activePatient.priority} showLabel={false} />
                    <span>{PRIORITY_CONFIG[activePatient.priority]?.label}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Tipo</span>
                  <p className="mt-1 font-medium">{AttendanceTypeLabel[activePatient.attendanceType]}</p>
                </div>
              </div>

              {activePatient.triageNotes && (
                <div className="mt-3 border-t border-slate-200 pt-2">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-slate-400">Observações:</span>
                  <div className="mt-1 rounded border border-slate-200 bg-white p-2 text-sm italic">
                    {activePatient.triageNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            {activePatient && calledPatientIds.has(activePatient.id) ? (
              <Button onClick={handleRecallPatient} disabled={!activePatient} variant="secondary">
                Chamar novamente
              </Button>
            ) : (
              <Button onClick={handleConfirmCallPatient} disabled={!room} className="bg-indigo-600 hover:bg-indigo-700">
                Chamar Paciente
              </Button>
            )}

            <Button
              onClick={() => {
                setPatientToAbandon(activePatient);
                setConfirmAbandonOpen(true);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Encerrar (Desistência)
            </Button>
            <Button
              onClick={() => {
                setPatientToFinish(activePatient);
                setConfirmFinishOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Finalizar Consulta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmFinishOpen} onOpenChange={setConfirmFinishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar finalização</DialogTitle>
            <DialogDescription>Deseja realmente finalizar esta consulta?</DialogDescription>
          </DialogHeader>

          {patientToFinish && (
            <div className="rounded border border-green-200 bg-green-50 p-3 text-sm">
              <p><strong>Paciente:</strong> {patientToFinish.fullName}</p>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmFinishOpen(false)}>
              Não
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={async () => {
                await handleFinishConsultation(patientToFinish.id);
                setConfirmFinishOpen(false);
              }}
            >
              Sim, finalizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmAbandonOpen} onOpenChange={setConfirmAbandonOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar desistência</DialogTitle>
            <DialogDescription>Deseja realmente marcar esta consulta como desistência?</DialogDescription>
          </DialogHeader>

          {patientToAbandon && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm">
              <p><strong>Paciente:</strong> {patientToAbandon.fullName}</p>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmAbandonOpen(false)}>
              Não
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                await handleAbandonConsultation(patientToAbandon.id);
                setConfirmAbandonOpen(false);
              }}
            >
              Sim, marcar como desistência
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}