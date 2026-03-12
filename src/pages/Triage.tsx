import { useEffect, useState } from 'react';
import { usePatients } from '@/contexts/PatientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Stethoscope, Phone } from 'lucide-react';
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
  <div className="min-h-screen bg-background p-6">
    <div className="max-w-7xl mx-auto space-y-6">

      <div className="flex items-center gap-3">
        <Stethoscope className="h-8 w-8 text-primary" />
        <span className="text-3xl font-bold text-foreground">
          Acolhimento e Classificação de Risco
        </span>
      </div>

      <div className="grid md:grid-cols-[55%_40%] gap-6">

        {/* CARD 1 - AGUARDANDO ACOLHIMENTO */}
        <Card>
          <CardHeader>
            <CardTitle>Aguardando Acolhimento</CardTitle>
            <CardDescription>
              {waitingPatients.length} paciente{waitingPatients.length !== 1 ? "s" : ""} na fila
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {waitingPatients.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum paciente aguardando acolhimento
                </p>
              ) : (
                waitingPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">
                        {patient.ticketNumber}
                      </span>

                      <div>
                        <p className="font-semibold text-foreground">
                          {patient.fullName}
                        </p>
                      </div>
                    </div>

                    <Button onClick={() => handleCall(patient.id)}>
                      <Phone className="mr-2 h-4 w-4" />
                      Chamar
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* CARD 2 - AGUARDANDO MÉDICO / RETRIAGEM */}
        <Card>
          <CardHeader>
            <CardTitle>Aguardando Atendimento Médico</CardTitle>
            <CardDescription>
              Pacientes que podem precisar de reclassificação
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {waitingPatientsForDoctor.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum paciente aguardando atendimento
                </p>
              ) : (
                waitingPatientsForDoctor.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {patient.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        CPF: {patient.cpf ? patient.cpf : "Não informado"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Classificação: {patient.priority ? PRIORITY_CONFIG[patient.priority].label : "Não classificado"} {" "}
                         <PriorityBadge priority={patient.priority} showLabel={false} />
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary text-lg">
                        {patient.ticketNumber}
                      </span>

                      <Button
                        variant="default"
                        onClick={() => handleRetriage(patient.id)}
                      >
                        Reclassificação
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

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
  </div>
);
}
