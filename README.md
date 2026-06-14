# 💰 Cami Finance — Gerenciador Financeiro Gamificado

Um painel financeiro pessoal moderno e interativo com conquistas gamificadas para você controlar seus gastos no cartão de crédito.

## ✨ Funcionalidades

- **📄 Gestão de Boletos (CRUD)** — Adicione, edite, exclua e marque boletos como pagos com upload de documentos (PDF/imagem)
- **📊 Dashboard Mensal** — Navegue entre meses e visualize gráficos interativos (rosca por categoria, barras pago vs. pendente)
- **🏆 Conquistas Gamificadas** — Desbloqueie e crie metas personalizadas para controlar uso do cartão de crédito
- **🎉 Notificações** — Celebrações animadas ao desbloquear conquistas
- **🌑 Dark Mode** — Tema escuro por padrão com paleta Harmony

## 🛠️ Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Banco de dados | Supabase PostgreSQL via Prisma ORM |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Estilização | Vanilla CSS (CSS Modules) |
| Fontes | Outfit + Inter (Google Fonts via `next/font`) |

## 🧩 Agent Skills
- Frontend Design: Sempre que houver solicitações de modificação de layout, UI ou UX, utilize obrigatoriamente a skill frontend-design (em: .agents/skills/frontend-design/SKILL.md) para garantir a qualidade estética.
- Supabase & Prisma: Sempre que houver solicitações relacionadas a banco de dados, utilize obrigatoriamente a skill supabase-postgress-best-practices (em: .agents/skills/supabase-postgress-best-practices/SKILL.md) para garantir a qualidade do código.
- Next.js 16: Sempre que houver solicitações relacionadas a Next.js 16, utilize obrigatoriamente a skill nextjs-best-practices (em: .agents/skills/nextjs-best-practices/SKILL.md) para garantir a qualidade do código.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js LTS (v20+)
- npm v9+
- Um projeto criado no [Supabase](https://supabase.com)

### Instalação e Setup

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**
   Crie ou edite o arquivo `.env` na raiz do projeto:
   ```env
   # Link de conexão com o pool de conexões (modo Transaction - porta 6543)
   DATABASE_URL="postgresql://postgres.[sua-ref-do-projeto]:[sua-senha]@aws-1-[sua-regiao].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10"

   # Link de conexão direta com o banco de dados (modo Session - porta 5432)
   DIRECT_URL="postgresql://postgres:[sua-senha]@db.[sua-ref-do-projeto].supabase.co:5432/postgres"
   ```

3. **Aplicar o schema do banco**
   Sincronize as tabelas no Supabase:
   ```bash
   npx prisma db push
   ```

4. **Migração / Restauração de dados antigos (opcional)**
   Caso tenha dados locais no SQLite (`prisma/dev.db`), você pode exportá-los e importá-los para o Supabase:
   ```bash
   # Exporta do SQLite para prisma/data-export.json
   npm run db:export

   # Importa o JSON para o Supabase mapeando para o usuário padrão "Principal"
   npm run db:import
   ```

5. **Iniciar o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot-reload |
| `npm run build` | Gera o build de produção |
| `npm run db:push` | Sincroniza o schema Prisma com o banco Supabase |
| `npm run db:export` | Exporta os dados locais do SQLite para um JSON |
| `npm run db:import` | Importa o JSON de backup para o banco Supabase |
| `npm run db:studio` | Abre o Prisma Studio (visualizar dados) |

## 📁 Estrutura do Projeto

```
prisma/
├── schema.prisma    # Models: User, Category, PaymentSlip, Achievement, UserStats
├── export.ts        # Script de exportação do SQLite
├── import.ts        # Script de importação para o Supabase
└── data-export.json # Dump dos dados exportados (git ignorado)

public/
└── uploads/         # Documentos PDF/imagem anexados aos boletos
```
src/
├── app/
│   ├── api/
│   │   ├── slips/           # GET (com filtro mensal), POST
│   │   ├── slips/[id]/      # PUT, DELETE
│   │   ├── categories/      # GET
│   │   ├── achievements/    # GET, POST
│   │   └── stats/           # GET, PUT
│   ├── globals.css          # Design system (paleta Harmony, variáveis CSS)
│   ├── layout.tsx           # Root layout com fonts e metadata SEO
│   ├── page.tsx             # Dashboard principal
│   └── page.module.css      # Estilos do dashboard
├── components/
│   ├── AdicionarBoleto/     # Modal de formulário CRUD
│   ├── SlipList/            # Item de boleto com ações
│   ├── DashboardCharts/     # Gráficos (Recharts) e cards de resumo
│   └── Achievements/        # Painel de conquistas e toasts
└── lib/
    ├── prisma.ts            # Singleton Prisma Client
    ├── upload.ts            # Utilitário de upload de arquivos
    └── achievements.ts      # Motor de cálculo de conquistas
```

## 🏆 Sistema de Conquistas

| Tipo | Comportamento |
|------|--------------|
| `CARD_THRESHOLD` | Meta: manter gastos no cartão abaixo de X% do total |
| `SAVINGS` | Meta: gastar menos de X% do limite de orçamento mensal |
| `STREAK` | Meta: dias sem usar o cartão de crédito |

Conquistas são recalculadas automaticamente após cada mutação de boleto.

## 📋 Cenários de Verificação

Veja o guia completo em [`specs/001-finance-manager/quickstart.md`](./specs/001-finance-manager/quickstart.md).
