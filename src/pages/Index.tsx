import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { addConsultorio, getConsultorios } from '@/services/ConsultorioService';
import { DoorOpen, HeartHandshake, Monitor, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { toast } = useToast();
  const [openAddConsultorio, setOpenAddConsultorio] = useState(false);
  const [consultorioNumero, setConsultorioNumero] = useState('');
  const [consultorios, setConsultorios] = useState<Array<{ id: string | number }>>([]);

  const handleAddConsultorio = async () => {
    const result = await addConsultorio(consultorioNumero);

    if (result.error) {
      toast({
        title: 'Erro',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Sucesso!',
      description: 'Consultório adicionado com sucesso.',
    });

    setConsultorioNumero('');
    setOpenAddConsultorio(false);
  };

  const loadConsultorios = async () => {
    try {
      const data = await getConsultorios();

      if (data.error) {
        toast({
          title: 'Erro ao carregar consultórios',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setConsultorios(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar consultórios.',
        variant: 'destructive',
      });
    }
  };

  const cardBaseClassName =
    'h-full min-h-[260px] rounded-2xl border-0 bg-white p-8 shadow-sm outline-none transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center justify-between';

  const iconBoxBaseClassName =
    'mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border transition-transform group-hover:scale-110';

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
    <Header title="Sistema de Gestão do Painel de Chamadas" showBackButton={false} />
      <main className="container mx-auto py-12 px-6 flex-grow flex flex-col justify-center">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">
            Painel de Controle
          </h2>
          <div className="h-1.5 w-24 bg-[#ffcc00] mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto w-full items-stretch">
          <Link to="/reception" className="block group h-full">
            <Card className={`${cardBaseClassName} border-b-8 border-[#005a2b]`}>
              <div className="flex flex-col items-center">
                <div className={`${iconBoxBaseClassName} bg-green-50 border-green-200`}>
                  <UserPlus className="h-11 w-11 text-[#005a2b]" />
                </div>
                <h3 className="text-lg font-black text-gray-800 uppercase mb-2 min-h-[56px] flex items-center justify-center">
                  Recepção
                </h3>
              </div>

              <p className="text-xs text-gray-500 font-medium leading-relaxed min-h-[40px] flex items-center justify-center">
                Registro de novos Pacientes
              </p>
            </Card>
          </Link>

          <Link to="/triage" className="block group h-full">
            <Card className={`${cardBaseClassName} border-b-8 border-blue-600`}>
              <div className="flex flex-col items-center">
                <div className={`${iconBoxBaseClassName} bg-blue-50 border-blue-100`}>
                  <HeartHandshake className="h-11 w-11 text-blue-600" />
                </div>
                <h3 className="text-lg font-black text-gray-800 uppercase mb-2 min-h-[56px] flex items-center justify-center">
                  Acolhimento
                </h3>
              </div>

              <p className="text-xs text-gray-500 font-medium leading-relaxed min-h-[40px] flex items-center justify-center">
                Classificação de risco e priorização de atendimento.
              </p>
            </Card>
          </Link>

          <Link to="/doctor" className="block group h-full">
            <Card className={`${cardBaseClassName} border-b-8 border-black`}>
              <div className="flex flex-col items-center">
                <div className={`${iconBoxBaseClassName} bg-gray-100 border-gray-300`}>
                  <DoorOpen className="h-11 w-11 text-gray-900" />
                </div>
                <h3 className="text-lg font-black text-gray-800 uppercase mb-2 min-h-[56px] flex items-center justify-center">
                  Consultório
                </h3>
              </div>

              <p className="text-xs text-gray-500 font-medium leading-relaxed min-h-[40px] flex items-center justify-center">
                Atendimento médico especializado
              </p>
            </Card>
          </Link>

          <Link to="/panel" className="block group h-full">
            <Card className={`${cardBaseClassName} border-b-8 border-[#ffcc00]`}>
              <div className="flex flex-col items-center">
                <div className={`${iconBoxBaseClassName} bg-yellow-50 border-yellow-100`}>
                  <Monitor className="h-11 w-11 text-yellow-600" />
                </div>
                <h3 className="text-lg font-black text-gray-800 uppercase mb-2 min-h-[56px] flex items-center justify-center">
                  Painel
                </h3>
              </div>

              <p className="text-xs text-gray-500 font-medium leading-relaxed min-h-[40px] flex items-center justify-center">
                Visualização de chamadas e controle de fluxo da sala de espera
              </p>
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
            className={`${cardBaseClassName} group cursor-pointer border-b-8 border-orange-500`}
            aria-label="Abrir gestão de novo consultório"
          >
            <div className="flex flex-col items-center">
              <div className={`${iconBoxBaseClassName} bg-orange-50 border-orange-100`}>
                <Plus className="h-11 w-11 text-orange-600" />
              </div>
              <h3 className="text-lg font-black text-gray-800 uppercase mb-2 min-h-[56px] flex items-center justify-center">
                Novo Consultório
              </h3>
            </div>

            <p className="text-xs text-gray-500 font-medium leading-relaxed min-h-[40px] flex items-center justify-center">
              Adicionar nova sala de atendimento
            </p>
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
              <Button onClick={handleAddConsultorio}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}