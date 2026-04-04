import { useToast } from '@/hooks/use-toast';
import {
  addConsultorio,
  Consultorio,
  getConsultorios,
  isConsultorioErrorResponse,
} from '@/services/ConsultorioService';
import { useState } from 'react';

export function useNewConsultorio() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [consultorioNumero, setConsultorioNumero] = useState('');
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);

  const handleNumeroChange = (value: string) => {
    if (value === '') {
      setConsultorioNumero('');
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    const normalizedValue = Number(value);

    if (Number.isNaN(normalizedValue)) {
      return;
    }

    if (normalizedValue <= 0) {
      setConsultorioNumero('');
      return;
    }

    setConsultorioNumero(value);
  };

  const loadConsultorios = async () => {
    try {
      const data = await getConsultorios();

      if (isConsultorioErrorResponse(data)) {
        toast({
          title: 'Erro ao carregar consultórios',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setConsultorios(data);
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar consultórios.',
        variant: 'destructive',
      });
    }
  };

  const handleOpen = async () => {
    await loadConsultorios();
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setConsultorioNumero('');
    }
  };

  const handleAddConsultorio = async () => {
    const result = await addConsultorio(consultorioNumero, consultorios);

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

    const updatedConsultorios = await getConsultorios();

    if (!isConsultorioErrorResponse(updatedConsultorios)) {
      setConsultorios(updatedConsultorios);
    }

    setConsultorioNumero('');
    setIsOpen(false);
  };

  return {
    consultorioNumero,
    consultorios,
    handleAddConsultorio,
    handleNumeroChange,
    handleOpen,
    handleOpenChange,
    isOpen,
  };
}
