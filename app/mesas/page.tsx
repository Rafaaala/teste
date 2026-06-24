"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Plus, Search } from "lucide-react";
import type { TableWithSessionInfo } from "@/types/database";
import { TableGrid } from "@/components/table-grid";
import { TableDetailModal } from "@/components/table-detail-modal";
import { useToast } from "@/hooks/use-toast";

const REFRESH_INTERVAL = 20000; // 20 segundos

export default function MesasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [tables, setTables] = useState<TableWithSessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] =
    useState<TableWithSessionInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Verificar autenticação
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    // Verificar se tem permissão (garçom, caixa ou admin)
    if (
      session?.user &&
      !["garcom", "caixa", "admin"].includes(session.user.role || "")
    ) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [status, session, router, toast]);

  // Carregar mesas
  const loadTables = useCallback(async () => {
    try {
      const response = await fetch("/api/tables?with-sessions=true");
      if (!response.ok) throw new Error("Erro ao carregar mesas");
      const data = await response.json();
      setTables(data);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mesas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Carregamento inicial
  useEffect(() => {
    if (status === "authenticated") {
      loadTables();
    }
  }, [status, loadTables]);

  // Auto-refresh a cada 20 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      loadTables();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loadTables]);

  const handleTableClick = (table: TableWithSessionInfo) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleStatusChange = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
    loadTables();
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadTables();
  };

  // Filtrar mesas por número
  const filteredTables = tables.filter((table) =>
    table.number.toString().includes(searchQuery),
  );

  // Contar status
  const statusCounts = {
    livre: tables.filter((t) => !t.session_id).length,
    ocupada: tables.filter((t) => t.session_id && t.session_status === "aberta")
      .length,
    fechamento: tables.filter(
      (t) => t.session_id && t.session_status === "fechamento_solicitado",
    ).length,
    reservada: tables.filter((t) => t.status === "bloqueada").length,
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Mapa de Mesas
              </h1>
              <p className="text-slate-400">
                Gerenciamento de mesas - Niran Sushi
              </p>
            </div>
            <Button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              size="lg"
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Livres",
                count: statusCounts.livre,
                color: "bg-green-500",
              },
              {
                label: "Ocupadas",
                count: statusCounts.ocupada,
                color: "bg-red-500",
              },
              {
                label: "Fechamento",
                count: statusCounts.fechamento,
                color: "bg-amber-500",
              },
              {
                label: "Reservadas",
                count: statusCounts.reservada,
                color: "bg-blue-500",
              },
            ].map((status) => (
              <Card
                key={status.label}
                className="p-4 bg-slate-800 border-slate-700"
              >
                <div className={`h-2 w-8 rounded-full ${status.color} mb-2`} />
                <p className="text-sm text-slate-400">{status.label}</p>
                <p className="text-2xl font-bold text-white">{status.count}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar mesa por número..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Mesas Grid */}
        {filteredTables.length === 0 ? (
          <Card className="p-12 text-center bg-slate-800 border-slate-700">
            <p className="text-slate-400 mb-4">
              {searchQuery
                ? "Nenhuma mesa encontrada"
                : "Nenhuma mesa cadastrada"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push("/admin/mesas/nova")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Mesa
              </Button>
            )}
          </Card>
        ) : (
          <TableGrid
            tables={filteredTables}
            onTableClick={handleTableClick}
            isLoading={false}
          />
        )}

        {/* Footer Info */}
        {lastRefreshTime && (
          <div className="mt-8 text-center text-sm text-slate-500">
            Atualizado às {lastRefreshTime.toLocaleTimeString("pt-BR")}
            <br />
            Auto-atualização a cada {REFRESH_INTERVAL / 1000} segundos
          </div>
        )}
      </div>

      {/* Modal */}
      <TableDetailModal
        table={selectedTable}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTable(null);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
