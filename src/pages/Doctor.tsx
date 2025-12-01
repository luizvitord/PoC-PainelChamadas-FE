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

// 👉 ADIÇÃO
import { PRIORITY_CONFIG } from "@/types/patient";

export default function Doctor() {
  const { getWaitingForDoctor, callForDoctor, completeConsultation, refreshPatients } = usePatients();
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [room, setRoom] = useState('');
  const [consultorios, setConsultorios] = useState([]);

  // 👉 ADIÇÃO: estados do pop-up de triagem
  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [triagePatient, setTriagePatient] = useState<any | null>(null);

  const waitingPatients = getWaitingForDoctor();
  const selectedPatient = waitingPatients.find(p => p.id === selectedPatientId);

  const handleCall = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPatients();
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshPatients]);

  useEffect(() => {
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
        toast({ title: 'Patient Called' });
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
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitingPatients.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No patients waiting for consultation</p>
              ) : (
                waitingPatients.map((patient) => (

                  // 👉 ADICIONADO: onClick para abrir modal de triagem
                  <Card
                    key={patient.id}
                    className="border-l-4 cursor-pointer"
                    style={{
                      borderLeftColor: `hsl(var(--priority-${patient.priority}))`
                    }}
                    onClick={() => {
                      setTriagePatient(patient);
                      setTriageModalOpen(true);
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
                              Type: {patient.attendanceType === 'clinical' ? 'Clínico' : 'Psiquiátrico'} •
                            </p>

                            {patient.triageNotes && (
                              <p className="text-sm text-foreground mt-2 p-2 bg-muted rounded">
                                <strong>Notes:</strong> {patient.triageNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {patient.status === 'waiting-doctor' && (
                            <Button onClick={(e) => { 
                              e.stopPropagation(); 
                              handleCall(patient.id); 
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

        {/*  👉 MODAL DE INFORMAÇÕES DA TRIAGEM  */}
        <Dialog open={triageModalOpen} onOpenChange={setTriageModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Triage Information</DialogTitle>
              <DialogDescription>
                Details for <strong>{triagePatient?.fullName}</strong>
              </DialogDescription>
            </DialogHeader>

            {triagePatient && (
              <div className="space-y-3">

                {/* PRIORIDADE IGUAL À TRIAGEM */}
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={triagePatient.priority} />
                  <span>
                    {PRIORITY_CONFIG[triagePatient.priority].label}
                    {" "}
                    ({PRIORITY_CONFIG[triagePatient.priority].waitTime})
                  </span>
                </div>

                <p>
                  <strong>Type:</strong>{" "}
                  {triagePatient.attendanceType === "clinical" ? "Clínico" : "Psiquiátrico"}
                </p>

                {triagePatient.triageNotes && (
                  <p className="p-2 bg-muted rounded">
                    <strong>Notes:</strong> {triagePatient.triageNotes}
                  </p>
                )}

                {/* ❌ REMOVIDO: DATA DE NASCIMENTO */}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setTriageModalOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL ORIGINAL (Call Patient) */}
        <Dialog open={!!selectedPatientId} onOpenChange={(open) => !open && setSelectedPatientId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Call Patient</DialogTitle>
              <DialogDescription>
                Assign consultation room for {selectedPatient?.fullName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <RoomSelect value={room} onChange={setRoom} options={consultorios} label="Consultation Room" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPatientId(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmCall} disabled={!room}>
                Call to Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
