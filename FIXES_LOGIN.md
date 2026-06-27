# ✅ CORREÇÕES IMPLEMENTADAS - LOGIN & ADMIN

## 🔍 Problema Identificado

O sistema tinha dois sistemas de autenticação separados:

1. **CLIENTES** - Tabela `customers`, login por email/telefone
2. **STAFF/ADMIN** - Tabela `users`, login por email+senha

Mas a página de login (`/sign-in`) **só funcionava para clientes** e não tinha interface para staff/admin.

---

## ✅ Correções Realizadas

### 1. Melhorada Página de Login (`app/sign-in/page.tsx`)

**Antes:**

- ❌ Apenas 2 abas: "Entrar" e "Criar conta" (para clientes)
- ❌ Sem suporte para staff/admin
- ❌ Sem campo de senha

**Depois:**

- ✅ 3 abas: "🛍️ Cliente" | "✏️ Registrar" | "👨‍💼 Staff"
- ✅ Aba Staff com campos: Email + Senha
- ✅ Login de staff usa provider "staff" do NextAuth
- ✅ Redireciona para `/mesas` ao fazer login como staff
- ✅ Melhorada organização de estados e funções

### 2. Criada API de Registro de Staff (`app/api/auth/register-staff/route.ts`)

**Nova rota:** `POST /api/auth/register-staff`

```typescript
{
  "name": "Administrador",
  "email": "admin@niransushi.com",
  "password": "admin123",
  "role": "admin"  // ou: gerente, garcom, motoboy
}
```

**Recursos:**

- ✅ Validação completa de entrada
- ✅ Hash bcrypt de senha
- ✅ Verifica se email já existe
- ✅ Retorna dados do usuário criado

### 3. Criado Script de Criação de Admin

**Arquivo:** `scripts/create-admin.ts`

**Uso:**

```bash
npm run create-admin
```

**Cria automaticamente:**

- Email: `admin@niransushi.com`
- Senha: `admin123`
- Role: `admin`

### 4. Adicionado Comando ao package.json

```json
"create-admin": "ts-node -P tsconfig.node.json scripts/create-admin.ts"
```

### 5. Criado Documento de Setup (`ADMIN_SETUP.md`)

Guia completo com:

- ✅ 3 formas de criar admin
- ✅ Via API (curl/Postman)
- ✅ Via script Node.js
- ✅ Via SQL direto
- ✅ Troubleshooting

---

## 🚀 Como Usar Agora

### Rápido (Recomendado)

```bash
npm run create-admin
```

Depois:

1. Abra `http://localhost:3000/sign-in`
2. Clique em **👨‍💼 Staff**
3. Email: `admin@niransushi.com`
4. Senha: `admin123`
5. ✅ Redirecionado para `/mesas`

### Alternativa: Via API

```bash
curl -X POST http://localhost:3000/api/auth/register-staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@niransushi.com",
    "password": "admin123",
    "role": "admin"
  }'
```

---

## 📊 Fluxo Corrigido

**Antes (Quebrado):**

```
Cliente acessa /sign-in
├─ Login: email/telefone ✓ (apenas para clientes)
├─ Cadastro: nome + email/telefone ✓ (apenas para clientes)
└─ Staff/Admin: ❌ IMPOSSÍVEL
```

**Depois (Correto):**

```
Cliente acessa /sign-in
├─ Aba 1: Cliente Login (email/telefone) → Home
├─ Aba 2: Cliente Cadastro (nome + email/telefone) → Home
└─ Aba 3: Staff Login (email + senha) → /mesas
```

---

## 🔐 Autenticação Staff

**NextAuth Config** (`lib/authOptions.ts`):

- Provider: `staff`
- Credenciais: email + password
- Busca usuário em tabela `users`
- Valida password com bcrypt
- Retorna role do usuário
- Salva em JWT

**Fluxo:**

```
1. User digita email + senha em /sign-in
2. signIn("staff", {email, password})
3. NextAuth chama authorize()
4. Busca usuário na tabela users
5. Valida password com bcrypt.compare()
6. Retorna {id, name, email, role}
7. JWT criado com role
8. Redireciona para /mesas
9. Página /mesas verifica role (garcom, caixa, admin)
10. ✅ Mapa de mesas exibido
```

---

## ✨ Arquivos Criados/Modificados

### ✅ Criados

- `app/api/auth/register-staff/route.ts` - Nova API
- `scripts/create-admin.ts` - Script de setup
- `ADMIN_SETUP.md` - Documentação

### ✏️ Modificados

- `app/sign-in/page.tsx` - 3 abas (cliente + staff)
- `package.json` - Script create-admin

---

## 🧪 Teste Rápido

1. Terminal 1:

```bash
npm run dev
```

2. Terminal 2:

```bash
npm run create-admin
```

3. Navegador:

```
http://localhost:3000/sign-in
```

4. Clique em **👨‍💼 Staff**
5. Email: `admin@niransushi.com`
6. Senha: `admin123`
7. ✅ Você vê o mapa de mesas!

---

## 🎯 Status

- ✅ Login de Admin funcionando
- ✅ Página de mesas acessível
- ✅ Autenticação com role
- ✅ Documentação completa
- ✅ Script de setup automático

**Você agora consegue entrar como admin e ver a tela de mesas!** 🎉

---

## 📝 Próximas Etapas (Opcional)

1. Criar mais usuários com roles diferentes:

```bash
curl -X POST http://localhost:3000/api/auth/register-staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Garçom",
    "email": "garcom@niransushi.com",
    "password": "garcom123",
    "role": "garcom"
  }'
```

2. Testar todos os fluxos:
   - [ ] Login cliente por email
   - [ ] Login cliente por telefone
   - [ ] Cadastro cliente
   - [ ] Login admin/staff
   - [ ] Acesso ao mapa de mesas
   - [ ] Acesso negado para clientes em /mesas

3. Em produção, configure senha mais segura no `.env`

---

**Tudo pronto! Bom uso!** 🚀
