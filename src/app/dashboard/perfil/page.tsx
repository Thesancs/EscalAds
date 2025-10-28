
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { Upload, KeyRound, Save } from 'lucide-react';

export default function PerfilPage() {
  const { user } = useAuth();
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações de conta.
        </p>
      </div>

      <div className="flex flex-col gap-8">
          {/* Card de Informações Pessoais */}
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize sua foto e detalhes pessoais aqui.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-primary/50">
                  <AvatarImage
                    src={user?.avatar_url ?? undefined}
                    alt={user?.full_name ?? 'Usuário'}
                    data-ai-hint="person avatar"
                  />
                  <AvatarFallback>{getInitials(user?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="profile-picture" className="mb-2 block">Foto de Perfil</Label>
                  <div className="flex">
                    <Input id="profile-picture" type="file" className="hidden" />
                    <Button variant="outline" asChild>
                       <label htmlFor="profile-picture" className="cursor-pointer">
                         <Upload className="mr-2 h-4 w-4" />
                         Carregar Imagem
                       </label>
                    </Button>
                  </div>
                   <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF até 10MB.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue={user?.full_name ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de E-mail</Label>
                <Input id="email" type="email" defaultValue={user?.email ?? ''} disabled />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
              </div>
               <Button>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          {/* Card de Senha */}
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Gerenciamento de Senha</CardTitle>
              <CardDescription>
                Altere sua senha para manter sua conta segura.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button variant="secondary">
                <KeyRound className="mr-2 h-4 w-4" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
