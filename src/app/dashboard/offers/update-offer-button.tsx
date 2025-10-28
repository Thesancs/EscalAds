'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface UpdateOfferButtonProps {
  offerId: string;
  currentCount: number;
}

export function UpdateOfferButton({ offerId, currentCount }: UpdateOfferButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(currentCount));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsedValue = Number(value);
    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'Informe um número maior ou igual a zero.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/offers/update-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId, ads_count: parsedValue }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Falha ao atualizar a oferta.');
      }

      const { variation } = (await response.json()) as { variation: number };
      toast({
        title: 'Contagem atualizada!',
        description: `Nova variação calculada: ${variation.toFixed(2)}%.`,
      });
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao atualizar a oferta.';
      toast({ variant: 'destructive', title: 'Erro', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Atualizar contagem
        </Button>
      </DialogTrigger>
      <DialogContent className="glassmorphic">
        <DialogHeader>
          <DialogTitle>Atualizar anúncios ativos</DialogTitle>
          <DialogDescription>
            Informe a quantidade de anúncios ativos para recalcular a variação da oferta.
          </DialogDescription>
        </DialogHeader>
        <Input value={value} onChange={(event) => setValue(event.target.value)} type="number" min={0} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
