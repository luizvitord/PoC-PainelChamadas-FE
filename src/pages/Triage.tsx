import { useEffect, useState } from 'react';
import { usePatients } from '@/contexts/PatientContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Phone } from 'lucide-react';
import { PriorityLevel, PRIORITY_CONFIG } from '@/types/patient';
import { useToast } from '@/hooks/use-toast';
import { getAvailablePriorities } from '@/lib/priorityRules';
import { AttendanceTypeLabel } from '@/lib/attendanceTypes';

export default function Triage() {
  const { getWaitingForDoctor, getWaitingForTriage, callForTriage, assignPriority, refreshPatients } = usePatients();
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<'clinical' | 'psychiatric' | 'samu'>('psychiatric');
  const [priority, setPriority] = useState<PriorityLevel>('green');
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
            title: 'Triage Complete',
            description: `Paciente classificado como ${PRIORITY_CONFIG[priority].label} (${AttendanceTypeLabel[attendanceType]})`,
          });

        await setSelectedPatientId(null);
        await setAttendanceType('psychiatric'); // Reseta o formulário
        await setPriority('red');
        setNotes('');
    }
    } catch(error){
        toast({ variant: "destructive", title: "Error", description: "Failed to classify patient." });
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
    setNotes('');
    await refreshPatients(); 
  };


return (
  <div className="container mx-auto flex-grow px-6 py-10">
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center space-x-3 border-b border-gray-100 bg-white p-8">
            <div className="h-8 w-2 rounded-full bg-blue-600"></div>
            <h2 className="text-base font-black uppercase tracking-widest text-gray-800">Pacientes em Espera</h2>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-8 py-5 text-sm font-black uppercase tracking-wider text-gray-600">Chegada</th>
                    <th className="px-8 py-5 text-sm font-black uppercase tracking-wider text-gray-600">Paciente</th>
                    <th className="px-8 py-5 text-sm font-black uppercase tracking-wider text-gray-600">Documento</th>
                    <th className="px-8 py-5 text-center text-sm font-black uppercase tracking-wider text-gray-600">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {waitingPatients.length === 0 ? (
                    <tr>
                      <td className="px-8 py-12 text-center text-sm font-black uppercase tracking-widest text-gray-300" colSpan={4}>
                        Nenhum paciente na lista
                      </td>
                    </tr>
                  ) : (
                    waitingPatients.map((patient) => (
                      <tr key={patient.id} className="transition-colors hover:bg-green-50/30">
                        <td className="whitespace-nowrap px-8 py-6">
                          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-black uppercase italic text-blue-700">
                            {new Date(patient.registeredAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-base font-bold uppercase text-gray-800">{patient.fullName}</td>
                        <td className="px-8 py-6 text-sm italic text-gray-700">{patient.cpf || 'Não informado'}</td>
                        <td className="px-8 py-6 text-center">
                          <Button
                            onClick={() => handleCall(patient.id)}
                            className="mx-auto flex items-center space-x-2 rounded-lg bg-[#008140] px-6 py-3 text-sm font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-green-700"
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

      <div className="space-y-6">
        <Card className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-5">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-2 rounded-full bg-[#ffcc00]"></div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">Atendimentos Recentes</h2>
            </div>
          </div>
          <CardContent className="max-h-[400px] divide-y divide-gray-50 overflow-y-auto p-0">
            {waitingPatientsForDoctor.length > 0 ? (
              waitingPatientsForDoctor.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleRetriage(patient.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-base font-bold uppercase leading-tight text-gray-700">{patient.fullName}</p>
                    <p className="mt-1 text-sm font-medium italic text-gray-500">{patient.cpf || 'Não informado'}</p>
                  </div>
                  <PriorityBadge priority={patient.priority} showLabel={false} />
                </button>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-black uppercase tracking-widest text-gray-300">Nenhum atendimento na lista</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

      <Dialog open={!!selectedPatientId} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isRetriage ? "Reclassificação de Risco" : "Acolhimento e Classificação de Risco"}</DialogTitle>
            <DialogDescription>
              Definir a classificação de risco de{" "}
              <span className="font-bold">
                {selectedPatient?.fullName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Categoria de Atendimento</Label>

              <RadioGroup
                value={attendanceType}
                onValueChange={(value) => {
                  setAttendanceType(value as "clinical" | "psychiatric" | "samu")

                  if (value === "clinical") setPriority("red")
                  else if (value === "psychiatric") setPriority("green")
                  else if (value === "samu") setPriority("orange")
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="psychiatric" id="psychiatric" />
                  <Label htmlFor="psychiatric" className="font-normal cursor-pointer">
                    Psiquiátrico
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="clinical" id="clinical" />
                  <Label htmlFor="clinical" className="font-normal cursor-pointer">
                    Clínico
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="samu" id="samu" />
                  <Label htmlFor="samu" className="font-normal cursor-pointer">
                    SAMU (Serviço de Atendimento Móvel de Urgência)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Grau de Prioridade (Protocolo de Manchester)</Label>

              <Select value={priority} onValueChange={(value) => setPriority(value as PriorityLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {availableColors.map((level) => {
                    const config = PRIORITY_CONFIG[level]

                    return (
                      <SelectItem key={level} value={level}>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={level} showLabel={false} />
                          <span>
                            {config.label} ({config.waitTime})
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Anotações Clínicas</Label>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Digite as observações do paciente para auxiliar o médico no atendimento..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>

            <Button onClick={handleConfirmTriage}>
               {isRetriage ? "Confirmar reclassificação" : "Confirmar Classificação"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  </div>
);
}
