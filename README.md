# 💰 Cami Finance — Gerenciador Financeiro Gamificado

Um painel financeiro pessoal moderno e interativo com conquistas gamificadas e elementos de RPG para incentivar o controle de gastos e evitar o uso do cartão de crédito.

## ✨ Funcionalidades

- **📄 Gestão de Boletos (CRUD)** — Adicione, edite, exclua e alterne o pagamento de boletos com upload de comprovantes (PDF/imagem).
- **📊 Dashboard Mensal** — Navegue entre meses e visualize gráficos interativos de rosca por categoria e de barras de gastos.
- **🛡️ HUD de RPG e Barra de HP (Orçamento)** — Seu limite mensal é o seu HP (Pontos de Vida). A barra drena dinamicamente e muda de cor: verde (saudável), amarelo (alerta) e vermelho piscante (crítico <20% com animação de batimentos no coração).
- **⭐ Nível e Progressão de XP** — Ganhe XP ao adicionar boletos (+10 XP), manter a consistência diária (+20 XP de bônus por streak) e realizar pagamentos via PIX ou Débito (+25 XP). Suba de nível e mude de classe (ex: *Guerreiro do Débito*, *Paladino das Finanças*).
- **🏆 Três Árvores de Conquistas Encadeadas** — Três trilhas com progressão bloqueada por nível (você precisa desbloquear o Nível 1 antes de progredir para o Nível 2):
  1. **Trilha Redução de Cartão** (metas de gastos abaixo de 40%, 20% e 0% do limite).
  2. **Trilha Consistência** (ficar 3, 7 e 30 dias seguidos sem usar o cartão).
  3. **Trilha Margem de Lucro** (guardar 10%, 50% e 70% da receita do mês).
- **🎉 Comemoração de Salário e Toasts** — Modal comemorativo com chuva de confetes no dia do recebimento do salário e toasts animados para ganhos de XP e Level Up.
- **⚙️ Configurações de RPG** — Painel lateral integrado para configurar a porcentagem do orçamento HP (0-100% sobre o salário), limite de crédito, valor do salário agendado e dia do pagamento.
- **🌑 Dark Mode** — Tema escuro imersivo por padrão com paletas harmoniosas e transições suaves.

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
- Caveman: Utilize obrigatoriamente a skill caveman (em: .agents/skills/caveman/SKILL.md) para otimização nos tokens e performance nas solicitações para os modelos. Seja conciso e objetivo nas suas respostas.

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

## 🎮 Mecânicas de Gamificação e RPG

### 1. Sistema de Níveis e XP (Experiência)
A progressão do usuário é baseada em acúmulo de XP, onde a meta para o próximo nível escala dinamicamente como `Nível Atual * 100` XP.
As fontes de ganho de XP são:
* **📝 Registro Diário (+10 XP)**: Concedido ao criar ou atualizar um boleto.
* **🔥 Bônus de Consistência (+20 XP)**: Concedido como bônus ao registrar boletos em dias seguidos (sequência de registro).
* **🛡️ Pagamento Saudável (+25 XP)**: Concedido ao marcar um boleto como pago no **Débito** ou **PIX** (onde `isCreditCardPayment === false`).

### 2. Árvores de Conquistas Encadeadas
As 9 conquistas padrão do sistema são divididas em 3 trilhas principais de 3 níveis cada. O progresso e desbloqueio do **Nível N+1** de uma trilha está **bloqueado em cadeia** até que o **Nível N** correspondente seja desbloqueado:

| Trilha | Nível | Conquista | Condição de Desbloqueio |
|--------|-------|-----------|-------------------------|
| **💳 Redução de Cartão** | Nv.1 | Cartão sob Controle | Gastos no cartão de crédito abaixo de 40% do limite total. |
| | Nv.2 | Uso Consciente | Gastos no cartão de crédito abaixo de 20% do limite total. |
| | Nv.3 | Cartão Zero | Nenhum gasto no cartão de crédito (0% do limite). |
| **🔥 Consistência** | Nv.1 | Foco Inicial | Ficar 3 dias seguidos sem registrar gastos no cartão. |
| | Nv.2 | Hábito Saudável | Ficar 7 dias seguidos sem registrar gastos no cartão. |
| | Nv.3 | Mestre do Débito | Ficar 30 dias seguidos sem registrar gastos no cartão. |
| **📈 Margem de Lucro** | Nv.1 | Pé de Meia | Economizar/guardar pelo menos 10% da receita mensal. |
| | Nv.2 | Investidor Iniciante | Economizar/guardar pelo menos 50% da receita mensal. |
| | Nv.3 | Independência Financeira | Economizar/guardar pelo menos 70% da receita mensal. |

*O motor de regras avalia o progresso e desbloqueio a cada alteração, deleção ou marcação de boletos.*

## 📋 Cenários de Verificação

Veja o guia completo de especificações e execução em [`specs/004-persistent-db-migration/plan.md`](./specs/004-persistent-db-migration/plan.md).

