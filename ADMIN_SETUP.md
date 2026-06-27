# INSTRUÇÕES: Como Criar um Usuário Admin

## Opção 1: Via API (Recomendado)

Execute este comando no terminal (ou use Postman/Insomnia):

```bash
curl -X POST http://localhost:3000/api/auth/register-staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@niransushi.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Resposta esperada:**

```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid-aqui",
    "name": "Administrador",
    "email": "admin@niransushi.com",
    "role": "admin"
  }
}
```

## Opção 2: Via Script Node.js

Crie um arquivo `create-admin.js`:

```javascript
const bcrypt = require("bcrypt");
const { neon } = require("@neondatabase/serverless");

async function createAdmin() {
  const sql = neon(process.env.DATABASE_URL);

  const email = "admin@niransushi.com";
  const password = "admin123";
  const name = "Administrador";
  const role = "admin";

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, true)
      RETURNING id, name, email, role
    `;

    console.log("✅ Admin criado com sucesso:");
    console.log(JSON.stringify(result[0], null, 2));
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

createAdmin();
```

Execute com:

```bash
node create-admin.js
```

## Opção 3: Direto no Banco de Dados (pgAdmin/Neon Console)

```sql
INSERT INTO users (name, email, password_hash, role, is_active, created_at)
VALUES (
  'Administrador',
  'admin@niransushi.com',
  '$2b$10$SEU_HASH_BCRYPT_AQUI',
  'admin',
  true,
  NOW()
);
```

**Para gerar o hash bcrypt, use:**

```bash
node -e "require('bcrypt').hash('admin123', 10).then(h => console.log(h))"
```

---

## ✅ Depois de Criar o Admin

1. Vá para: `http://localhost:3000/sign-in`
2. Clique na aba **👨‍💼 Staff**
3. Digite:
   - Email: `admin@niransushi.com`
   - Senha: `admin123`
4. Você será redirecionado para `/mesas`
5. Veja o mapa de mesas completo! 🎉

---

## 🔑 Credenciais de Teste

| Tipo    | Email                  | Senha      |
| ------- | ---------------------- | ---------- |
| Admin   | admin@niransushi.com   | admin123   |
| Garçom  | garcom@niransushi.com  | garcom123  |
| Gerente | gerente@niransushi.com | gerente123 |

**Roles disponíveis:** `admin`, `gerente`, `garcom`, `motoboy`

---

## ❓ Problema: "Email já está em uso"

Se receber este erro, significa que o email já existe. Tente:

```bash
curl -X POST http://localhost:3000/api/auth/register-staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste2",
    "email": "admin2@niransushi.com",
    "password": "admin123",
    "role": "admin"
  }'
```

---

## ❓ Problema: "Erro ao criar usuário staff"

Verifique:

1. DATABASE_URL está correto no `.env.local`
2. Tabela `users` existe no banco
3. Coluna `password_hash` existe em `users` (rode: `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;`)

---

**Feito? Agora teste o login!**
