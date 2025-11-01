
'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {zodResolver} from '@hookform/resolvers/zod';
import {Info, Loader2, LogIn} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';
import {useAuth} from '@/lib/auth-context';

const formSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha padrão.')
});

type LoginFormValues = z.infer<typeof formSchema>;

const DEFAULT_EMAIL = 'admin@escalads.dev';
const DEFAULT_PASSWORD = 'changeme';

export default function LoginPage() {
  const router = useRouter();
  const {toast} = useToast();
  const {login, status} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD
    }
  });

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [router, status]);

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      toast({
        title: 'Bem-vindo de volta!',
        description: 'Carregando seu painel de inteligência.'
      });
      router.replace('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Não foi possível entrar',
        description: 'Confira suas credenciais ou tente novamente em instantes.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'authenticated') {
    return null;
  }

  if (status === 'loading' && !isSubmitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Image src="/logo.svg" alt="EscalAds" width={56} height={56} />
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          <Info className="mt-0.5 h-4 w-4" />
          <div>
            Acesso temporário habilitado com as credenciais padrão:
            <div className="mt-2 space-y-1 font-mono text-xs">
              <p>Email: {DEFAULT_EMAIL}</p>
              <p>Senha: {DEFAULT_PASSWORD}</p>
            </div>
          </div>
        </div>
        <Card className="glassmorphic border border-border/60 shadow-xl backdrop-blur-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">Acesse a plataforma</CardTitle>
            <CardDescription>
              Monitore criativos escalados em tempo real com inteligência de mercado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="voce@agencia.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting || status === 'loading'}>
                  {isSubmitting || status === 'loading' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  Entrar
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              Ainda não tem acesso?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Crie sua conta
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
