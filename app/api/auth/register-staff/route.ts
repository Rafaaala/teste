// app/api/auth/register-staff/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sql } from "@/lib/database";

interface RegisterStaffBody {
  name: string;
  email: string;
  password: string;
  role: "admin" | "gerente" | "garcom" | "motoboy";
  createdByAdminToken?: string;
}

export async function POST(req: Request) {
  try {
    const body: RegisterStaffBody = await req.json();
    const { name, email, password, role } = body;

    // Validação básica
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 },
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 },
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 },
      );
    }

    const validRoles = ["admin", "gerente", "garcom", "motoboy"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Role inválido. Opções: admin, gerente, garcom, motoboy" },
        { status: 400 },
      );
    }

    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // Verificar se email já existe
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE email = ${normalizedEmail}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 409 },
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário no banco
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES (${name.trim()}, ${normalizedEmail}, ${hashedPassword}, ${role}, true)
      RETURNING id, name, email, role
    `;

    const user = result[0] as any;

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/auth/register-staff]", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário staff" },
      { status: 500 },
    );
  }
}
