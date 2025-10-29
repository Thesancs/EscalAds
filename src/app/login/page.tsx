
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  email: z.string().email('Por favor, insira um e-mail válido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
  rememberMe: z.boolean().default(false),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signIn(values);
      toast({
        title: 'Login bem-sucedido!',
        description: 'Redirecionando para o seu dashboard...',
      });
      router.push('/dashboard');
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description:
          error instanceof Error
            ? error.message
            : 'E-mail ou senha inválidos. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
             <Image
                src="/Logo Scalify.png"
                alt="Scalify Logo"
                width={80}
                height={30}
            />
        </div>
        <Card className="glassmorphic">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Acessar Plataforma</CardTitle>
            <CardDescription>
              Use seu e-mail e senha para entrar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Sua senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                    <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <FormLabel className="font-normal text-muted-foreground">
                            Lembrar senha
                        </FormLabel>
                        </FormItem>
                    )}
                    />
                     <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
                        Esqueceu sua senha?
                    </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                     <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                     </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Crie uma agora
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
