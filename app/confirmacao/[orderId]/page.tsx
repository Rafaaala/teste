"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Package,
  Truck,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderData {
  id: string;
  customer_id: string;
  address_id: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status:
    | "pendente"
    | "confirmado"
    | "em_preparo"
    | "saindo"
    | "entregue"
    | "cancelado";
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  preparing_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
}

interface OrderItemData {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  notes: string | null;
  status: "pendente" | "em_preparo" | "pronto" | "cancelado";
}

interface AddressData {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

const statusConfig = {
  pendente: {
    label: "Pendente",
    color: "bg-slate-500",
    icon: Clock,
  },
  confirmado: {
    label: "Confirmado",
    color: "bg-blue-500",
    icon: CheckCircle2,
  },
  em_preparo: {
    label: "Em Preparo",
    color: "bg-orange-500",
    icon: Package,
  },
  saindo: {
    label: "Saindo para entrega",
    color: "bg-purple-500",
    icon: Truck,
  },
  entregue: {
    label: "Entregue",
    color: "bg-green-500",
    icon: CheckCircle2,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-500",
    icon: AlertTriangle,
  },
};

export default function ConfirmacaoPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItemData[]>([]);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        if (!orderId) throw new Error("ID do pedido não encontrado");

        // Buscar pedido
        const orderRes = await fetch(`/api/pedidos/${orderId}`);
        if (!orderRes.ok) throw new Error("Erro ao carregar pedido");
        const orderData = await orderRes.json();
        setOrder(orderData);

        // Buscar itens
        const itemsRes = await fetch(`/api/pedidos/${orderId}/itens`);
        if (!itemsRes.ok) throw new Error("Erro ao carregar itens");
        const itemsData = await itemsRes.json();
        setItems(itemsData);

        // Buscar endereço
        const addressRes = await fetch(
          `/api/enderecos/${orderData.address_id}`,
        );
        if (!addressRes.ok) throw new Error("Erro ao carregar endereço");
        const addressData = await addressRes.json();
        setAddress(addressData);
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do pedido",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [orderId, toast]);

  // Auto-refresh a cada 10 segundos enquanto está em preparo/saindo
  useEffect(() => {
    if (
      !isAutoRefreshing ||
      order?.status === "entregue" ||
      order?.status === "cancelado"
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pedidos/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (error) {
        console.error(error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId, isAutoRefreshing, order?.status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
          <Button onClick={() => router.push("/")}>Voltar para home</Button>
        </Card>
      </div>
    );
  }

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  const timeline = [
    {
      label: "Pedido criado",
      completed: !!order.created_at,
      date: order.created_at,
    },
    {
      label: "Confirmado",
      completed: !!order.confirmed_at,
      date: order.confirmed_at,
    },
    {
      label: "Em preparo",
      completed: !!order.preparing_at,
      date: order.preparing_at,
    },
    {
      label: "Saindo para entrega",
      completed: !!order.dispatched_at,
      date: order.dispatched_at,
    },
    {
      label: "Entregue",
      completed: !!order.delivered_at,
      date: order.delivered_at,
    },
  ];

  const addressText = address
    ? `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zip_code}`
    : "Endereço não disponível";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Voltar
          </Button>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">
              Pedido #{orderId?.slice(0, 8).toUpperCase()}
            </h1>
            <Badge className={`${config.color} text-white text-lg px-4 py-2`}>
              {config.label}
            </Badge>
          </div>

          <p className="text-slate-600 dark:text-slate-400">
            Pedido realizado em{" "}
            {new Date(order.created_at).toLocaleString("pt-BR")}
          </p>
        </div>

        {/* Status atual */}
        <Card className={`p-6 mb-8 ${config.color} text-white`}>
          <div className="flex items-center gap-4">
            <StatusIcon className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">{config.label}</h2>
              <p className="opacity-90">
                {order.status === "pendente"
                  ? "Seu pedido está pendente de confirmação"
                  : order.status === "confirmado"
                    ? "Seu pedido foi confirmado"
                    : order.status === "em_preparo"
                      ? "Seu pedido está sendo preparado"
                      : order.status === "saindo"
                        ? "Seu pedido está saindo para entrega"
                        : order.status === "entregue"
                          ? "Seu pedido foi entregue!"
                          : "Seu pedido foi cancelado"}
              </p>
            </div>
          </div>
        </Card>

        {/* Conteúdo em abas */}
        <Tabs defaultValue="timeline" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="itens">Itens</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          </TabsList>

          {/* Timeline */}
          <TabsContent value="timeline">
            <Card className="p-8">
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          item.completed
                            ? "bg-green-500"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      >
                        {item.completed ? "✓" : index + 1}
                      </div>
                      {index < timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-12 my-2 ${
                            item.completed
                              ? "bg-green-500"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                      )}
                    </div>
                    <div className="py-1">
                      <p className="font-semibold">{item.label}</p>
                      {item.date && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(item.date).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Itens */}
          <TabsContent value="itens">
            <Card className="p-6">
              <div className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400">
                    Nenhum item no pedido
                  </p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">
                            {item.quantity}x {item.product_name}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Obs: {item.notes}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                      <p className="text-right font-semibold">
                        R$ {(item.product_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Detalhes */}
          <TabsContent value="detalhes">
            <div className="space-y-6">
              {/* Endereço de entrega */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço de entrega
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {addressText}
                </p>
              </Card>

              {/* Resumo financeiro */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Resumo do pedido</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Subtotal
                    </span>
                    <span>R$ {order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.delivery_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Taxa de entrega
                      </span>
                      <span>R$ {order.delivery_fee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600 dark:text-green-400">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Observações */}
              {order.notes && (
                <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2">Observações</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    {order.notes}
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Ações */}
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push("/")}>Voltar para home</Button>
          {order.status !== "entregue" && order.status !== "cancelado" && (
            <Button
              variant="outline"
              onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
            >
              {isAutoRefreshing
                ? "Pausar auto-atualização"
                : "Retomar auto-atualização"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
