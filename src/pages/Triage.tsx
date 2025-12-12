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
  const { getWaitingForTriage, callForTriage, assignPriority, refreshPatients } = usePatients();
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<'clinical' | 'psychiatric' | 'samu'>('psychiatric');
  const [priority, setPriority] = useState<PriorityLevel>('green');
  const [notes, setNotes] = useState('');
  const availableColors = getAvailablePriorities(attendanceType);

  const waitingPatients = getWaitingForTriage();
  const selectedPatient = waitingPatients.find(p => p.id === selectedPatientId);

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
        title: 'Patient Called',
        description: 'Patient has been called to triage',
    }); 
    } catch(error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to call patient." });
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
          <h1 className="text-3xl font-bold text-foreground">Acolhimento e Classificação de Risco</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aguardando Acolhimento</CardTitle>
            <CardDescription>
              {waitingPatients.length} patient{waitingPatients.length !== 1 ? 's' : ''} in queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitingPatients.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum paciente aguardando Acolhimento</p>
              ) : (
                waitingPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-primary">{patient.ticketNumber}</span>
                        <div>
                          <p className="font-semibold text-foreground">{patient.fullName}</p>
                          {/* <p className="text-sm text-muted-foreground">
                            Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} • 
                          </p> */}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => handleCall(patient.id)}>
                      <Phone className="mr-2 h-4 w-4" />
                      Chamar para Acolhimento
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedPatientId} onOpenChange={(open) => !open && handleCancel()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Acolhida e Classificação de Risco</DialogTitle>
              <DialogDescription>
                Definir a classificação de risco de {selectedPatient?.fullName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>Categoria de Atendimento</Label>
                <RadioGroup value={attendanceType} onValueChange={(value) => {
                 setAttendanceType(value as 'clinical' | 'psychiatric' | 'samu');
                  // Reset priority to first available when switching types
                  if (value === 'clinical') setPriority('red');
                  else if (value === 'psychiatric') setPriority('green');
                  else if (value === 'samu') setPriority('orange'); // ou o que desejar
                }}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="psychiatric" id="psychiatric" />
                    <Label htmlFor="psychiatric" className="font-normal cursor-pointer">
                      Psiquiátrico (Psychiatric)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="clinical" id="clinical" />
                    <Label htmlFor="clinical" className="font-normal cursor-pointer">
                      Clínico (Clinical)
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

                    {/* manter o (Manchester Protocol)?? */}
              <div className="space-y-2">
                <Label>Grau de Prioridade (Manchester Protocol)</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as PriorityLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((level) => {
                      const config = PRIORITY_CONFIG[level];
                      return (
                        <SelectItem key={level} value={level}>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={level} showLabel={false} />
                            <span>{config.label} ({config.waitTime})</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {attendanceType === 'clinical' 
                    ? 'Clinical cases: Only Red and Orange priorities available'
                    : 'Psychiatric cases: All priority levels available'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Anotações Clínicas</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter triage assessment notes..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmTriage}>
                Confirmar Classificação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
