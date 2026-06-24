// app/api/tables/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/database";
import {
  getActiveTables,
  getAllTables,
  createTable,
} from "@/lib/database/queries/tables";
import type { CreateTableInput, TableWithSessionInfo } from "@/types/database";
import { TABLE_STATUSES } from "@/lib/database/queries/tables";

// GET /api/tables
// Query param ?all=true retorna inativas também (admin)
// Query param ?with-sessions=true retorna com informações de sessão
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const withSessions = searchParams.get("with-sessions") === "true";

    if (withSessions) {
      // Retorna mesas com informações de sessão
      const tables = await sql<TableWithSessionInfo[]>`
        SELECT 
          t.id,
          t.number,
          t.capacity,
          t.status,
          s.id as session_id,
          s.status as session_status,
          s.guest_count as session_guest_count,
          s.opened_at as session_opened_at,
          s.subtotal,
          CAST(COUNT(si.id) as INTEGER) as item_count,
          CAST(EXTRACT(EPOCH FROM (NOW() - s.opened_at)) / 60 as INTEGER) as occupancy_time_minutes
        FROM tables t
        LEFT JOIN sessions s ON s.table_id = t.id AND s.status != 'fechada'
        LEFT JOIN session_items si ON si.session_id = s.id AND si.status != 'cancelado'
        WHERE t.is_active = true
        GROUP BY t.id, s.id
        ORDER BY t.number ASC
      `;
      return NextResponse.json(tables);
    }

    const tables = all ? await getAllTables() : await getActiveTables();

    return NextResponse.json(tables);
  } catch (error) {
    console.error("[GET /api/tables]", error);
    return NextResponse.json(
      { error: "Erro ao buscar mesas" },
      { status: 500 },
    );
  }
}

// POST /api/tables
export async function POST(req: Request) {
  try {
    const body: CreateTableInput = await req.json();

    if (!body.number || body.number <= 0) {
      return NextResponse.json(
        { error: "Número da mesa é obrigatório e deve ser maior que zero" },
        { status: 400 },
      );
    }

    if (!body.capacity || body.capacity <= 0) {
      return NextResponse.json(
        { error: "Capacidade é obrigatória e deve ser maior que zero" },
        { status: 400 },
      );
    }

    if (body.status && !TABLE_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Status inválido. Use: livre, ocupada ou reservada" },
        { status: 400 },
      );
    }

    const table = await createTable(body);
    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tables]", error);
    return NextResponse.json({ error: "Erro ao criar mesa" }, { status: 500 });
  }
}
