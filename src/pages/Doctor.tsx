import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import { PriorityBadge } from '@/components/PriorityBadge';
import RoomSelect from '@/components/RoomSelect';
import { SuicidalBehaviorField } from '@/components/SuicidalBehaviorField';
import { TriageNotesPreview } from '@/components/TriageNotesPreview';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePatients } from '@/contexts/PatientContext';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTypeLabel } from '@/lib/attendanceTypes';
import { isOverdue } from '@/lib/isOverdue';
import { PatientAlreadyCalledError } from '@/lib/patientErrors';
import { SuicidalBehavior, SuicidalBehaviorLabel } from '@/lib/suicidalBehavior';
import { formatConsultorioLabel, type Consultorio } from '@/lib/consultorioLabel';
import { CheckCircle, Loader2, Phone } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CalledPatientTimer } from '@/components/CalledPatientTimer';
import { getConsultorios } from '@/services/ConsultorioService';

const ROOM_STORAGE_KEY = 'doctorActiveRoomId';
const CALLED_ROOMS_STORAGE_KEY = 'doctorCalledRoomByPatient';

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* armazenamento indisponível: a seleção vale só até recarregar */
  }
}

function removeSession(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export default function Doctor() {
  const { getWaitingForDoctor, callForDoctor, completeConsultation, abandonConsultation, refreshPatients, recallPatient } = usePatients();
  const { toast } = useToast();
  // Consultório ativo: nunca é escolhido automaticamente. Só é restaurado se o próprio
  // médico o escolheu nesta aba (sessionStorage) e se ainda existir na lista do backend.
  const [room, setRoom] = useState<string>(() => readSession(ROOM_STORAGE_KEY) ?? '');
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [consultoriosLoading, setConsultoriosLoading] = useState(true);
  const [consultoriosError, setConsultoriosError] = useState<string | null>(null);
  // Consultório efetivamente usado em cada chamada (o "rechamar" do backend reutiliza o mesmo)
  const [calledRoomByPatient, setCalledRoomByPatient] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(readSession(CALLED_ROOMS_STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  });
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
  const [suicidalBehavior, setSuicidalBehavior] = useState<SuicidalBehavior | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  // Variável adicionada pela equipe (tempo excedido)
  const [now, setNow] = useState(Date.now());

  // LÓGICA ATUALIZADA (Sua): Puxa do sessionStorage (se existir) para não perder ao trocar de tela
  const [calledPatientIds, setCalledPatientIds] = useState<Set<string>>(() => {
    const saved = sessionStorage.getItem('calledPatientIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const waitingPatients = getWaitingForDoctor();
  // O modal só trava depois de chamar: antes disso o médico está só revisando e pode fechar.
  const isActivePatientCalled = !!activePatient && calledPatientIds.has(activePatient.id);

  const activeConsultorio = consultorios.find((c) => String(c.id) === room);
  // Só há consultório "ativo" quando o ID existe na lista carregada do backend
  const hasActiveRoom = Boolean(activeConsultorio);

  const handleRoomChange = (value: string) => {
    setRoom(value);
    if (value) writeSession(ROOM_STORAGE_KEY, value);
    else removeSession(ROOM_STORAGE_KEY);
  };

  const roomLabelById = (id: string | undefined) => {
    if (!id) return '';
    return formatConsultorioLabel(consultorios.find((c) => String(c.id) === id)) || `Consultório ${id}`;
  };

  const handleOpenCallModal = (patient: any) => {
    setActivePatient(patient);
    setSuicidalBehavior(null); // cada paciente começa sem avaliação marcada
    setConsultationLocked(true);
  };

  const closeCallModal = () => {
    setConsultationLocked(false);
    setActivePatient(null);
  };

  const handleConfirmCallPatient = async () => {
  // Captura o consultório no instante do clique: o ID enviado, o toast e o registro
  // local usam exatamente o mesmo valor que estava exibido como ativo.
  const roomId = room;
  const roomConsultorio = consultorios.find((c) => String(c.id) === roomId);
  if (!activePatient || !roomConsultorio || isCalling) return;

  setIsCalling(true);
  try {
    await callForDoctor(activePatient.id, roomId);
    setCalledAt(Date.now());
    setTimerOpen(true);
    setActivePatientId(activePatient.id);
    
    // LÓGICA ATUALIZADA: Registra que o paciente já foi chamado e salva no navegador
    setCalledPatientIds(prev => {
      const updatedSet = new Set(prev).add(activePatient.id);
      sessionStorage.setItem('calledPatientIds', JSON.stringify(Array.from(updatedSet)));
      return updatedSet;
    });
    setCalledRoomByPatient(prev => {
      const updated = { ...prev, [activePatient.id]: roomId };
      writeSession(CALLED_ROOMS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    await refreshPatients();

    toast({
      title: 'Paciente chamado',
      description: `${activePatient.fullName} foi chamado para o ${formatConsultorioLabel(roomConsultorio)}`,
    });
  } catch (error) {
    if (error instanceof PatientAlreadyCalledError) {
      // Outro médico chamou antes: o paciente já saiu da fila, então fecha o modal.
      closeCallModal();
      toast({
        variant: 'destructive',
        title: 'Paciente já chamado',
        description: `${error.message} A fila foi atualizada.`,
      });
      return;
    }
    toast({
      variant: 'destructive',
      title: 'Erro',
      description: `Falha ao chamar o paciente para o ${formatConsultorioLabel(roomConsultorio)}. Nenhuma chamada foi registrada.`,
    });
  } finally {
    setIsCalling(false);
  }
};

const handleRecallPatient = async () => {
  if (!activePatient || isCalling) return;
  // O backend rechama para o consultório da chamada original (não recebe ID),
  // então a mensagem precisa refletir esse consultório, não o selecionado agora.
  const originalRoomId = calledRoomByPatient[activePatient.id];

  setIsCalling(true);
  try {
    await recallPatient(activePatient.id, originalRoomId ?? room);
    setCalledAt(Date.now())

    toast({
      title: 'Paciente chamado novamente',
      description: originalRoomId
        ? `${activePatient.fullName} foi chamado novamente para o ${roomLabelById(originalRoomId)}`
        : `${activePatient.fullName} foi chamado novamente`,
    });
  } catch (err) {
    toast({
      variant: 'destructive',
      title: 'Erro',
      description: 'Não foi possível rechamar o paciente',
    });
  } finally {
    setIsCalling(false);
  }
};

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPatients();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshPatients]);

  const loadConsultorios = useCallback(async () => {
    setConsultoriosLoading(true);
    setConsultoriosError(null);
    const result = await getConsultorios().catch(() => ({ error: 'network' }));
    if (Array.isArray(result)) {
      setConsultorios(result);
    } else {
      setConsultoriosError('Não foi possível carregar os consultórios.');
    }
    setConsultoriosLoading(false);
  }, []);

  useEffect(() => {
    loadConsultorios();
  }, [loadConsultorios]);

  // Seleção restaurada da sessão que não existe mais no backend é descartada:
  // melhor pedir uma nova escolha do que chamar para um consultório inexistente.
  useEffect(() => {
    if (consultoriosLoading || consultoriosError || !room) return;
    if (!consultorios.some((c) => String(c.id) === room)) {
      setRoom('');
      removeSession(ROOM_STORAGE_KEY);
      toast({
        variant: 'destructive',
        title: 'Consultório indisponível',
        description: 'O consultório escolhido anteriormente não existe mais. Selecione outro.',
      });
    }
  }, [consultorios, consultoriosLoading, consultoriosError, room, toast]);

  useEffect(() => {
  const interval = setInterval(() => {
    setNow(Date.now());
  }, 1000);

  return () => clearInterval(interval);
}, []);

  const handleFinishConsultation = async (patientId: string, behavior: SuicidalBehavior) =>{
    try{
        await completeConsultation(patientId, behavior);
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
          <div className="card-header flex flex-col gap-3 border-b border-slate-100 px-5 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-3 lg:pb-0.5">
              <div className="card-header-bar h-8 w-1.5 rounded bg-indigo-600" />
              <h2 className="text-xl font-black uppercase tracking-[0.06em] text-slate-800 sm:text-2xl">
                Fila de Espera Médica
              </h2>
            </div>
            <div className="w-full lg:w-[280px] lg:shrink-0">
              <RoomSelect
                value={room}
                onChange={handleRoomChange}
                options={consultorios}
                loading={consultoriosLoading}
                error={consultoriosError}
                onRetry={loadConsultorios}
                disabled={isCalling}
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
                      const overdue = isOverdue(patient, now);
                      const chegada = patient.chegadaAt ?? patient.classifiedAt;

                      return (
                        <tr key={patient.id} className={`border-b border-slate-100 ${overdue ? 'animate-pulse bg-orange-50/60' : ''}`}>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-lg font-black text-slate-600">
                              {chegada?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) ?? '--:--'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-md border border-slate-300 bg-white px-2 py-1 text-lg font-black uppercase text-slate-600">
                              {AttendanceTypeLabel[patient.attendanceType]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xl font-bold uppercase text-slate-800">{patient.fullName}</div>
                            {patient.triageNotes && <TriageNotesPreview notes={patient.triageNotes} />}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {patient.priority ? (
                                <PriorityBadge priority={patient.priority} />
                              ) : (
                                <span className="text-lg font-black uppercase text-slate-500">Não classificado</span>
                              )}
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
                                        disabled={!hasActiveRoom}
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
                                  {!hasActiveRoom && (
                                    <TooltipContent>
                                      <p>Selecione o consultório da próxima chamada</p>
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

      {/* Antes de chamar, fecha pelo X ou Esc. Depois de chamar, o X fica visível mas bloqueado até
          Finalizar ou Desistência: o paciente já saiu da fila e só existe neste modal. */}
      <Dialog open={consultationLocked} onOpenChange={(open) => { if (!open && !isActivePatientCalled && !isCalling) closeCallModal(); }}>
        {/* Largo e com o conteúdo lado a lado para caber na tela sem rolagem (como o modal da triagem). */}
        <DialogContent
          closeDisabled={isActivePatientCalled || isCalling}
          closeDisabledReason={
            isCalling
              ? 'Aguarde a chamada terminar.'
              : 'O paciente já foi chamado. Finalize a consulta ou registre desistência para fechar.'
          }
          className="pb-0 sm:max-w-5xl"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <DialogHeader className="min-w-0 flex-1">
              <DialogTitle className="text-3xl font-bold">Chamar Paciente</DialogTitle>
              <DialogDescription className="text-lg">Revise as informações antes de chamar o paciente</DialogDescription>
            </DialogHeader>

            {/* Timer — aparece após chamar */}
            {calledAt && calledPatientIds.has(activePatient?.id) && (
              <div className="w-full sm:w-[470px] sm:shrink-0">
                <CalledPatientTimer calledAt={calledAt} />
              </div>
            )}
          </div>

          {activePatient && (
            <div className={`grid gap-4 ${activePatient.triageNotes ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]' : ''}`}>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="text-2xl font-bold [overflow-wrap:anywhere]">{activePatient.fullName}</div>

                <div className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
                  <div>
                    <span className="text-base text-slate-500">Prioridade</span>
                    <div className="mt-2">
                      <PriorityBadge priority={activePatient.priority} size="lg" />
                    </div>
                  </div>
                  <div>
                    <span className="text-base text-slate-500">Tipo</span>
                    <p className="mt-2 text-xl font-semibold">{AttendanceTypeLabel[activePatient.attendanceType]}</p>
                  </div>
                </div>
              </div>

              {/* Mostra 3 linhas inteiras; o restante rola dentro da caixa. */}
              {activePatient.triageNotes && (
                <div className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <span className="text-base font-bold uppercase tracking-[0.1em] text-slate-400">Observações:</span>
                  <div className="mt-2 max-h-[84px] overflow-y-auto whitespace-pre-wrap rounded border border-slate-200 bg-white p-3 text-base leading-6 italic [overflow-wrap:anywhere]">
                    {activePatient.triageNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          {activePatient && (
            <SuicidalBehaviorField value={suicidalBehavior} onChange={setSuicidalBehavior} />
          )}

          {activePatient && isActivePatientCalled ? (
            // Já chamado: o backend rechama para o consultório original, então
            // mostramos esse consultório (somente leitura) em vez do seletor.
            <div
              className="rounded-xl border-2 border-indigo-300 bg-indigo-50/70 p-4"
              data-testid="called-room-info"
            >
              <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-600">Consultório da chamada</p>
              <p className="mt-1 text-lg font-black text-indigo-900">
                {roomLabelById(calledRoomByPatient[activePatient.id]) || 'Consultório da chamada original'}
              </p>
              <p className="mt-1 text-sm text-slate-700">O rechamado usa o consultório original desta chamada.</p>
            </div>
          ) : (
            <RoomSelect
              value={room}
              onChange={handleRoomChange}
              options={consultorios}
              loading={consultoriosLoading}
              error={consultoriosError}
              onRetry={loadConsultorios}
              disabled={isCalling}
            />
          )}

          {/* Rodapé fixo: se alguma tela ainda precisar rolar, os botões continuam à vista. */}
          <div className="sticky bottom-0 -mx-6 flex flex-col gap-3 border-t border-slate-200 bg-background px-6 py-4 sm:flex-row sm:flex-wrap sm:gap-4">
            {activePatient && isActivePatientCalled ? (
              <Button size="lg" className="h-auto min-h-14 whitespace-normal px-8 text-lg" onClick={handleRecallPatient} disabled={!activePatient || isCalling} variant="secondary">
                {isCalling && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />}
                Chamar novamente
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-auto min-h-14 whitespace-normal px-8 text-lg bg-indigo-600 hover:bg-indigo-700"
                onClick={handleConfirmCallPatient}
                disabled={!hasActiveRoom || isCalling}
              >
                {isCalling && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />}
                {isCalling
                  ? 'Chamando…'
                  : hasActiveRoom
                    ? `Chamar para o ${formatConsultorioLabel(activeConsultorio)}`
                    : 'Selecione um consultório'}
              </Button>
            )}

            <Button
              size="lg"
              className="h-auto min-h-14 whitespace-normal px-8 text-lg bg-red-600 hover:bg-red-700"
              onClick={() => {
                setPatientToAbandon(activePatient);
                setConfirmAbandonOpen(true);
              }}
            >
              Encerrar (Desistência)
            </Button>
            <Button
              size="lg"
              className="h-auto min-h-14 whitespace-normal px-8 text-lg bg-green-600 hover:bg-green-700"
              disabled={!suicidalBehavior}
              onClick={() => {
                setPatientToFinish(activePatient);
                setConfirmFinishOpen(true);
              }}
            >
              Finalizar Consulta
            </Button>
          </div>
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
              {suicidalBehavior && (
                <p><strong>Ideação ou tentativa de suicídio:</strong> {SuicidalBehaviorLabel[suicidalBehavior]}</p>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button size="lg" className="h-auto min-h-14 whitespace-normal px-8 text-lg" variant="outline" onClick={() => setConfirmFinishOpen(false)}>
              Não
            </Button>
            <Button
              size="lg"
              className="h-auto min-h-14 whitespace-normal px-8 text-lg bg-green-600 hover:bg-green-700"
              onClick={async () => {
                if (!suicidalBehavior) return;
                await handleFinishConsultation(patientToFinish.id, suicidalBehavior);
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

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button size="lg" className="h-auto min-h-14 whitespace-normal px-8 text-lg" variant="outline" onClick={() => setConfirmAbandonOpen(false)}>
              Não
            </Button>
            <Button
              size="lg"
              className="h-auto min-h-14 whitespace-normal px-8 text-lg bg-red-600 hover:bg-red-700"
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