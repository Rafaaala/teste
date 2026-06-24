# 🎨 ARQUITETURA E FLUXOS - SISTEMA NIRAN

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   /mesas     │  │/pagamento-pix│  │ /confirmacao │       │
│  │  (Mapa)      │  │  (Pix)       │  │ (Tracking)   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │               │
│  ┌──────▼────────────────────────────────────▼──────┐       │
│  │         Componentes Reutilizáveis                 │       │
│  │  • TableGrid                                      │       │
│  │  • TableDetailModal                               │       │
│  │  • useToast                                       │       │
│  └────────────────┬──────────────────────────────────┘       │
│                   │ FETCH API                                │
└───────────────────┼────────────────────────────────────────── │
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Next.js API)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  GET  /api/tables?with-sessions=true ──┐                   │
│  GET  /api/sessions/:id                ├─ Mapa de Mesas    │
│  PATCH /api/sessions/:id               │                   │
│                                         ▼                   │
│  GET  /api/pagamentos/:id          ┌─────────────┐          │
│  POST /api/pagamentos/:id/verify   │ Pagamento   │          │
│                                     │ PIX & Tracking        │
│  GET  /api/pedidos/:id             └─────────────┘          │
│  GET  /api/pedidos/:id/itens                               │
│                                                               │
│  GET  /api/clientes?phone=         ┌─────────────┐          │
│  POST /api/clientes                │ Checkout    │          │
│  POST /api/enderecos               │ Público     │          │
│                                     └─────────────┘          │
│                                                               │
└────────────────┬─────────────────────────────────────────────┘
                 │ SQL Queries
                 ▼
┌─────────────────────────────────────────────────────────────┐
│          DATABASE (PostgreSQL/Neon)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  tables          sessions        orders         customers   │
│  ├─ id           ├─ id           ├─ id          ├─ id       │
│  ├─ number       ├─ table_id     ├─ customer_id ├─ name     │
│  ├─ capacity     ├─ opened_by    ├─ status      ├─ phone    │
│  ├─ status       ├─ status       ├─ total       ├─ email    │
│  └─ ...          ├─ guest_count  ├─ created_at  └─ ...      │
│                  └─ ...          └─ ...                     │
│                                                               │
│  session_items   order_items     payments      addresses    │
│  ├─ id           ├─ id           ├─ id         ├─ id        │
│  ├─ session_id   ├─ order_id     ├─ order_id   ├─ customer  │
│  ├─ product_id   ├─ product_id   ├─ method     ├─ street    │
│  ├─ quantity     ├─ quantity     ├─ status     ├─ number    │
│  └─ ...          └─ ...          └─ ...        └─ ...       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXOS DE NEGÓCIO

### 1️⃣ Fluxo: Gerenciar Mesas

```
Garçom/Caixa acessa /mesas
         ↓
   Autenticação ✓
         ↓
   Load mesas via GET /api/tables?with-sessions=true
         ↓
   ┌─────────────────────┐
   │  Grid de Mesas:     │
   │  • 4 status visíveis│
   │  • Atualiza 20s     │
   │  • Busca por número │
   └─────────────────────┘
         ↓
   Clica em uma mesa
         ↓
   ┌──────────────────────┐
   │   Modal Abre:        │
   │   • Detalhes mesa    │
   │   • Pedidos da mesa  │
   │   • Status atual     │
   │   • Tempo ocupação   │
   └──────────────────────┘
         ↓
   Escolhe ação:
   ├─ Solicitar Fechamento → PATCH status=fechamento_solicitado
   ├─ Fechar Conta        → PATCH status=fechada
   └─ Atualizar           → Recarrega dados
         ↓
   API retorna status 200
         ↓
   Modal atualiza / Fecha
         ↓
   Grid recarrega automaticamente
```

### 2️⃣ Fluxo: Pagar com PIX

