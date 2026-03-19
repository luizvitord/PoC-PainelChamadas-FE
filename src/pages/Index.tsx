import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast, useToast } from '@/hooks/use-toast';
import { addConsultorio, getConsultorios } from '@/services/ConsultorioService';
import { get } from 'http';
import { DoorOpen, HeartHandshake, Monitor, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
    const { toast } = useToast();
    const [openAddConsultorio, setOpenAddConsultorio] = useState(false);
    const [consultorioNumero, setConsultorioNumero] = useState("");
    const [consultorios, setConsultorios] = useState<Array<{ id: string | number }>>([]);

  const handleAddConsultorio = async () => {
    const result = await addConsultorio(consultorioNumero);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso!",
      description: "Consultório adicionado com sucesso.",
    });

    setConsultorioNumero("");
    setOpenAddConsultorio(false);
  };

  const loadConsultorios = async () => {
    try {
        const data = await getConsultorios();
          if (data.error) {
        toast({
          title: "Erro ao carregar consultórios",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setConsultorios(data); // sucesso

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar consultórios.",
        variant: "destructive",
      });
      return;
    }
  };


  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <header className="bg-[#008140] text-white p-4 shadow-lg border-b-4 border-[#ffcc00]">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="bg-white p-2 rounded shadow-sm hover:opacity-90 transition-all"
              aria-label="Ir para a Home"
            >
              <svg width="140" height="42" viewBox="0 0 140 42" fill="none" aria-hidden="true">
                <text x="8" y="27" fill="#008140" fontWeight="900" fontSize="22">
                  CEARÁ
                </text>
                <text x="8" y="40" fill="#008140" fontWeight="bold" fontSize="10">
                  GOVERNO DO ESTADO
                </text>
                <rect x="0" y="0" width="4" height="42" fill="#ffcc00" />
              </svg>
            </Link>
            <div className="h-10 w-px bg-white/30" />
            <div>
              <h1 className="font-bold text-base md:text-lg uppercase tracking-tight leading-none">
                Sistema de Gestão Hospitalar
              </h1>
              <p className="text-xs md:text-sm opacity-90 uppercase font-semibold mt-1">
                Hospital de Saúde Mental Prof. Frota Pinto
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-6 flex-grow flex flex-col justify-center">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Painel de Controle</h2>
          <div className="h-1.5 w-24 bg-[#ffcc00] mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
          <Link to="/reception" className="block group">
            <Card className="rounded-2xl border-0 border-b-8 border-[#005a2b] bg-white shadow-sm p-8 flex flex-col items-center text-center outline-none transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-200 transition-transform group-hover:scale-110">
                <UserPlus className="h-11 w-11 text-[#005a2b]" />
              </div>
              <h3 className="text-lg font-black text-gray-800 uppercase mb-2">Recepção</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Registro de novos Pacientes</p>
            </Card>
          </Link>

          <Link to="/triage" className="block group">
            <Card className="rounded-2xl border-0 border-b-8 border-blue-600 bg-white shadow-sm p-8 flex flex-col items-center text-center outline-none transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 transition-transform group-hover:scale-110">
                <HeartHandshake className="h-11 w-11 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-gray-800 uppercase mb-2">Acolhimento</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Classificação de risco e priorização de atendimento.</p>
            </Card>
          </Link>

          <Link to="/doctor" className="block group">
            <Card className="rounded-2xl border-0 border-b-8 border-black bg-white shadow-sm p-8 flex flex-col items-center text-center outline-none transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 border border-gray-300 transition-transform group-hover:scale-110">
                <DoorOpen className="h-11 w-11 text-gray-900" />
              </div>
              <h3 className="text-lg font-black text-gray-800 uppercase mb-2">Consultório</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Atendimento médico especializado</p>
            </Card>
          </Link>

          <Link to="/panel" className="block group">
            <Card className="rounded-2xl border-0 border-b-8 border-[#ffcc00] bg-white shadow-sm p-8 flex flex-col items-center text-center outline-none transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 border border-yellow-100 transition-transform group-hover:scale-110">
                <Monitor className="h-11 w-11 text-yellow-600" />
              </div>
              <h3 className="text-lg font-black text-gray-800 uppercase mb-2">Painel</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Visualização de chamadas e controle de fluxo da sala de espera</p>
            </Card>
          </Link>

          <Card
            role="button"
            tabIndex={0}
            onClick={() => {
              loadConsultorios();
              setOpenAddConsultorio(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadConsultorios();
                setOpenAddConsultorio(true);
              }
            }}
            className="group cursor-pointer rounded-2xl border-0 border-b-8 border-orange-500 bg-white shadow-sm p-8 flex flex-col items-center text-center outline-none transition-all duration-300 hover:-translate-y-2"
            aria-label="Abrir gestão de novo consultório"
          >
            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 border border-orange-100 transition-transform group-hover:scale-110">
              <Plus className="h-11 w-11 text-orange-600" />
            </div>
            <h3 className="text-lg font-black text-gray-800 uppercase mb-2">Novo Consultório</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">Adicionar nova sala de atendimento</p>
          </Card>
        </div>

        <Dialog open={openAddConsultorio} onOpenChange={setOpenAddConsultorio}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Consultório</DialogTitle>
              <DialogDescription>Insira o número do novo consultório.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                placeholder="Insira o número do consultório"
                value={consultorioNumero}
                onChange={(e) => setConsultorioNumero(e.target.value)}
              />
              <div className="mt-4">
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                  Consultórios cadastrados:
                </h3>

                <div className="p-2 border rounded-md bg-muted/40 max-h-32 overflow-y-auto text-sm">
                  {consultorios.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum consultório cadastrado.</p>
                  ) : (
                    <ul className="space-y-1">
                      {consultorios.map((c) => (
                        <li key={c.id}>• Consultório {c.id}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenAddConsultorio(false)}>
                Cancelar
              </Button>
              <Button onClick={() => handleAddConsultorio()}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
