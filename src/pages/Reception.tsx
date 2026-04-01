import { useState } from 'react';
import { usePatients } from '@/contexts/PatientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/Api';
import { debug } from 'console';

export default function Reception() {
  const { registerPatient, patients } = usePatients();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    cpf: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    try{
      await e.preventDefault();
      const patient = await registerPatient(formData);
      
      toast({
        title: 'Paciente Registrado',
        description: `Ticket ${patient.ticketNumber} emitido para ${patient.fullName}`,
      });
      
      await setFormData({ fullName: '', dateOfBirth: '', cpf: '' }); 
      } catch(error) {
          toast({ variant: "destructive", title: "Error", description: "Falha ao registrar paciente." });

      }
  };

  const handleCreatePaciente = async (e: React.FormEvent) => {
    e.preventDefault();

    const { fullName, dateOfBirth, cpf } = formData;

      try {
      const newPacient = await api.paciente.create({
        fullName: '',
        dateOfBirth: '',
        cpf: '',
      });

      toast({
        title: 'Patient Registered',
      });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Falha ao registrar paciente." });
    }
  };

  const recentPatients = patients.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Recepção - Cadastro de Paciente</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Novo Check-in de Paciente</CardTitle>
              <CardDescription>Insira informações do paciente para gerar um ticket</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Digite o nome completo do paciente"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar Entrada
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Registrados Recentemente
              </CardTitle>
              <CardDescription>Últimos pacientes registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPatients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum paciente registrado ainda</p>
                ) : (
                  recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{patient.fullName}</p>
                        <p className="text-sm text-muted-foreground">CPF: {patient.cpf}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">{patient.ticketNumber}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
