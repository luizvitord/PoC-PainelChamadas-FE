import { useEffect, useState } from 'react';
import { usePatients } from '@/contexts/PatientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Activity, Phone, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RoomSelect from '@/components/RoomSelect';
import { set } from 'date-fns';
import { AttendanceTypeLabel } from '@/lib/attendanceTypes';

import { PRIORITY_CONFIG } from "@/types/patient";

export default function Doctor() {
  const { getWaitingForDoctor, callForDoctor, completeConsultation, refreshPatients, recallPatient } = usePatients();
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [room, setRoom] = useState('');
  const [consultorios, setConsultorios] = useState<any[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string>('');
  const [consultationLocked, setConsultationLocked] = useState(false);
  const [activePatient, setActivePatient] = useState<any | null>(null);
  console.log(room)

  const waitingPatients = getWaitingForDoctor();


  // O paciente selecionado para ser CHAMADO
  // const activePatient = waitingPatients.find(p => p.id === selectedPatientId);
    console.log(activePatient)

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
      toast({ variant: "destructive", title: "Error", description: "Failed to call patient." });
    }
  };

const handleRecallPatient = async () => {
  if (!activePatient) return;

  try {
    await recallPatient(activePatient.id);

    toast({
      title: 'Paciente chamado novamente',
      description: `${activePatient.fullName} foi chamado novamente`,
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

  const handleConfirmCall = async () => {
    if (selectedPatientId && room) {
      try {
        await callForDoctor(selectedPatientId, room);
        toast({ title: 'Patient Called', description: `Calling to Room ${room}` });
        setSelectedPatientId(null);
        setRoom('');
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to call patient." });
      }
    }
  };

  const handleComplete = async (patientId: string) =>{
    try{
        await completeConsultation(patientId);
        toast({
          title: 'Consultation Complete',
          description: 'Patient consultation has been completed',
        });
      } catch(error){
          toast({ variant: "destructive", title: "Error", description: "Failed to complete consultation." });
    }    
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Doctor's Dashboard</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Queue</CardTitle>
            <CardDescription>
              Sorted by priority level (Manchester Protocol)
            </CardDescription>
                        <div className="space-y-4 py-2">
              <RoomSelect 
                value={room} 
                onChange={setRoom} 
                options={consultorios} 
                label="Select Consultation Room" 
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitingPatients.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No patients waiting for consultation</p>
              ) : (
                waitingPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className="border-l-4"
                    style={{
                      borderLeftColor: `hsl(var(--priority-${patient.priority}))`
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-3xl font-bold text-primary">{patient.ticketNumber}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-lg text-foreground">{patient.fullName}</p>
                              {patient.priority && <PriorityBadge priority={patient.priority} />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Tipo: {AttendanceTypeLabel[patient.attendanceType]}
                            </p>
                            {patient.triageNotes && (
                                <p className="text-sm text-foreground font-semibold mt-1 line-clamp-1">
                                    Observações : {patient.triageNotes}
                                </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {patient.status === 'waiting-doctor' && (
                            <Button onClick={(e) => { 
                              e.stopPropagation(); 
                              handleCallPatient(patient);
                            }}>
                              <Phone className="mr-2 h-4 w-4" />
                              Call Patient
                            </Button>
                          )}
                          {patient.status === 'in-consultation' && (
                            <Button onClick={(e) => { 
                              e.stopPropagation();
                              handleComplete(patient.id); 
                            }} variant="outline">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Finish Consultation
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* MODAL: CHAMAR PACIENTE (Único modal ativo agora) */}
          <Dialog open={consultationLocked} onOpenChange={() => {}}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Call Patient</DialogTitle>
                        <DialogDescription>
                          Review triage info before calling.
                        </DialogDescription>
                      </DialogHeader>

                      {activePatient && (
                          <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-3 mb-2">
                              <div className="flex items-start justify-between">
                                  <div>
                                      <h4 className="font-bold text-lg">{activePatient.fullName}</h4>
                                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Dados do Paciente</span>
                                  </div>
                                  <span className="text-2xl font-bold text-primary">{activePatient.ticketNumber}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex flex-col">
                                      <span className="text-muted-foreground text-xs">Prioridade</span>
                                      <div className="flex items-center gap-2 mt-1">
                                          <PriorityBadge priority={activePatient.priority} showLabel={false} />
                                          <span>{PRIORITY_CONFIG[activePatient.priority]?.label}</span>
                                      </div>
                                  </div>
                                  <div className="flex flex-col">
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

                      <div className="flex justify-end gap-2 mt-2">
                        {/* <Button variant="outline" onClick={() => setSelectedPatientId(null)}>
                          Cancel
                        </Button> */}
                        <Button onClick={handleConfirmCall} disabled={!room}>
                          Call to Room
                        </Button>
                        <Button
                            onClick={async () => {
                              await callForDoctor(activePatient.id, room);
                            }}
                          >
                            Chamar paciente novamente
                          </Button>
                        <Button className="bg-red-600 hover:bg-red-700">
                          Encerrar consulta (Desistência)
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

      </div>
    </div>
  );
}