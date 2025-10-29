'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createMonitoredOfferSchema } from '@/lib/validators/offers';

const schema = createMonitoredOfferSchema;

export function AddMonitoredOfferForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      offer_name: '',
      offer_url: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        offer_name: values.offer_name?.trim() ? values.offer_name.trim() : undefined,
      };
      const response = await fetch('/api/monitored/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Não foi possível cadastrar a oferta monitorada.');
      }

      toast({
        title: 'Oferta adicionada!',
        description: 'Iniciamos o acompanhamento diário desse link externo.',
      });
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível cadastrar a oferta monitorada.';
      toast({ variant: 'destructive', title: 'Erro', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glassmorphic border-dashed">
      <CardHeader>
        <CardTitle>Adicionar oferta externa</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-[2fr_3fr_auto]">
            <FormField
              control={form.control}
              name="offer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome interno</FormLabel>
                  <FormControl>
                    <Input placeholder="Produto X" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="offer_url"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>URL monitorada</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.facebook.com/ads/library/?id=123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adicionando...' : 'Adicionar' }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
