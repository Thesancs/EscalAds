# EscalAds – Painel de inteligência de anúncios

EscalAds é um painel focado em monitoramento inteligente de ofertas. A aplicação roda em Next.js (App Router) com componentes server-first, integra com Supabase para persistência e autenticação e utiliza Zod para validação de entradas.

## Funcionalidades principais

- **Autenticação Supabase** com persistência de sessão via cookies HTTP-only.
- **Monitoramento diário de ofertas escaladas** com histórico (`offer_tracking`) e cálculo automático de variação percentual.
- **Cadastro de links externos** (`monitored_offers`) com histórico próprio (`monitored_offer_tracking`).
- **Status automático** (`escalando`, `estável`, `caindo`) baseado na variação das últimas coletas.
- **Rotas de API** para atualizar contagens (`/api/offers/update-ads`, `/api/monitored/update`) e cadastrar links (`/api/monitored/add`).
- **Dashboard unificado** com totais, destaques e CTA para rotinas automáticas (`updateAllOffersDaily`).
- **UI construída com Tailwind + shadcn/ui**, incluindo formulários validados com React Hook Form + Zod.
- **Pipeline CI** em GitHub Actions executando lint e verificação de tipos.
- **Controle de acesso por níveis (Owner, Admin, Membro)** aplicado em layouts, menus e permissões do dashboard.

## Requisitos

- Node.js 20+
- Conta Supabase com as tabelas abaixo

### Tabelas esperadas

Crie as seguintes tabelas no Supabase (tipos sugeridos):

```sql
create table offers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform text,
  country text,
  summary text,
  funnel_type text,
  niche text,
  is_monitored boolean not null default false,
  checkout_url text,
  ads_page_url text,
  conversion_page_url text,
  total_ads_today integer not null default 0,
  variation_percent numeric,
  status text not null default 'estável',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);

create table offer_tracking (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id) on delete cascade,
  date date not null,
  ads_count integer not null,
  variation numeric,
  status text not null,
  created_at timestamp with time zone default now()
);

create table monitored_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  offer_name text,
  offer_url text not null,
  last_ads_count integer,
  last_variation numeric,
  status text not null default 'estável',
  created_at timestamp with time zone default now()
);

create table monitored_offer_tracking (
  id uuid primary key default gen_random_uuid(),
  monitored_offer_id uuid references monitored_offers(id) on delete cascade,
  date date not null,
  ads_count integer not null,
  variation numeric,
  status text not null,
  created_at timestamp with time zone default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'Membro' check (role in ('Owner', 'Admin', 'Membro')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table profiles enable row level security;

-- Cria automaticamente um profile quando um usuário for registrado via Auth
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.email::text, 'Membro')
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Políticas básicas de RLS para leitura/edição de perfil
create policy "select own profile" on profiles
for select using (auth.uid() = id);

create policy "insert own profile" on profiles
for insert with check (auth.uid() = id);

create policy "update own profile" on profiles
for update using (auth.uid() = id)
with check (role = 'Membro');
```

### Configurando login por e-mail e senha

1. No painel do Supabase, acesse **Authentication → Providers** e habilite o provedor **Email** com a opção de novos cadastros ativa. Configure confirmação de e-mail se desejar aprovar contas manualmente.
2. Execute o bloco SQL acima no editor do Supabase para criar a tabela `profiles`, a função/trigger que gera o perfil automaticamente e as políticas básicas de RLS.
3. Utilize uma Service Role Key apenas no backend. As rotas `/api/auth/signup` e `/api/auth/login` deste projeto conversam com o Auth REST API e usam a service key (via `supabaseFetch`) apenas no ambiente server-side para sincronizar o perfil sem expor a chave ao cliente.
4. As credenciais permanecem exclusivamente no módulo de autenticação do Supabase (`auth.users`). O perfil recebe apenas dados públicos (nome, função), mantendo as senhas fora de qualquer tabela customizada.

> Configure Row Level Security conforme a necessidade da sua aplicação. As rotas internas utilizam a service key do Supabase, portanto mantenha-a somente no servidor.

### Mapeamento de papéis de acesso

