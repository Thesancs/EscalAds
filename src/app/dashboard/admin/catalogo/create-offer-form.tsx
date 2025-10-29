'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createOfferSchema } from '@/lib/validators/offers';

const defaultValues: z.infer<typeof createOfferSchema> = {
  name: '',
  platform: '',
  country: '',
  summary: '',
  funnel_type: 'VSL',
  niche: '',
  is_monitored: false,
  checkout_url: '',
  ads_page_url: '',
  conversion_page_url: '',
};

export function CreateOfferForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof createOfferSchema>>({
    resolver: zodResolver(createOfferSchema),
    defaultValues,
  });

  const handleSubmit = async (values: z.infer<typeof createOfferSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/offers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Não foi possível cadastrar a oferta.');
      }

      toast({
        title: 'Oferta criada com sucesso!',
        description: 'Ela já aparece na lista de ofertas escaladas.',
      });
      form.reset(defaultValues);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível cadastrar a oferta.';
      toast({ variant: 'destructive', title: 'Erro', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glassmorphic border-dashed">
      <CardHeader>
        <CardTitle>Nova oferta escalada</CardTitle>
        <CardDescription>Cadastre uma oferta interna para acompanhar status, nicho e funil.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da oferta</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome interno" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="niche"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nicho</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Emagrecimento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumo</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Descreva o posicionamento e promessa principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="funnel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de funil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VSL">VSL</SelectItem>
                        <SelectItem value="Quiz">Quiz</SelectItem>
                        <SelectItem value="LP">Landing Page</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plataforma</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Meta Ads"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Brasil"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="checkout_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Página de checkout</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ads_page_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Página de anúncios</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conversion_page_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Página de conversão</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_monitored"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                  <div className="space-y-0.5">
                    <FormLabel>Oferta já monitorada automaticamente?</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mantém o status sincronizado com a coleta diária.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Cadastrar oferta'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
