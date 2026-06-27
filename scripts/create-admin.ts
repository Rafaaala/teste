#!/usr/bin/env node
/**
 * Script para criar usuário Admin no banco de dados
 * Usage: npm run create-admin
 */

const bcrypt = require("bcrypt");
const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não está definida em .env.local");
  process.exit(1);
}

async function createAdmin() {
  const sql = neon(process.env.DATABASE_URL);

  const email = "admin@niransushi.com";
  const password = "admin123";
  const name = "Administrador";
  const role = "admin";

  try {
    console.log("🔄 Gerando hash de senha...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🔄 Criando usuário admin no banco...");
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role, is_active, created_at)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, true, NOW())
      RETURNING id, name, email, role, created_at
    `;

    if (result.length === 0) {
      throw new Error("Nenhum resultado retornado");
    }

    const user = result[0] as any;

    console.log("\n✅ Admin criado com sucesso!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Dados do Admin:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`ID:       ${user.id}`);
    console.log(`Nome:     ${user.name}`);
    console.log(`Email:    ${user.email}`);
    console.log(`Role:     ${user.role}`);
    console.log(`Criado:   ${user.created_at}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🔐 Credenciais:");
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}\n`);

    console.log("🚀 Próximos passos:");
    console.log("   1. Abra http://localhost:3000/sign-in");
    console.log('   2. Clique na aba "👨‍💼 Staff"');
    console.log(`   3. Email: ${email}`);
    console.log(`   4. Senha: ${password}`);
    console.log("   5. Você será redirecionado para /mesas\n");
  } catch (error) {
    console.error("❌ Erro ao criar admin:");
    console.error((error as any).message);

    if ((error as any).message.includes("unique")) {
      console.error("\n💡 Email já existe. Tente outro email.");
      console.error(
        "   Ou execute: DELETE FROM users WHERE email = 'admin@niransushi.com';",
      );
    }

    process.exit(1);
  }
}

createAdmin();
