import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { fetchAdminProfiles } from '@/lib/supabase/queries';
import type { AdminProfile } from '@/lib/supabase/types';
import { ProfilesTableClient } from './profiles-table-client';

async function loadAdminProfiles(): Promise<{ profiles: AdminProfile[]; error?: string }> {
  try {
    const profiles = await fetchAdminProfiles();
    return { profiles };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Não foi possível carregar os membros cadastrados.';
    return { profiles: [], error: message };
  }
}

export default async function ProfilesTab() {
  const { profiles, error } = await loadAdminProfiles();

  if (error) {
    return (
      <Card className="border-destructive/50 mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Perfis
          </CardTitle>
          <CardDescription>
            {error}. Verifique as variáveis de ambiente <code>SUPABASE_URL</code> e{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> para habilitar a listagem de membros.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card className="glassmorphic mt-4">
        <CardHeader>
          <CardTitle>Perfis de Usuário</CardTitle>
          <CardDescription>Nenhum membro cadastrado até o momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ProfilesTableClient profiles={profiles} />;
}
