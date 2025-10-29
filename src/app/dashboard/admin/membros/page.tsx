
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CreditCard, Shield, ToggleRight, Download, Briefcase } from 'lucide-react';
import ProfilesTab from './_components/profiles-tab';

export default function MembrosPage() {
  return (
    <div className="container mx-auto max-w-7xl py-8 animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Gerenciamento de Membros
        </h1>
        <p className="text-muted-foreground">
          Gerencie usuários, planos, permissões e mais.
        </p>
      </div>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="h-auto bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
          <TabsTrigger value="profiles" className="py-2">
            <Users className="mr-2" /> Perfis
          </TabsTrigger>
          <TabsTrigger value="plans" className="py-2">
            <CreditCard className="mr-2" /> Planos
          </TabsTrigger>
          <TabsTrigger value="roles" className="py-2">
            <Shield className="mr-2" /> Permissões
          </TabsTrigger>
           <TabsTrigger value="teams" className="py-2">
            <Briefcase className="mr-2" /> Times
          </TabsTrigger>
          <TabsTrigger value="feature-flags" className="py-2">
            <ToggleRight className="mr-2" /> Feature Flags
          </TabsTrigger>
          <TabsTrigger value="export" className="py-2">
            <Download className="mr-2" /> Exportar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profiles">
          <ProfilesTab />
        </TabsContent>
        <TabsContent value="plans">
           <Card className="glassmorphic mt-4">
              <CardHeader>
                <CardTitle>Planos & Preços</CardTitle>
                <CardDescription>Criar/editar planos, ciclo (mensal/anual), trial, limites por plano.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="roles">
           <Card className="glassmorphic mt-4">
              <CardHeader>
                <CardTitle>Permissões/Roles</CardTitle>
                <CardDescription>Criar papéis, atribuir escopos.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="teams">
           <Card className="glassmorphic mt-4">
              <CardHeader>
                <CardTitle>Times/Workspaces</CardTitle>
                <CardDescription>Convites, papéis por espaço.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="feature-flags">
           <Card className="glassmorphic mt-4">
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Ligar/desligar recursos por plano/usuário.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="export">
            <Card className="glassmorphic mt-4">
              <CardHeader>
                <CardTitle>Exportação e Portabilidade (LGPD/GDPR)</CardTitle>
                <CardDescription>Baixar dados do usuário, apagar conta.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
