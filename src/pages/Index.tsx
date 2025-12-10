import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast, useToast } from '@/hooks/use-toast';
import { addConsultorio, getConsultorios } from '@/services/ConsultorioService';
import { get } from 'http';
import { Activity, DoorClosed, Monitor, Stethoscope, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
    const { toast } = useToast();
    const [openAddConsultorio, setOpenAddConsultorio] = useState(false);
    const [consultorioNumero, setConsultorioNumero] = useState("");
    const [consultorios, setConsultorios] = useState([]);

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground">Hospital Emergency Room</h1>
          <p className="text-xl text-muted-foreground">Manchester Triage System</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <UserPlus className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Reception</CardTitle>
              <CardDescription>Register new patients</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/reception">
                <Button className="w-full">Access</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <Stethoscope className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Acolhimento</CardTitle>
              <CardDescription>Acolhimento e Classificação de Risco</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/triage">
                <Button className="w-full">Access</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <Activity className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Doctor</CardTitle>
              <CardDescription>Consultation dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/doctor">
                <Button className="w-full">Access</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <Monitor className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Public Panel</CardTitle>
              <CardDescription>TV display panel</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/panel">
                <Button className="w-full">Access</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="'hover:border-primary transition-colors'">
            <CardHeader>
              <DoorClosed className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Adicionar Consultório</CardTitle>
              <CardDescription>Adicione um novo consultório ao Sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => {
                 loadConsultorios();
                setOpenAddConsultorio(true)}} 
                className="w-full">
                Adicionar
              </Button>
            </CardContent>
          </Card>
          <Dialog open={openAddConsultorio} onOpenChange={setOpenAddConsultorio}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Consultório</DialogTitle>
                <DialogDescription>
                  Insira o número do novo consultório.
                </DialogDescription>
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
                        {consultorios.map((c: any) => (
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
                <Button onClick={() => handleAddConsultorio()}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
