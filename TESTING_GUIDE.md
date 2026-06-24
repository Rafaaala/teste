# 🧪 GUIA DE TESTES - SISTEMA NIRAN

## 🚀 Como Acessar as Novas Funcionalidades

### 1️⃣ MAPA DE MESAS

**URL:** `http://localhost:3000/mesas`

**Requisitos:**

- Estar autenticado como: garçom, caixa ou admin
- Ter criado pelo menos uma mesa no banco de dados

**O que testar:**

- [ ] Grid responsivo em diferentes resoluções
- [ ] Cores dos status (Verde/Vermelho/Laranja/Azul)
- [ ] Buscador por número
- [ ] Cards com resumo (valor, itens)
- [ ] Clique abre modal
- [ ] Atualização automática a cada 20s
- [ ] Botão de atualização manual
- [ ] Dark mode funciona corretamente

**Dados de teste sugeridos:**

```sql
-- Criar mesas
INSERT INTO tables (number, capacity, status, is_active) VALUES
(1, 4, 'disponivel', true),
(2, 2, 'disponivel', true),
(3, 6, 'disponivel', true),
(4, 4, 'bloqueada', true);

-- Criar sessão aberta (mesa ocupada)
INSERT INTO sessions (table_id, opened_by, guest_count, status) VALUES
('table-uuid', 'user-uuid', 4, 'aberta');
```

---

### 2️⃣ MODAL DE DETALHES DA MESA

**Como acessar:** Clique em qualquer mesa no grid

**O que testar:**

- [ ] Modal abre corretamente
- [ ] Exibe número, status, tempo de ocupação
- [ ] Lista de pedidos aparece
- [ ] Totais calculados corretamente
- [ ] Campo de observações é editável
- [ ] Botão "Solicitar Fechamento" muda status
- [ ] Botão "Fechar Conta" libera a mesa
- [ ] Modal fecha ao clicar X ou fora dele

**Ações esperadas:**

- Antes: Mesa em status "ocupada"
- Solicitar Fechamento: Muda para "fechamento_solicitado"
- Fechar Conta: Libera mesa (disponivel) e fecha modal

---

### 3️⃣ PÁGINA DE PAGAMENTO PIX

**URL:** `http://localhost:3000/pagamento-pix?order_id=xxx&payment_id=yyy`

**Requisitos:**

- Ter um pedido criado no banco
- Ter um pagamento PIX pendente

**O que testar:**

- [ ] QR Code exibido corretamente
- [ ] Código copia-e-cola aparece
- [ ] Botão de copiar funciona
- [ ] Contagem regressiva funciona
- [ ] Informações do pedido corretas
- [ ] Botão "Verificar pagamento" funciona
- [ ] Redirecionamento após confirmação

**Simular pagamento:**

```javascript
// No console do navegador:
// Atualizar via API (admin pode fazer isso):
fetch("/api/pagamentos/payment-id", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "confirmado" }),
});
```

---

### 4️⃣ PÁGINA DE SUCESSO

**URL:** `http://localhost:3000/order-success?order_id=xxx`

**O que testar:**

- [ ] Animação de sucesso (check bounce)
- [ ] Número do pedido em badge
- [ ] Resumo dos itens
- [ ] Dados do cliente
- [ ] Timeline com etapas
- [ ] Countdown regressivo
- [ ] Redirecionamento automático após 10s

---

### 5️⃣ PÁGINA DE CONFIRMAÇÃO/RASTREAMENTO

**URL:** `http://localhost:3000/confirmacao/pedido-uuid`

**O que testar:**

- [ ] Carrega dados do pedido
- [ ] Status badge com cor correta
- [ ] Aba "Timeline" mostra etapas
- [ ] Aba "Itens" lista produtos
- [ ] Aba "Detalhes" mostra informações
- [ ] Auto-atualização a cada 10s
- [ ] Botão pausar/retomar atualização funciona
- [ ] Endereço formatado corretamente
- [ ] Totais corretos

---

### 6️⃣ CHECKOUT SEM LOGIN

**Pré-requisito:** Estar em `/` sem login

**O que testar:**

