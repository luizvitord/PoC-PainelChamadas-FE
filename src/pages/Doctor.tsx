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
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header title="Painel Médico" />
     {/* Back button */}
    <div className="container mx-auto px-6 pt-6 max-w-6xl">
      <BackButton />
    </div>
      <main className="container mx-auto py-10 px-6 flex-grow max-w-6xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-7 border-b border-gray-100 flex items-center justify-between gap-4">
            <h2 className="text-gray-800 font-black uppercase tracking-wider text-base flex items-center">
              <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>Fila de Espera Médica
            </h2>
            <div className="w-[360px] max-w-full">
              <RoomSelect
                value={room}
                onChange={setRoom}
                options={consultorios}
                label="Selecione o consultório para chamada"
              />
            </div>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-sm font-black text-gray-600 uppercase tracking-wider">Chegada</th>
                    <th className="px-6 py-5 text-sm font-black text-gray-600 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-5 text-sm font-black text-gray-600 uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-5 text-sm font-black text-gray-600 uppercase tracking-wider">Classificação</th>
                    <th className="px-6 py-5 text-sm font-black text-gray-600 uppercase tracking-wider text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {waitingPatients.length === 0 ? (
                    <tr>
                      <td className="px-6 py-10 text-center text-sm font-black uppercase tracking-wider text-gray-300" colSpan={5}>
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
                        <tr key={patient.id} className={`hover:bg-red-50/30 transition-colors ${overdue ? 'animate-pulse bg-orange-50/60' : ''}`}>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="text-sm font-black text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {new Date(chegada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-black text-gray-600 uppercase border border-gray-300 px-2 py-1 rounded bg-white">
                              {AttendanceTypeLabel[patient.attendanceType]}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-gray-800 uppercase text-base">{patient.fullName}</p>
                            {patient.triageNotes && (
                              <p className="text-sm text-gray-600 font-semibold mt-1 line-clamp-1">
                                Observações: {patient.triageNotes}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                              <PriorityBadge priority={patient.priority} showLabel={false} />
                              <span className="text-sm font-black uppercase text-gray-700">
                                {patient.priority ? PRIORITY_CONFIG[patient.priority].label : 'Não classificado'}
                              </span>
                              {overdue && <span className="text-xs font-bold text-orange-700">TEMPO EXCEDIDO</span>}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex justify-center gap-2">
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
                                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black px-5 py-2.5 rounded-lg uppercase tracking-wider transition-all"
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
                                  className="text-sm font-black uppercase tracking-wider rounded-lg px-5 py-2.5"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Finish Consultation
                                </Button>
                              )}
                            </div>
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
      </main>

        {/* MODAL: CHAMAR PACIENTE (Único modal ativo agora) */}
          <Dialog open={consultationLocked} onOpenChange={() => {}}>
                    <DialogContent className="sm:max-w-xl w-full overflow-x-hidden [&>button]:hidden">
                      <DialogHeader>
                        <DialogTitle>Chamar Paciente</DialogTitle>
                        <DialogDescription>
                          Revise as informações de triagem antes de chamar o paciente.
                        </DialogDescription>
                      </DialogHeader>

                      {activePatient && (
                         <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-3 mb-2 w-full min-w-0">
                              <div className="flex items-start justify-between">
                                  <div>
                                      <h4 className="font-bold text-lg">{activePatient.fullName}</h4>
                                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Dados do Paciente</span>
                                  </div>
                                  <span className="text-2xl font-bold text-primary">{activePatient.ticketNumber}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm min-w-0">
                                  <div className="flex flex-col min-w-0">
                                      <span className="text-muted-foreground text-xs">Prioridade</span>
                                      <div className="flex items-center gap-2 mt-1">
                                          <PriorityBadge priority={activePatient.priority} showLabel={false} />
                                          <span>{PRIORITY_CONFIG[activePatient.priority]?.label}</span>
                                      </div>
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                      <span className="text-muted-foreground text-xs">Tipo</span>
                                      <span className="font-medium mt-1">
                                        {AttendanceTypeLabel[activePatient.attendanceType]}
                                      </span>
                                  </div>
                              </div>

                              {activePatient.triageNotes && (
                                  <div className="pt-2 border-t border-border/50">
                                      <span className="text-xs text-muted-foreground block mb-1">Observações:</span>
                                      <p className="text-sm italic text-foreground bg-background/50 p-2 rounded border border-border/30">
                                          {activePatient.triageNotes}
                                      </p>
                                  </div>
                              )}
                          </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-4">
                        {/* <Button variant="outline" onClick={() => setSelectedPatientId(null)}>
                          Cancel
                        </Button> */}
                        
                        {activePatient && calledPatientIds.has(activePatient.id) ? (
                          <Button onClick={handleRecallPatient} disabled={!activePatient} variant="secondary">
                            Chamar novamente
                          </Button>
                        ) : (
                          <Button onClick={handleConfirmCallPatient} disabled={!room}>
                            Chamar Paciente
                          </Button>
                        )}

                        <Button    
                          onClick={() => {
                            setPatientToAbandon(activePatient);
                            setConfirmAbandonOpen(true);
                          }}
                          className="bg-red-600 hover:bg-red-700">
                            Encerrar consulta (Desistência)
                        </Button>
                        <Button onClick={() => {
                                  setPatientToFinish(activePatient);
                                  setConfirmFinishOpen(true);
                                }} className="bg-green-600 hover:bg-green-700">
                          Finalizar consulta (Atendido)
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={confirmFinishOpen} onOpenChange={setConfirmFinishOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Confirmar finalização</DialogTitle>
                        <DialogDescription>
                          Deseja realmente finalizar esta consulta?
                        </DialogDescription>
                      </DialogHeader>

                      {patientToFinish && (
                        <div className="bg-secondary/50 border rounded p-3 text-sm">
                          <p><strong>Paciente:</strong> {patientToFinish.fullName}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setConfirmFinishOpen(false)}
                        >
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
                        <DialogDescription>
                          Deseja realmente marcar esta consulta como desistência?
                        </DialogDescription>
                      </DialogHeader>

                      {patientToAbandon && (
                        <div className="bg-secondary/50 border rounded p-3 text-sm">
                          <p><strong>Paciente:</strong> {patientToAbandon.fullName}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setConfirmAbandonOpen(false)}
                        >
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