import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { usePatients } from '@/contexts/PatientContext';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTypeLabel } from '@/lib/attendanceTypes';
import { getAvailablePriorities } from '@/lib/priorityRules';
import { PRIORITY_CONFIG, PriorityLevel } from '@/types/patient';
import { Check, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Triage() {
  const { getWaitingForDoctor, getWaitingForTriage, callForTriage, assignPriority, refreshPatients } = usePatients();
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<'clinical' | 'psychiatric' | 'samu'>('psychiatric');
  const [priority, setPriority] = useState<PriorityLevel>('green');
  const [isManchesterOpen, setIsManchesterOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const availableColors = getAvailablePriorities(attendanceType);
  const waitingPatientsForDoctor = getWaitingForDoctor();
  const waitingPatients = getWaitingForTriage();

  const selectedPatient =
    waitingPatients.find(p => p.id === selectedPatientId) ||
    waitingPatientsForDoctor.find(p => p.id === selectedPatientId);

  const isRetriage = !!selectedPatient?.priority;
  
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPatients();
    }, 3000);
  
    return () => clearInterval(interval);
  }, [refreshPatients]);

  const handleCall = async (patientId: string) => {
    try {
      await callForTriage(patientId);
      await setSelectedPatientId(patientId);
      toast({
        title: 'Paciente Chamado',
        description: 'Paciente chamado para acolhimento.',
    }); 
    } catch(error) {
        toast({ variant: "destructive", title: "Error", description: "Falha ao chamar paciente." });
    }
  };

  const handleConfirmTriage = async () => {
    try {
      if (selectedPatientId) {
        await assignPriority(selectedPatientId, priority, attendanceType, notes);

          toast({
            title: 'Triagem Concluída',
            description: `Paciente classificado como ${PRIORITY_CONFIG[priority].label} (${AttendanceTypeLabel[attendanceType]})`,
          });

        await setSelectedPatientId(null);
        await setAttendanceType('psychiatric'); // Reseta o formulário
        await setPriority('red');
        setNotes('');
    }
    } catch(error){
      toast({ variant: "destructive", title: "Erro", description: "Falha ao classificar o paciente." });
    }
  };

  const handleRetriage = async (patientId: string) => {
    const patient = waitingPatientsForDoctor.find(p => p.id === patientId);

    if (!patient) return;

    setSelectedPatientId(patientId);

    // preencher modal com dados atuais
    if (patient.attendanceType) {
      setAttendanceType(patient.attendanceType);
    }

    if (patient.priority) {
      setPriority(patient.priority);
    }

    if (patient.triageNotes) {
      setNotes(patient.triageNotes);
    }
  };

  const handleCancel = async () => {
    setSelectedPatientId(null); 
    setAttendanceType('psychiatric'); // Reseta o formulário
    setPriority('green');
    setIsManchesterOpen(false);
    setNotes('');
    await refreshPatients(); 
  };

  const priorityPillLabel: Record<PriorityLevel, string> = {
    red: 'VERMELHO',
    orange: 'LARANJA',
    yellow: 'AMARELO',
    green: 'VERDE',
    blue: 'AZUL',
  };

  const priorityPillClass: Record<PriorityLevel, string> = {
    red: 'bg-[#ff0000] text-white',
    orange: 'bg-[#f57c00] text-white',
    yellow: 'bg-[#e6b800] text-white',
    green: 'bg-[#00b35a] text-white',
    blue: 'bg-[#4f73df] text-white',
  };


