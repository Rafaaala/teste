"use client";

import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Clock, Users, AlertCircle } from "lucide-react";
import type { TableWithSessionInfo } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface SessionDetail {
  id: string;
  status: "aberta" | "fechamento_solicitado" | "fechada";
  guest_count: number;
  subtotal: number;
  service_fee: number;
  total: number;
  notes: string | null;
  opened_at: string;
  close_requested_at: string | null;
  items: Array<{
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    notes: string | null;
    status: "pendente" | "em_preparo" | "pronto" | "cancelado";
  }>;
}

interface TableDetailModalProps {
  table: TableWithSessionInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (tableId: string) => void;
}

export function TableDetailModal({
  table,
  isOpen,
  onClose,
  onStatusChange,
}: TableDetailModalProps) {
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && table?.session_id) {
      loadSessionDetail();
    }
  }, [isOpen, table?.session_id]);

  const loadSessionDetail = async () => {
    if (!table?.session_id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sessions/${table.session_id}`);
      if (!response.ok) throw new Error("Erro ao carregar detalhes");
      const data = await response.json();
      setSessionDetail(data);
      setNotes(data.notes || "");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da sessão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!table?.session_id) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/sessions/${table.session_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status:
            status === "close_request" ? "fechamento_solicitado" : "aberta",
          notes,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      const updated = await response.json();
      setSessionDetail(updated);
      setNewStatus("");
      toast({
        title: "Sucesso",
        description: "Status da mesa atualizado",
      });
      onStatusChange?.(table.id);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseAccount = async () => {
    if (!table?.session_id) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/sessions/${table.session_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "fechada",
          notes,
        }),
      });

      if (!response.ok) throw new Error("Erro ao fechar conta");

      toast({
        title: "Sucesso",
        description: "Conta fechada e mesa liberada",
      });
      onStatusChange?.(table.id);
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível fechar a conta",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!table) return null;

  const occupancyMinutes = table.occupancy_time_minutes || 0;
  const hours = Math.floor(occupancyMinutes / 60);
  const minutes = occupancyMinutes % 60;
  const occupancyDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle>Mesa #{table.number}</AlertDialogTitle>
            <Badge className="text-lg">Cap: {table.capacity}</Badge>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Status e info básica */}
              {sessionDetail && (
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold">
                      {sessionDetail.status === "aberta"
                        ? "Aberta"
                        : sessionDetail.status === "fechamento_solicitado"
                          ? "Fechamento Solicitado"
                          : "Fechada"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hóspedes</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {sessionDetail.guest_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tempo de ocupação
                    </p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {occupancyDisplay}
                    </p>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : sessionDetail ? (
                <div className="space-y-4">
                  <Separator />

                  {/* Pedidos */}
                  <div>
                    <h3 className="font-semibold mb-3">Pedidos</h3>
                    {sessionDetail.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum item na comanda
                      </p>
                    ) : (
                      <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                        {sessionDetail.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-start"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {item.quantity}x {item.product_name}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-muted-foreground">
                                  Obs: {item.notes}
                                </p>
                              )}
                              <Badge variant="outline" className="mt-1 text-xs">
                                {item.status}
                              </Badge>
                            </div>
                            <p className="font-semibold text-sm">
                              R${" "}
                              {(item.product_price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Totais */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>R$ {sessionDetail.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de serviço:</span>
                      <span>R$ {sessionDetail.service_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>R$ {sessionDetail.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Observações */}
                  <div>
                    <label className="text-sm font-medium">Observações</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Adicione observações..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  {/* Ações */}
                  {sessionDetail.status !== "fechada" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">
                          Alterar status
                        </label>
                        <div className="flex gap-2 mt-2">
                          <Select
                            value={newStatus}
                            onValueChange={setNewStatus}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">
                                Manter Aberta
                              </SelectItem>
                              <SelectItem value="close_request">
                                Solicitar Fechamento
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {newStatus && (
                            <Button
                              onClick={() => handleStatusChange(newStatus)}
                              disabled={isUpdating}
                              size="sm"
                            >
                              {isUpdating && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Atualizar
                            </Button>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={handleCloseAccount}
                        disabled={isUpdating}
                        className="w-full"
                        variant="destructive"
                      >
                        {isUpdating && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Fechar Conta
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 py-4">
                  <AlertCircle className="h-4 w-4" />
                  <span>Mesa disponível - sem sessão ativa</span>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