- **Owner**: visão completa do painel, incluindo área financeira e gestão de membros.
- **Admin**: pode acessar o painel administrativo para gerenciar catálogo e membros, mas é redirecionado ao tentar abrir o módulo financeiro.
- **Membro**: acessa apenas o dashboard operacional (ofertas escaladas, monitoradas e perfil), sem links para a área administrativa.

> O fluxo de cadastro (`/signup`) cria usuários sempre como **Membro**. Promova contas para **Admin** ou **Owner** atualizando a coluna `role` na tabela `profiles` via painel do Supabase ou através de uma função server-side protegida pela service role key.

### Variáveis de ambiente

Crie um arquivo `.env.local` com as chaves abaixo:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

As rotas de autenticação utilizam os endpoints REST do Supabase. O service role é usado apenas para operações server-side (tracking, atualizações).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor Next.js em modo desenvolvimento. |
| `npm run build` | Compila o projeto para produção. |
| `npm run start` | Inicia o build de produção. |
| `npm run lint` | Executa `next lint` (requer `eslint` instalado como dev dependency). |
| `npm run typecheck` | Verifica tipos TypeScript sem emitir arquivos. |
| `npm run format` | Executa `prettier --check .`. |
| `npm run format:fix` | Executa `prettier --write .`. |

> Instale `eslint` e `prettier` como dependências de desenvolvimento (`npm install --save-dev eslint prettier`) para utilizar os scripts de lint/formatação.

## Fluxos importantes

### Atualização manual de contagem

1. Vá até `/dashboard/offers` ou `/dashboard/monitored`.
2. Clique em **Atualizar contagem**, informe o total de anúncios coletados no dia e confirme.
3. A rota correspondente calcula a variação, salva um registro de tracking e atualiza o status.

### Cadastro de link externo

1. Em `/dashboard/monitored`, preencha o nome interno (opcional) e a URL do anúncio.
2. O sistema cria o registro em `monitored_offers` com status inicial `estável`.
3. Atualize a contagem manualmente ou configure a rotina diária.

### Rotina diária automática

Use a função `updateAllOffersDaily` (`src/lib/jobs/update-all-offers-daily.ts`) em uma Supabase Edge Function ou cron job da Vercel:

```ts
import { updateAllOffersDaily } from '@/lib/jobs/update-all-offers-daily';

await updateAllOffersDaily(new Date().toISOString().split('T')[0]);
```

Essa função percorre todas as ofertas escaladas e monitoradas, obtém a contagem do dia (mock configurado) e registra o histórico com cálculo de variação e status.

## Autenticação

As rotas `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout` e `/api/auth/session` encapsulam a comunicação com o Supabase Auth. Os tokens são salvos em cookies HTTP-only (`sb-access-token`, `sb-refresh-token`) e o contexto `AuthProvider` (`src/lib/auth-context.tsx`) disponibiliza `signIn`, `signUp`, `signOut` e `refresh` para os componentes client.

Durante o cadastro (`signUp`), o backend envia metadados com `role = 'Membro'`. A leitura da sessão normaliza o valor priorizando `app_metadata.role`, depois `user_metadata.role` e, por fim, aplicando o padrão `Membro`. Ajuste o papel de cada usuário direto no Supabase para liberar privilégios elevados sem alterações no código.

## Estrutura de pastas relevante

```
src/
  app/
    api/
      auth/
      offers/
      monitored/
    dashboard/
      offers/
      monitored/
      ...
  lib/
    auth-context.tsx
    monitoring/
    supabase/
    jobs/
    validators/
```

## Testes e qualidade

- ESLint configurado em `.eslintrc.js` (ordem de imports e regras padrão Next).
- Prettier configurado em `.prettierrc`.
- Pipeline CI em `.github/workflows/ci.yml`.

## Próximos passos sugeridos

- Substituir os mocks de `getTodayAdCount` por integrações reais (ex.: APIs de anúncios).
- Implementar gráficos históricos utilizando `offer_tracking` e `monitored_offer_tracking`.
- Configurar RLS no Supabase para segmentar dados por usuário.
- Adicionar testes automatizados para rotas de API e componentes críticos.