return (
  <div className="min-h-screen bg-[#f8fafc]">
    <Header title="Acolhimento e Classificação de Risco" />
    <div className="mx-auto w-full max-w-screen-2xl px-3 pt-6">
      <BackButton />
    </div>

    <div className="mx-auto w-full max-w-screen-2xl px-3 py-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center space-x-3 border-b border-gray-100 bg-gray-50 p-7">
              <div className="h-7 w-2 rounded-full bg-[#3182ce]"></div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-gray-800">Pacientes em Espera</h2>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-8 py-5 text-lg font-black uppercase tracking-wider text-gray-600">Chegada</th>
                      <th className="px-8 py-5 text-lg font-black uppercase tracking-wider text-gray-600">Paciente</th>
                      <th className="px-8 py-5 text-lg font-black uppercase tracking-wider text-gray-600">Documento</th>
                      <th className="px-8 py-5 text-center text-base font-black uppercase tracking-wider text-gray-600">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {waitingPatients.length === 0 ? (
                      <tr>
                        <td className="px-8 py-12 text-center text-base font-black uppercase tracking-[0.15em] text-gray-300" colSpan={4}>
                          Nenhum paciente na lista
                        </td>
                      </tr>
                    ) : (
                      waitingPatients.map((patient) => (
                        <tr key={patient.id}>
                          <td className="whitespace-nowrap px-8 py-6">
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-base font-black italic uppercase text-blue-700">
                              {new Date(patient.registeredAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-xl font-bold uppercase text-gray-800">{patient.fullName}</td>
                          <td className="px-8 py-6 text-lg italic text-gray-600">{patient.cpf || 'Não informado'}</td>
                          <td className="px-8 py-6 text-center">
                            <Button
                              onClick={() => handleCall(patient.id)}
                              className="mx-auto flex items-center space-x-2 rounded-lg bg-[#008140] px-6 py-4 text-xl font-black uppercase tracking-wider text-white transition-all hover:bg-green-700"
                            >
                              <Phone className="h-4 w-4" />
                              <span>Chamar Paciente</span>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center space-x-3 border-b border-gray-100 bg-gray-50 p-7">
              <div className="h-7 w-2 rounded-full bg-[#ffcc00]"></div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-gray-800">Atendimentos Recentes</h2>
            </div>
            <CardContent className="sidebar-list max-h-[420px] flex-grow divide-y divide-gray-100 overflow-y-auto p-0">
              {waitingPatientsForDoctor.length > 0 ? (
                waitingPatientsForDoctor.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handleRetriage(patient.id)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-xl font-bold uppercase leading-tight text-gray-700">{patient.fullName}</p>
                      <p className="mt-1 text-lg font-medium italic text-gray-500">{patient.cpf || 'CPF não informado'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={patient.priority} showLabel={false} />
                      <span className="text-xs italic text-gray-400">Reclassificar</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-sm font-black uppercase tracking-[0.15em] text-gray-300">
                  Nenhum atendimento na lista
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

      <Dialog open={!!selectedPatientId} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-h-[90vh] w-full overflow-x-hidden overflow-y-auto rounded-[14px] border border-[#dbe1ea] bg-[#f8fafc] p-0 shadow-[0_32px_100px_rgba(0,0,0,0.45)] sm:max-w-3xl [&>button]:right-5 [&>button]:top-5 [&>button]:flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-[10px] [&>button]:border [&>button]:border-[#e2e8f0] [&>button]:bg-[#e9edf2] [&>button]:p-0 [&>button]:text-gray-500 [&>button]:opacity-100 [&>button:hover]:bg-[#dfe5ec] [&>button>svg]:h-5 [&>button>svg]:w-5">
          <DialogHeader className="space-y-0 px-8 pb-0 pt-8 text-left">
            <DialogTitle className="pr-14 text-3xl font-black uppercase tracking-[0.04em]">
              {isRetriage ? "Reclassificação de Risco" : "Acolhimento e Classificação de Risco"}
            </DialogTitle>
            <div className="mt-2 text-lg font-medium text-gray-500">
              Definir a classificação de risco de{" "}
              <span className="font-bold text-gray-700">
                {selectedPatient?.fullName}
              </span>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-6 px-8 py-6">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-black uppercase tracking-[0.15em] text-gray-500">
                Categoria de Atendimento
              </Label>

              <RadioGroup
                value={attendanceType}
                onValueChange={(value) => {
                  setAttendanceType(value as "clinical" | "psychiatric" | "samu")

                  if (value === "clinical") setPriority("red")
                  else if (value === "psychiatric") setPriority("green")
                  else if (value === "samu") setPriority("orange")
                }}
                className="flex flex-col gap-3"
              >
                <div className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 px-5 py-4 transition-all ${attendanceType === 'psychiatric' ? 'border-[#008140] bg-[#f0fff4]' : 'border-gray-200 hover:border-[#008140] hover:bg-[#f0fff4]'}`}>
                  <RadioGroupItem className="h-5 w-5" value="psychiatric" id="psychiatric" />
                  <Label htmlFor="psychiatric" className="cursor-pointer text-lg font-bold">
                    Psiquiátrico
                  </Label>
                </div>

                <div className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 px-5 py-4 transition-all ${attendanceType === 'clinical' ? 'border-[#008140] bg-[#f0fff4]' : 'border-gray-200 hover:border-[#008140] hover:bg-[#f0fff4]'}`}>
                  <RadioGroupItem className="h-5 w-5" value="clinical" id="clinical" />
                  <Label htmlFor="clinical" className="cursor-pointer text-lg font-bold">
                    Clínico
                  </Label>
                </div>

                <div className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 px-5 py-4 transition-all ${attendanceType === 'samu' ? 'border-[#008140] bg-[#f0fff4]' : 'border-gray-200 hover:border-[#008140] hover:bg-[#f0fff4]'}`}>
                  <RadioGroupItem className="h-5 w-5" value="samu" id="samu" />
                  <Label htmlFor="samu" className="cursor-pointer text-lg font-bold">
                    SAMU (Serviço de Atendimento Móvel de Urgência)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-black uppercase tracking-[0.15em] text-gray-500">
                Grau de Prioridade (Protocolo de Manchester)
              </Label>

              <div className="rounded-[12px] border border-[#22a35d] bg-[#f8fafc] shadow-[0_0_0_4px_rgba(0,129,64,0.12)]">
                <button
                  type="button"
                  onClick={() => setIsManchesterOpen((prev) => !prev)}
                  className={`flex w-full items-center justify-between px-5 py-4 text-left ${isManchesterOpen ? 'border-b border-[#22a35d]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-4 py-1.5 text-lg font-black uppercase leading-none tracking-wide ${priorityPillClass[priority]}`}>
                      {priorityPillLabel[priority]}
                    </span>
                    <span className="text-xl font-bold leading-tight text-[#1f2a44]">
                      {PRIORITY_CONFIG[priority].label} ({PRIORITY_CONFIG[priority].waitTime})
                    </span>
                  </div>
                  {isManchesterOpen ? (
                    <ChevronUp className="h-6 w-6 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-500" />
                  )}
                </button>

                {isManchesterOpen && (
                  <div className="overflow-hidden rounded-b-[11px] bg-white">
                    {availableColors.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          setPriority(level);
                          setIsManchesterOpen(false);
                        }}
                        className={`flex w-full items-center gap-4 border-b border-[#e2e8f0] px-5 py-5 text-left last:border-b-0 ${
                          priority === level ? 'bg-[#e8eef8]' : 'bg-white hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className="flex w-7 justify-center text-[#4f73df]">
                          {priority === level ? <Check className="h-6 w-6" /> : null}
                        </div>
                        <span className={`inline-flex min-w-[120px] items-center justify-center rounded-full px-4 py-1.5 text-base font-black uppercase leading-none tracking-wide ${priorityPillClass[level]}`}>
                          {priorityPillLabel[level]}
                        </span>
                        <span className="text-xl font-bold leading-tight text-[#1f2a44]">
                          {PRIORITY_CONFIG[level].label} ({PRIORITY_CONFIG[level].waitTime})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-black uppercase tracking-[0.15em] text-gray-500">
                Anotações Clínicas
              </Label>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Digite as observações do paciente para auxiliar o médico no atendimento..."
                rows={4}
                className="min-h-[110px] rounded-[10px] border-[1.5px] border-gray-200 bg-gray-50 px-5 py-4 text-lg font-medium text-gray-800 focus:border-[#008140] focus:bg-white focus:ring-4 focus:ring-[rgba(0,129,64,0.12)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-8 pb-8">
            <Button
              size="lg"
              variant="outline"
              onClick={handleCancel}
              className="h-14 rounded-xl border-2 border-gray-200 bg-white px-8 text-lg font-black uppercase tracking-[0.08em] text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </Button>

            <Button
              size="lg"
              onClick={handleConfirmTriage}
              className="h-14 rounded-xl bg-[#008140] px-8 text-lg font-black uppercase tracking-[0.08em] text-white hover:bg-[#006f36]"
            >
               {isRetriage ? "Confirmar reclassificação" : "Confirmar Classificação"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  </div>
);
}
