'use client';

import Image from 'next/image';
import Link from 'next/link';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

const DEFAULT_EMAIL = 'admin@escalads.dev';
const DEFAULT_PASSWORD = 'changeme';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Image src="/logo.svg" alt="EscalAds" width={56} height={56} />
        </div>
        <Card className="glassmorphic border border-border/60 shadow-xl backdrop-blur-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">Cadastro temporariamente desativado</CardTitle>
            <CardDescription>
              Utilize as credenciais padrão para acessar o dashboard enquanto finalizamos o módulo de contas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/10 p-4 font-mono text-xs text-primary">
              <p>Email: {DEFAULT_EMAIL}</p>
              <p>Senha: {DEFAULT_PASSWORD}</p>
            </div>
            <p>Depois de logado você poderá explorar os dados normalmente. Assim que o fluxo de cadastro definitivo estiver pronto, avisaremos nos canais oficiais.</p>
            <div className="flex justify-center">
              <Button asChild variant="secondary">
                <Link href="/login">Ir para o login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
