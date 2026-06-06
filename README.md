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
| Banco de dados | SQLite via Prisma ORM |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Estilização | Vanilla CSS (CSS Modules) |
| Fontes | Outfit + Inter (Google Fonts via `next/font`) |

## 🚀 Início Rápido

### Pré-requisitos
- Node.js LTS (v20+)
- npm v9+

### Instalação e Setup

```bash
# 1. Instalar dependências
npm install

# 2. Criar o banco de dados SQLite e aplicar o schema
npx prisma db push

# 3. Inserir dados padrão (categorias e conquistas)
npm run db:seed

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot-reload |
| `npm run build` | Gera o build de produção |
| `npm run db:push` | Sincroniza o schema Prisma com o banco |
| `npm run db:seed` | Insere as categorias e conquistas padrão |
| `npm run db:studio` | Abre o Prisma Studio (visualizar dados) |

## 📁 Estrutura do Projeto

```
prisma/
├── schema.prisma    # Models: Category, PaymentSlip, Achievement, UserStats
├── seed.ts          # Dados iniciais (categorias e conquistas)
└── dev.db           # Arquivo SQLite local (git ignorado)

public/
└── uploads/         # Documentos PDF/imagem anexados aos boletos

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
