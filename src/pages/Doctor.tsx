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
import { CalledPatientTimer } from '@/components/CalledPatientTimer';

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
  const [calledAt, setCalledAt] = useState<number | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  
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

  const handleConfirmCallPatient = async () => {
  if (!activePatient || !room) return;

  try {
    await callForDoctor(activePatient.id, room);
    setCalledAt(Date.now());
    setTimerOpen(true);
    setActivePatientId(activePatient.id);
    
    // LÓGICA ATUALIZADA: Registra que o paciente já foi chamado e salva no navegador
    setCalledPatientIds(prev => {
      const updatedSet = new Set(prev).add(activePatient.id);
      sessionStorage.setItem('calledPatientIds', JSON.stringify(Array.from(updatedSet)));
      return updatedSet;
    });

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
    await recallPatient(activePatient.id, room);
    setCalledAt(Date.now())

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
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:1111'}/consultorios`)
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
    <div className="min-h-screen bg-slate-50">
      <Header title="Painel Médico" />
      <div className="mx-auto w-full max-w-screen-2xl px-3 pt-6">
        <BackButton />
      </div>

      <div className="section-main mx-auto w-full max-w-screen-2xl px-3 py-8">
        <div className="card overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="card-header flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-7 py-6">
            <div className="flex items-center gap-3">
              <div className="card-header-bar h-9 w-1.5 rounded bg-indigo-600" />
              <h2 className="text-2xl font-black uppercase tracking-[0.06em] text-slate-800">Fila de Espera Médica</h2>
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
                    <th className="px-6 py-4 text-lg font-black uppercase tracking-[0.1em] text-slate-600">Chegada</th>
                    <th className="px-6 py-4 text-lg font-black uppercase tracking-[0.1em] text-slate-600">Tipo</th>
                    <th className="px-6 py-4 text-lg font-black uppercase tracking-[0.1em] text-slate-600">Paciente</th>
                    <th className="px-6 py-4 text-lg font-black uppercase tracking-[0.1em] text-slate-600">Classificação</th>
                    <th className="px-6 py-4 text-center text-sm font-black uppercase tracking-[0.1em] text-slate-600">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingPatients.length === 0 ? (
                    <tr>
                      <td className="px-6 py-10 text-center text-lg font-black uppercase tracking-[0.15em] text-slate-300" colSpan={5}>
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
                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-lg font-black text-slate-600">
                              {new Date(chegada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-md border border-slate-300 bg-white px-2 py-1 text-lg font-black uppercase text-slate-600">
                              {AttendanceTypeLabel[patient.attendanceType]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xl font-bold uppercase text-slate-800">{patient.fullName}</div>
                            {patient.triageNotes && (
                              <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                {patient.triageNotes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <PriorityBadge priority={patient.priority} showLabel={false} />
                              <span className="text-lg font-black uppercase text-slate-700">
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
                                        className="h-auto rounded-lg bg-indigo-600 px-6 py-4 text-lg font-black uppercase tracking-[0.06em] text-white hover:bg-indigo-700"
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
                                className="h-auto rounded-lg px-6 py-4 text-lg font-black uppercase tracking-[0.06em]"
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
        <DialogContent className="w-full overflow-x-hidden sm:max-w-3xl [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">Chamar Paciente</DialogTitle>
            <DialogDescription className="text-lg">Revise as informações de triagem</DialogDescription>
          </DialogHeader>

          {activePatient && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  {/* <span className="text-base font-bold uppercase tracking-[0.1em] text-slate-400">Paciente</span> */}
                  <div className="text-3xl font-bold">{activePatient.fullName}</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <span className="text-base text-slate-500">Prioridade</span>
                  <div className="mt-2 flex items-center gap-3">
                    <PriorityBadge priority={activePatient.priority} showLabel={false} />
                    <span className="text-xl font-semibold">{PRIORITY_CONFIG[activePatient.priority]?.label}</span>
                  </div>
                </div>
                <div>
                  <span className="text-base text-slate-500">Tipo</span>
                  <p className="mt-2 text-xl font-semibold">{AttendanceTypeLabel[activePatient.attendanceType]}</p>
                </div>
              </div>

              {activePatient.triageNotes && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <span className="text-base font-bold uppercase tracking-[0.1em] text-slate-400">Observações:</span>
                  <div className="mt-2 rounded border border-slate-200 bg-white p-4 text-lg italic">
                    {activePatient.triageNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-4">
            {activePatient && calledPatientIds.has(activePatient.id) ? (
              <Button size="lg" className="h-14 px-8 text-lg" onClick={handleRecallPatient} disabled={!activePatient} variant="secondary">
                Chamar novamente
              </Button>
            ) : (
              <Button size="lg" className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700" onClick={handleConfirmCallPatient} disabled={!room}>
                Chamar Paciente
              </Button>
            )}

            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-red-600 hover:bg-red-700"
              onClick={() => {
                setPatientToAbandon(activePatient);
                setConfirmAbandonOpen(true);
              }}
            >
              Encerrar (Desistência)
            </Button>
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700"
              onClick={() => {
                setPatientToFinish(activePatient);
                setConfirmFinishOpen(true);
              }}
            >
              Finalizar Consulta
            </Button>
          </div>
          {/* Timer — aparece após chamar */}
          {calledAt && calledPatientIds.has(activePatient?.id) && (
            <CalledPatientTimer calledAt={calledAt} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmFinishOpen} onOpenChange={setConfirmFinishOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirmar finalização</DialogTitle>
            <DialogDescription className="text-lg">Deseja realmente finalizar esta consulta?</DialogDescription>
          </DialogHeader>

          {patientToFinish && (
            <div className="rounded border border-green-200 bg-green-50 p-5 text-lg">
              <p><strong>Paciente:</strong> {patientToFinish.fullName}</p>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-4">
            <Button size="lg" className="h-14 px-8 text-lg" variant="outline" onClick={() => setConfirmFinishOpen(false)}>
              Não
            </Button>
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700"
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirmar desistência</DialogTitle>
            <DialogDescription className="text-lg">Deseja realmente marcar esta consulta como desistência?</DialogDescription>
          </DialogHeader>

          {patientToAbandon && (
            <div className="rounded border border-red-200 bg-red-50 p-5 text-lg">
              <p><strong>Paciente:</strong> {patientToAbandon.fullName}</p>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-4">
            <Button size="lg" className="h-14 px-8 text-lg" variant="outline" onClick={() => setConfirmAbandonOpen(false)}>
              Não
            </Button>
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-red-600 hover:bg-red-700"
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