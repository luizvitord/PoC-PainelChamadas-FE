import { useState } from 'react';
import { usePatients } from '@/contexts/PatientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, ClipboardList, ArrowLeft } from 'lucide-react';
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
    e.preventDefault(); 

    const cpfLimpo = formData.cpf.replace(/\D/g, '');

    if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
      toast({
        variant: "destructive",
        title: "CPF Inválido",
        description: "O CPF deve ter 11 dígitos ou ficar vazio.",
      });
      return; 
    }

    // Validação da Data de Nascimento
    if (formData.dateOfBirth) {
      const dataNascimento = new Date(formData.dateOfBirth);
      const hoje = new Date();

      if (dataNascimento > hoje) {
        toast({
          variant: "destructive",
          title: "Data Inválida",
          description: "A data de nascimento não pode ser no futuro.",
        });
        return; 
      }
    }

    try {
      const patient = await registerPatient(formData);

      toast({
        title: 'Paciente Registrado',
        description: `Ticket ${patient.ticketNumber} emitido para ${patient.fullName}`,
      });

      setFormData({ fullName: '', dateOfBirth: '', cpf: '' }); // Removemos o await aqui também
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao registrar paciente." });
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
    <div className="reception-shell">
      <header className="bg-emerald-800 border-b-4 border-yellow-400 text-white shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-1">
              <span className="h-6 w-6 rounded-sm border border-white/40 bg-white/90 text-xs font-black uppercase tracking-tight text-emerald-800 flex items-center justify-center">
                CE
              </span>
              <div className="leading-tight">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                  Governo do Estado do Ceará
                </p>
                <p className="text-[0.7rem] text-white/70">Secretaria da Saúde</p>
              </div>
            </div>
            <div className="hidden border-l border-white/20 pl-4 text-left md:block">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                Recepção
              </p>
              <p className="text-sm font-semibold text-white">Entrada de Pacientes</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-xs font-medium uppercase tracking-[0.16em] text-white hover:bg-white/10 md:inline-flex"
            onClick={() => window.history.back()}
            aria-label="Voltar para a tela anterior"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="reception-main">
        <div className="reception-container">
          

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)]">
            <Card className="border-0 bg-white/90 shadow-md shadow-emerald-900/5">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-lg font-semibold tracking-tight text-emerald-900 md:text-xl">
                  Dados do Paciente
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground md:text-sm">
                  Informe os dados essenciais do paciente para gerar o ticket de atendimento.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/80">
                        Nome completo
                      </Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Digite o nome sem abreviações"
                        className="h-11 border-emerald-900/15 bg-white text-sm placeholder:text-muted-foreground/80"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="dateOfBirth" className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/80">
                        Data de nascimento
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="h-11 border-emerald-900/15 bg-white text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cpf" className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/80">
                        Número do CPF
                      </Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="h-11 border-emerald-900/15 bg-white text-sm placeholder:text-muted-foreground/80"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-sm hover:bg-emerald-800"
                    >
                      Finalizar e encaminhar para triagem
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/95 shadow-md shadow-emerald-900/5">
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-emerald-900 md:text-lg">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <ClipboardList className="h-4 w-4" />
                      </span>
                      Atendimentos recentes
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground md:text-sm">
                      Pacientes cadastrados recentemente na recepção.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {recentPatients.length === 0 ? (
                    <p className="py-10 text-center text-xs text-muted-foreground md:text-sm">
                      Nenhum paciente registrado ainda.
                    </p>
                  ) : (
                    recentPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-emerald-900/8 bg-emerald-50/60 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-emerald-950">{patient.fullName}</p>
                          <p className="text-xs text-muted-foreground">CPF: {patient.cpf || 'Não informado'}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                            Senha
                          </span>
                          <p className="text-lg font-bold leading-none text-emerald-800">
                            {patient.ticketNumber}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
