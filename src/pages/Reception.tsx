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
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';

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
    <Header title="Recepção" />
    {/* Back button */}
    <div className="mx-auto w-full max-w-screen-2xl px-3 pt-6">
      <BackButton />
    </div>
      <main className="reception-main">
        <div className="reception-container">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Coluna cadastro */}
            <div className="lg:col-span-2">
              <Card className="border border-gray-100 bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 bg-[#008140] px-6 py-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                    <UserPlus className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-white text-2xl font-black uppercase tracking-[0.1em]">
                    Registrar Novo Paciente
                  </h2>
                </div>

                <CardContent className="p-8 md:p-12">
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Label
                          htmlFor="fullName"
                          className="mb-3 block text-lg font-black uppercase tracking-[0.1em] text-gray-500"
                        >
                          Nome Completo
                        </Label>
                        <Input
                          id="fullName"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Digite o nome do paciente..."
                          className="h-auto w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 text-xl font-medium text-gray-700 placeholder:text-gray-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-[#008140]/50"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="dateOfBirth"
                          className="mb-3 block text-lg font-black uppercase tracking-[0.1em] text-gray-500"
                        >
                          Data de Nascimento
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="h-auto w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 text-xl font-medium text-gray-700 focus:bg-white focus-visible:ring-2 focus-visible:ring-[#008140]/50"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="cpf"
                          className="mb-3 block text-lg font-black uppercase tracking-[0.1em] text-gray-500"
                        >
                          CPF
                        </Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className="h-auto w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 text-xl font-medium text-gray-700 placeholder:text-gray-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-[#008140]/50"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#008140] py-7 px-12 text-xl font-black uppercase tracking-[0.1em] text-white shadow-lg shadow-emerald-100 hover:bg-emerald-800"
                      >
                        <UserPlus className="h-6 w-6" />
                        <span>Finalizar Registro</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Coluna registros recentes */}
            <div className="lg:col-span-1">
              <Card className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 px-6 py-5">
                  <CardTitle className="flex items-center text-lg font-black uppercase tracking-[0.1em] text-gray-800">
                    <span className="mr-2 h-2.5 w-2.5 rounded-full bg-[#ffcc00]" />
                    Recém Registrados
                  </CardTitle>
                  <span className="text-xs font-bold uppercase text-gray-500">
                    Hoje
                  </span>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-between p-0">
                  <div className="custom-scrollbar flex-1 overflow-y-auto">
                    {recentPatients.length === 0 ? (
                      <p className="px-6 py-10 text-center text-base font-medium text-gray-500 ">
                        Nenhum paciente registrado ainda.
                      </p>
                    ) : (
                      recentPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between border-b border-gray-50 px-6 py-5 hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="text-lg font-bold leading-tight text-gray-700">
                              {patient.fullName}
                            </p>
                            <p className="mt-1 text-base font-medium text-gray-400">
                              {patient.cpf || 'CPF não informado'}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-gray-300">
                            {patient.ticketNumber}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 pb-4 pt-3">
                    <button
                      type="button"
                      className="w-full rounded-xl bg-gray-50 py-4 text-base font-black uppercase tracking-[0.1em] text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
                    >
                      Visualizar Todos
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
