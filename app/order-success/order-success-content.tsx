'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, Package, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderData {
  id: string;
  customer_id: string;
  address_id: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
  notes: string | null;
}

interface OrderItemData {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  notes: string | null;
}

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export default function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItemData[]>([]);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        if (!orderId) throw new Error('ID do pedido não encontrado');

        // Buscar pedido
        const orderRes = await fetch(`/api/pedidos/${orderId}`);
        if (!orderRes.ok) throw new Error('Erro ao carregar pedido');
        const orderData = await orderRes.json();
        setOrder(orderData);

        // Buscar itens do pedido
        const itemsRes = await fetch(`/api/pedidos/${orderId}/itens`);
        if (!itemsRes.ok) throw new Error('Erro ao carregar itens');
        const itemsData = await itemsRes.json();
        setItems(itemsData);

        // Buscar dados do cliente
        const customerRes = await fetch(
          `/api/clientes/${orderData.customer_id}`,
        );
        if (!customerRes.ok) throw new Error('Erro ao carregar cliente');
        const customerData = await customerRes.json();
        setCustomer(customerData);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do pedido',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [orderId, toast]);

  // Contagem regressiva
  useEffect(() => {
    if (countdown === 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

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
          <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
          <Button onClick={() => router.push('/')}>Voltar para home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Sucesso */}
        <div className="text-center mb-8 animate-bounce">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Seu pedido foi recebido com sucesso
          </p>
          <Badge className="bg-green-500 text-white">
            #{orderId?.slice(0, 8).toUpperCase()}
          </Badge>
        </div>

        {/* Info Principal */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pedido */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold">Seu Pedido</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-slate-600 dark:text-slate-400">
                  Status
                </span>
                <Badge className="capitalize">
                  {order.status === 'pendente'
                    ? 'Pendente'
                    : order.status === 'confirmado'
                      ? 'Confirmado'
                      : order.status === 'em_preparo'
                        ? 'Em Preparo'
                        : order.status === 'saindo'
                          ? 'Saindo para entrega'
                          : 'Entregue'}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Itens
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-semibold">
                        R$ {(item.product_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {order.subtotal.toFixed(2)}</span>
                </div>
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Taxa de entrega:</span>
                    <span>R$ {order.delivery_fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600 dark:text-green-400">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Cliente e Entrega */}
          <div className="space-y-6">
            {customer && (
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Dados do cliente</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Nome</p>
                    <p className="font-semibold">{customer.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Telefone
                    </p>
                    <p className="font-semibold">{customer.phone}</p>
                  </div>
                  {customer.email && (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Email
                      </p>
                      <p className="font-semibold break-all">
                        {customer.email}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-blue-500" />
                <h2 className="font-semibold">Próximas etapas</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                      ✓
                    </div>
                    <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700" />
                  </div>
                  <div>
                    <p className="font-semibold">Pedido confirmado</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      ⏱
                    </div>
                    <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700" />
                  </div>
                  <div>
                    <p className="font-semibold">Em preparo</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      A cozinha está preparando seu pedido
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      🚗
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">Saindo para entrega</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Seu pedido será entregue em breve
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Botões */}
        <div className="space-y-3">
          <Button onClick={() => router.push('/')} size="lg" className="w-full">
            Continuar comprando
          </Button>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Redirecionando para home em {countdown}s
          </p>
        </div>

        {/* Info */}
        <Card className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            Um e-mail de confirmação foi enviado para seu endereço cadastrado.
            Acompanhe o status do seu pedido na página de rastreamento.
          </p>
        </Card>
      </div>
    </div>
  );
}