```
Cliente em /checkout
         ↓
Seleciona PIX como pagamento
         ↓
POST /api/pagamentos → Cria cobrança PIX
         ↓
Retorna:
├─ QR Code (base64)
├─ Código copia-e-cola
└─ Expira em: 10 minutos
         ↓
Redireciona para /pagamento-pix
         ↓
┌──────────────────────┐
│  Página PIX:         │
│  • Exibe QR Code     │
│  • Botão copiar      │
│  • Countdown         │
│  • Instruções        │
└──────────────────────┘
         ↓
Cliente escaneia QR (em app de banco)
         ↓
WHILE (tiempo < expiracion) {
  GET /api/pagamentos/:id/verify → status?
  Sleep 5s
}
         ↓
Status === "confirmado"?
├─ SIM → Redirect /order-success
└─ NÃO → Timeout → Erro
```

### 3️⃣ Fluxo: Checkout Sem Login (Público)

```
Cliente em /
         ↓
Adiciona itens ao carrinho
         ↓
Clica "Finalizar Pedido"
         ↓
Seleciona "Delivery"
         ↓
❌ Sem autenticação detectada
         ↓
┌────────────────────────┐
│  Form de Identificação:│
│  • Nome completo       │
│  • Telefone (11 dígitos)
└────────────────────────┘
         ↓
Clica "Continuar"
         ↓
GET /api/clientes?phone=11999999999
         ↓
Cliente existe?
├─ SIM → Use customerId
└─ NÃO → POST /api/clientes → Create
         ↓
sessionStorage.setItem('guestCustomerId', id)
         ↓
Preenche endereço (via CEP ou manual)
         ↓
POST /api/enderecos + POST /api/pedidos
         ↓
Pedido criado ✓
         ↓
Paga com PIX/Cartão/Dinheiro
         ↓
Confirma → /order-success
```

### 4️⃣ Fluxo: Rastrear Pedido

```
Cliente recebe link
↓
Acessa /confirmacao/pedido-uuid
↓
GET /api/pedidos/:id
↓
┌────────────────────┐
│ Timeline Visual:   │
│ ✓ Criado 14:30    │
│ ✓ Confirmado 14:32│
│ ⏱ Em preparo      │
│ ○ Saindo          │
│ ○ Entregue        │
└────────────────────┘
↓
Auto-atualiza a cada 10s
↓
Status muda em tempo real
↓
Pedido entregue → Timeline completa
```

---

## 🗂️ Estrutura de Pastas (Criado)

```
app/
├── mesas/
│   └── page.tsx ..................... Mapa de mesas
├── pagamento-pix/
│   └── page.tsx ..................... Pagamento PIX
├── order-success/
│   └── page.tsx ..................... Confirmação
└── confirmacao/
    └── [orderId]/
        └── page.tsx ................. Rastreamento

components/
├── table-grid.tsx ................... Grid de mesas
├── table-detail-modal.tsx ........... Modal detalhes
└── screens/
    └── checkout-screen.tsx ......... Checkout melhorado

types/
└── database.ts ...................... Types atualizados

lib/
└── database/
    └── queries/
        ├── sessions.ts ............. Queries (existente)
        └── ...

public/
└── ... (sem mudanças)
```

---

## 🔌 Integração com APIs Existentes

```
┌─────────────────────────────────────────┐
│    APIs Utilizadas no Projeto           │
├─────────────────────────────────────────┤
│                                          │
│ ✅ GET  /api/tables                    │ MELHORADO
│    └─ with-sessions=true (NEW)          │
│                                          │
│ ✅ GET  /api/sessions/:id              │ EXISTENTE
│ ✅ PATCH /api/sessions/:id             │ EXISTENTE
│                                          │
│ ✅ GET  /api/pedidos/:id               │ EXISTENTE
│ ✅ GET  /api/pedidos/:id/itens         │ EXISTENTE
│ ✅ POST /api/pedidos                   │ EXISTENTE
│                                          │
│ ✅ GET  /api/pagamentos/:id            │ EXISTENTE
│ ✅ POST /api/pagamentos                │ EXISTENTE
│                                          │
│ ✅ GET  /api/clientes                  │ EXISTENTE
│ ✅ POST /api/clientes                  │ EXISTENTE
│                                          │
│ ✅ GET  /api/enderecos/:id             │ EXISTENTE
│ ✅ POST /api/enderecos                 │ EXISTENTE
│                                          │
└─────────────────────────────────────────┘
```