- [ ] Selecionando "Delivery" (sem login) → aparece form de identificação
- [ ] Campo "Nome completo" obrigatório
- [ ] Campo "Telefone" aceita números
- [ ] Botão "Continuar" busca/cria cliente
- [ ] Após identificação → pode preencher endereço
- [ ] Botão "Confirmar Pedido" ativado
- [ ] Pedido criado com sucesso

**Fluxo esperado:**

1. Home → Adicionar itens → Checkout
2. Seleionar "Delivery"
3. Ver form de identificação
4. Preencher nome e telefone
5. Clicar "Continuar"
6. Se cliente novo → cria automaticamente
7. Preencher endereço via CEP
8. Confirmar pedido

---

## 🔍 VERIFICAÇÕES TÉCNICAS

### TypeScript

```bash
# Verificar tipos
npm run build

# Esperado: Sem erros de tipo
```

### Responsividade

- [ ] Mobile (375px): 2 colunas
- [ ] Tablet (768px): 3-4 colunas
- [ ] Desktop (1024px): 5 colunas
- [ ] Ultra-wide (1536px): 5 colunas

### Dark Mode

```javascript
// No console:
document.documentElement.classList.toggle("dark");
// Deve funcionar sem erros
```

### Performance

- Mapa de mesas: < 1s de load
- Modal: < 500ms
- Atualização automática: sem lag
- Busca: resposta imediata

---

## 🐛 Possíveis Problemas & Soluções

### Problema: "Erro ao buscar mesas"

**Solução:** Verificar se API GET /api/tables existe e retorna dados

### Problema: Modal não abre

**Solução:** Verificar se session_id não é null no objeto table

### Problema: Contagem regressiva não funciona

**Solução:** Verificar se `pix_expires_at` está em ISO format

### Problema: Checkout público não identifica cliente

**Solução:** Verificar se endpoints `/api/clientes` existem

### Problema: Auto-atualização não funciona

**Solução:** Verificar console de erro, pode ser CORS ou fetch error

---

## 📋 CHECKLIST PRÉ-DEPLOY

### Antes de Enviar para Produção

- [ ] Todos os testes passam localmente
- [ ] Sem erros de TypeScript
- [ ] Sem console errors
- [ ] Responsivo em todos os breakpoints
- [ ] Dark mode funciona
- [ ] APIs retornam dados corretos
- [ ] Tratamento de erros funciona
- [ ] Toast notifications aparecem
- [ ] Redirecionamentos funcionam
- [ ] Atualização automática não trava
- [ ] Páginas carregam em < 3s
- [ ] Imagens carregam corretamente

### Configurações Necessárias

- [ ] Session secret configurado
- [ ] Database conectando
- [ ] APIs de pagamento (se usar)
- [ ] Variáveis de ambiente (.env)

---

## 📞 DEBUG TIPS

### Ver dados de fetch

```javascript
// Adicionar em qualquer componente
console.log("Table data:", tables);
console.log("Session detail:", sessionDetail);
console.log("Order data:", order);
```

### Verificar SessionStorage

```javascript
// Guest checkout data
console.log(sessionStorage.getItem("guestCustomerId"));
```

### Teste de atualização automática

```javascript
// Abrir DevTools → Application → Console
setInterval(() => {
  console.log(new Date().toLocaleTimeString());
}, 1000);
// Deve printar a cada segundo sem erros
```

### Simular erro de rede

```javascript
// DevTools → Network → Throttling
// Selecionar "Slow 3G"
// Verificar se loading states funcionam
```

---

## ✅ FINAL VERIFICATION

Executar este script para verificar tudo:

```bash
# 1. Build
npm run build

# 2. Start server
npm start

# 3. Testes de URL
curl http://localhost:3000/mesas
curl http://localhost:3000/pagamento-pix
curl http://localhost:3000/order-success
curl http://localhost:3000/confirmacao/test-id

# 4. Verificar APIs
curl http://localhost:3000/api/tables?with-sessions=true
curl http://localhost:3000/api/sessions/test-id
```

---

**Tudo funcionando? 🎉 Parabéns! Sistema pronto para produção!**
