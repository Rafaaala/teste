"use client";

import React from "react";
import type { TableWithSessionInfo } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TableGridProps {
  tables: TableWithSessionInfo[];
  onTableClick: (table: TableWithSessionInfo) => void;
  isLoading?: boolean;
}

function getTablePresentationStatus(table: TableWithSessionInfo) {
  if (table.status === "bloqueada") return "reservada";
  if (!table.session_id) return "livre";
  if (table.session_status === "fechamento_solicitado")
    return "aguardando_fechamento";
  return "ocupada";
}

function getStatusColor(status: string): string {
  switch (status) {
    case "livre":
      return "bg-green-500 hover:bg-green-600";
    case "ocupada":
      return "bg-red-500 hover:bg-red-600";
    case "aguardando_fechamento":
      return "bg-amber-500 hover:bg-amber-600";
    case "reservada":
      return "bg-blue-500 hover:bg-blue-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "livre":
      return "Livre";
    case "ocupada":
      return "Ocupada";
    case "aguardando_fechamento":
      return "Fechamento";
    case "reservada":
      return "Reservada";
    default:
      return status;
  }
}

export function TableGrid({ tables, onTableClick, isLoading }: TableGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {tables.map((table) => {
        const presentationStatus = getTablePresentationStatus(table);
        const statusColor = getStatusColor(presentationStatus);
        const statusLabel = getStatusLabel(presentationStatus);

        return (
          <Card
            key={table.id}
            className={cn(
              "aspect-square flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-200 transform hover:scale-105",
              statusColor,
              "text-white shadow-lg",
            )}
            onClick={() => onTableClick(table)}
          >
            <div className="text-center space-y-2 w-full">
              {/* Número da mesa */}
              <div className="text-3xl font-bold">{table.number}</div>

              {/* Status */}
              <Badge variant="secondary" className="mx-auto text-xs">
                {statusLabel}
              </Badge>

              {/* Valor e itens (se ocupada) */}
              {table.session_id && (
                <div className="text-xs space-y-1">
                  <div className="font-semibold">
                    R$ {(table.subtotal ?? 0).toFixed(2)}
                  </div>
                  <div className="text-xs opacity-90">
                    {table.item_count}{" "}
                    {table.item_count === 1 ? "item" : "itens"}
                  </div>
                </div>
              )}

              {/* Capacidade */}
              <div className="text-xs opacity-75">Cap: {table.capacity}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