---

## 🎯 Padrões de Design

### Component Pattern (Table Grid)

```typescript
interface TableGridProps {
  tables: TableWithSessionInfo[];
  onTableClick: (table: TableWithSessionInfo) => void;
  isLoading?: boolean;
}

export function TableGrid(props) {
  // Renderiza grid
  // Click handler
  // Loading state
}
```

### Modal Pattern (Details)

```typescript
interface TableDetailModalProps {
  table: TableWithSessionInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

export function TableDetailModal(props) {
  // Carrega dados
  // Exibe detalhes
  // Ações com callbacks
}
```

### Page Pattern (Server-Side)

```typescript
"use client"; // Client component

export default function Page() {
  // useSession() para auth
  // useState() para state
  // useEffect() para loads
  // Renderiza componentes
}
```

---

## 🔐 Segurança Implementada

```
┌──────────────────────────────────┐
│      CAMADAS DE SEGURANÇA        │
├──────────────────────────────────┤
│                                   │
│ 1. NextAuth.js                   │
│    └─ Autenticação de usuários   │
│    └─ Roles: garçom, caixa, admin
│                                   │
│ 2. Autorização em APIs           │
│    └─ requireAuth() middleware   │
│    └─ Verificação de role        │
│                                   │
│ 3. Validação de Input            │
│    └─ Verificação de tipos       │
│    └─ Sanitização de dados       │
│                                   │
│ 4. SessionStorage (Guest)        │
│    └─ Armazenamento local        │
│    └─ Sem dados sensíveis        │
│                                   │
│ 5. HTTPS em Produção             │
│    └─ Conexão encriptada         │
│    └─ Cookies secure             │
│                                   │
└──────────────────────────────────┘
```

---

## ⚡ Performance

```
Page Load Times (Target):
├─ /mesas ..................... < 1s
├─ /pagamento-pix ............ < 500ms
├─ /order-success ............ < 500ms
└─ /confirmacao/[id] ......... < 1s

API Response Times:
├─ GET /api/tables ........... < 200ms
├─ PATCH /api/sessions ........ < 300ms
└─ GET /api/pedidos ........... < 200ms

Auto-refresh Intervals:
├─ Mapa de mesas ............ 20s
├─ Verificação PIX ........... 5s
└─ Rastreamento pedido ....... 10s
```

---

## 📱 Responsividade

```
Mobile (375px - 640px)
├─ 2 colunas no grid
├─ Full-width cards
├─ Vertical stack

Tablet (641px - 1024px)
├─ 3-4 colunas no grid
├─ Side-by-side layout
├─ Medium spacing

Desktop (1025px+)
├─ 5 colunas no grid
├─ Optimized layout
├─ Large spacing
```

---

## 🌙 Dark Mode

```
Light Mode (Default)
├─ bg-slate-50/100
├─ text-slate-900
├─ Colors: brighting

Dark Mode (via toggle)
├─ bg-slate-900/800
├─ text-slate-100
├─ Colors: darker
└─ Via Tailwind dark: prefix
```

---

## ✨ Conclusão Visual

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🎉 SISTEMA NIRAN IMPLEMENTADO COM SUCESSO     ║
║                                                   ║
║   ✅ Mapa de Mesas - 100%                       ║
║   ✅ Pagamento PIX - 100%                       ║
║   ✅ Rastreamento - 100%                        ║
║   ✅ Checkout Público - 100%                    ║
║                                                   ║
║   📊 7 Arquivos criados                         ║
║   ✏️  3 Arquivos modificados                     ║
║   🚀 Pronto para produção                       ║
║                                                   ║
║   Data: 24/06/2026                              ║
║   Status: LIBERADO ✨                           ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

**Documentação completa do Sistema Niran v1.0**
