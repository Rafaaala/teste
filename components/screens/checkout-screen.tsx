"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Loader2,
  Hash,
  MapPin,
  Package,
  Receipt,
  Truck,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/notifications";
import { useSession } from "next-auth/react";
import type { CartItem } from "@/lib/data";

interface CheckoutScreenProps {
  onBack: () => void;
  onPaymentCreated?: (payload: PaymentNavigationPayload) => void;
}

export interface PaymentNavigationPayload {
  orderId: string;
  paymentId?: string;
  paymentMethod: PaymentMethod;
  status: "aguardando" | "pago" | "expirado" | "erro";
  total: number;
  expiresAt?: string;
  qrCode?: string;
  qrCodeText?: string;
}

type DeliveryMethod = "delivery" | "pickup";

type PaymentMethod = "pix" | "credit" | "debit" | "cash";

const deliveryOptions: Array<{
  id: DeliveryMethod;
  title: string;
  description: string;
  icon: typeof Truck | typeof Package;
}> = [
  {
    id: "delivery",
    title: "Entrega",
    description: "Receba no endereço escolhido",
    icon: Truck,
  },
  {
    id: "pickup",
    title: "Retirada no local",
    description: "Buscar no restaurante",
    icon: Package,
  },
];

const paymentMethods: Array<{
  id: PaymentMethod;
  title: string;
  description: string;
  icon:
    | typeof CreditCard
    | typeof DollarSign
    | typeof Hash
    | typeof CheckCircle2;
}> = [
  {
    id: "pix",
    title: "PIX",
    description: "Pagamento rápido pelo app",
    icon: Hash,
  },
  {
    id: "credit",
    title: "Cartão de Crédito",
    description: "Parcelar em até 3x",
    icon: CreditCard,
  },
  {
    id: "debit",
    title: "Cartão de Débito",
    description: "Pagamento instantâneo",
    icon: CreditCard,
  },
  {
    id: "cash",
    title: "Dinheiro",
    description: "Troco na entrega",
    icon: DollarSign,
  },
];

export function CheckoutScreen({ onBack }: CheckoutScreenProps) {
  const { items, totalItems, totalPrice } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<{
    type: "idle" | "success" | "error" | "loading";
    message: string;
  }>({
    type: "idle",
    message: "",
  });
  const [address, setAddress] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [checkoutState, setCheckoutState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [paymentPayload, setPaymentPayload] =
    useState<PaymentNavigationPayload | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{
    qrCode: string;
    qrCodeText: string;
    expiresAt: string;
  } | null>(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const submitLockRef = useRef(false);

  const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 8);

  const formatCep = (value: string) => {
    const digits = onlyDigits(value);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  useEffect(() => {
    const cepDigits = onlyDigits(address.cep);

    if (!cepDigits) {
      setCepStatus({ type: "idle", message: "" });
      setCepLoading(false);
      return;
    }

    if (cepDigits.length < 8) {
      setCepStatus({
        type: "error",
        message: "CEP inválido. Use 8 dígitos.",
      });
      setCepLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAddress = async () => {
      setCepLoading(true);
      setCepStatus({
        type: "loading",
        message: "Buscando endereço pelo CEP...",
      });

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepDigits}/json/`,
        );

        if (!response.ok) {
          throw new Error("Falha ao consultar o CEP");
        }

        const data = await response.json();

        if (cancelled) return;

        if (data.erro) {
          setCepStatus({
            type: "error",
            message: "CEP não encontrado.",
          });
          return;
        }

        setAddress((current) => ({
          ...current,
          street: data.logradouro || current.street,
          neighborhood: data.bairro || current.neighborhood,
          city: data.localidade || current.city,
          state: data.uf || current.state,
        }));

        setCepStatus({
          type: "success",
          message: "Endereço preenchido automaticamente.",
        });
      } catch {
        if (!cancelled) {
          setCepStatus({
            type: "error",
            message: "Não foi possível buscar o CEP agora.",
          });
        }
      } finally {
        if (!cancelled) {
          setCepLoading(false);
        }
      }
    };

    const timeout = window.setTimeout(fetchAddress, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [address.cep]);

  const discount = useMemo(() => {
    if (appliedCoupon === "NIRAN10") {
      return 8.5;
    }
    return 0;
  }, [appliedCoupon]);

  const deliveryFee = deliveryMethod === "delivery" ? 8.5 : 0;
  const subtotal = totalPrice;
  const total = subtotal + deliveryFee - discount;
  const customerId = (session?.user as any)?.id as string | undefined;
  const [guestPhone, setGuestPhone] = useState("");
  const [guestName, setGuestName] = useState("");
  const [customerIdentified, setCustomerIdentified] = useState(false);

  const formatMoney = (value: number) =>
    `R$ ${value.toFixed(2).replace(".", ",")}`;

  const formatDateTime = (value: string | Date) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const calculatePaymentExpiration = (expiresAt?: string) => {
    if (!expiresAt) return 0;
    return Math.max(
      0,
      Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
    );
  };

  const [paymentCountdown, setPaymentCountdown] = useState(0);

  useEffect(() => {
    if (!paymentInfo?.expiresAt) return;

    setPaymentCountdown(calculatePaymentExpiration(paymentInfo.expiresAt));
    const interval = window.setInterval(() => {
      setPaymentCountdown(calculatePaymentExpiration(paymentInfo.expiresAt));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [paymentInfo?.expiresAt]);

  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      setCouponMessage("Digite um código válido");
      return;
    }

    if (coupon.trim().toUpperCase() === "NIRAN10") {
      setAppliedCoupon("NIRAN10");
      setCouponMessage("Cupom aplicado com sucesso");
      return;
    }

    setAppliedCoupon(null);
    setCouponMessage("Cupom inválido");
  };

  const parseNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits ? Number(digits) : 0;
  };

  const buildAddressPayload = () => ({
    customer_id: customerId,
    zip_code: address.cep,
    street: address.street,
    number: address.number,
    complement: address.complement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
  });

  
  const handleCreateCheckout = async () => {
    if (submitLockRef.current || checkoutState === "loading") return;


    if (
      !address.cep ||
      !address.street ||
      !address.number ||
      !address.neighborhood ||
      !address.city ||
      !address.state
    ) {
      setCheckoutState("error");
      setCheckoutMessage("Preencha o endereço antes de continuar.");
      notifyError("addressFetchError");
      return;
    }

    submitLockRef.current = true;
    setCheckoutState("loading");
    setCheckoutMessage("Criando pedido...");
    notifyInfo("awaitingConfirmation");

    try {
      const addressResponse = await fetch("/api/enderecos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildAddressPayload(),
          // customer_id: finalCustomerId,
        }),
      });

      if (!addressResponse.ok) {
        const data = await addressResponse.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao criar endereço");
      }

      const savedAddress = await addressResponse.json();
      notifySuccess("addressSaved");

      const orderResponse = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // customer_id: finalCustomerId, // ou null, dependendo do backend
          customer_name: guestName,
          customer_phone: guestPhone,
          address_id: savedAddress.id,
          subtotal,
          delivery_fee: deliveryFee,
          notes: notes.trim() || undefined,
        }),
      });

      if (!orderResponse.ok) {
        const data = await orderResponse.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao criar pedido");
      }

      const order = await orderResponse.json();

      const itemsResponse = await Promise.all(
        items.map((item: CartItem) =>
          fetch(`/api/pedidos/${order.id}/itens`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_id: String(item.id),
              quantity: item.quantity,
              notes: null,
            }),
          }),
        ),
      );

      if (itemsResponse.some((response) => !response.ok)) {
        throw new Error("Falha ao adicionar itens ao pedido");
      }

      notifySuccess("orderCreated");

      if (paymentMethod === "pix") {
        const paymentResponse = await fetch("/api/pagamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: order.id,
            method: "pix",
          }),
        });

        if (!paymentResponse.ok) {
          const data = await paymentResponse.json().catch(() => ({}));
          throw new Error(data.error || "Falha no pagamento");
        }

        const payment = await paymentResponse.json();
        setPaymentInfo({
          qrCode: payment.qrCode,
          qrCodeText: payment.qrCodeText,
          expiresAt: new Date(payment.expiresAt).toISOString(),
        });
        const payload: PaymentNavigationPayload = {
          orderId: order.id,
          paymentId: payment.paymentId,
          paymentMethod: "pix",
          status: "aguardando",
          total,
          expiresAt: new Date(payment.expiresAt).toISOString(),
          qrCode: payment.qrCode,
          qrCodeText: payment.qrCodeText,
        };
        setPaymentPayload(payload);
        setCheckoutState("success");
        setCheckoutMessage("PIX gerado com sucesso");
        notifyInfo("paymentProcessing");
        router.push(`/pagamento-pix?orderId=${order.id}`);
        return;
      }

      const payload: PaymentNavigationPayload = {
        orderId: order.id,
        paymentMethod,
        status: "pago",
        total,
      };
      setPaymentPayload(payload);
      setCheckoutState("success");
      setCheckoutMessage("Pedido criado com sucesso");
      notifySuccess("paymentApproved");
      router.push(`/order-success?orderId=${order.id}`);
    } catch (error) {
      console.error(error);
      setCheckoutState("error");
      setCheckoutMessage(
        error instanceof Error ? error.message : "Falha ao processar o pedido",
      );
      notifyError("orderCreationError");
    } finally {
      submitLockRef.current = false;
    }
  };

  useEffect(() => {
    if (
      !paymentInfo?.expiresAt ||
      !paymentPayload?.orderId ||
      paymentMethod !== "pix"
    ) {
      return;
    }

    let cancelled = false;
    let intervalId: number | undefined;

    const pollPayment = async () => {
      if (cancelled) return;

      try {
        setPaymentPolling(true);
        const response = await fetch(
          `/api/pagamentos/${paymentPayload.orderId}`,
        );
        if (!response.ok) return;

        const data = await response.json();

        if (data.status === "confirmado") {
          router.push(`/order-success?orderId=${paymentPayload.orderId}`);
          return;
        }

        if (data.status === "expirado") {
          setCheckoutState("error");
          setCheckoutMessage("O tempo para pagamento expirou.");
          return;
        }
      } catch {
        setCheckoutState("error");
      } finally {
        setPaymentPolling(false);
      }
    };

    void pollPayment();
    intervalId = window.setInterval(() => {
      void pollPayment();
    }, 5000);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [paymentInfo?.expiresAt, paymentPayload?.orderId, paymentMethod, router]);

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-card px-4 pb-4 pt-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="mt-4 text-xl font-bold text-foreground">
            Finalizar Pedido
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione itens ao carrinho antes de concluir seu pedido.
          </p>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-card shadow-sm">
            <MapPin className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Nenhum item no checkout
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Volte ao carrinho para selecionar os pratos e confirmar seu pedido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-card px-4 pb-4 pt-10">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/70 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h1 className="text-xl font-semibold text-foreground">
                Finalizar Pedido
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-40 pt-4">
        <section className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold">
                Identificação do pedido
              </p>

              <p className="text-sm text-muted-foreground">
                Informe seu nome e telefone para identificarmos o pedido.
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <label>Nome</label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label>Telefone</label>
                <Input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="(83) 99999-9999"
                />
              </div>
            </div>
          </div>

          {customerIdentified && (
            <div className="rounded-3xl border border-emerald-500 bg-emerald-500/10 p-4 shadow-sm flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                  {guestName}
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-400">
                  {guestPhone}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Endereço de entrega
                </p>
                <p className="text-sm text-muted-foreground">
                  Preencha o CEP e complete os demais campos.
                </p>
              </div>
              {cepLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando CEP
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  CEP
                </label>
                <Input
                  value={formatCep(address.cep)}
                  onChange={(event) =>
                    setAddress((current) => ({
                      ...current,
                      cep: onlyDigits(event.target.value),
                    }))
                  }
                  inputMode="numeric"
                  placeholder="00000-000"
                  maxLength={9}
                />
                {cepStatus.message ? (
                  <p
                    className={cn(
                      "mt-2 flex items-center gap-2 text-xs",
                      cepStatus.type === "error" && "text-destructive",
                      cepStatus.type === "success" &&
                        "text-emerald-600 dark:text-emerald-400",
                      cepStatus.type === "loading" && "text-muted-foreground",
                    )}
                  >
                    {cepStatus.type === "error" ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : null}
                    {cepStatus.message}
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-1">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Número
                </label>
                <Input
                  value={address.number}
                  onChange={(event) =>
                    setAddress((current) => ({
                      ...current,
                      number: event.target.value,
                    }))
                  }
                  placeholder="123"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Rua
                </label>
                <Input
                  value={address.street}
                  onChange={(event) =>
                    setAddress((current) => ({
                      ...current,
                      street: event.target.value,
                    }))
                  }
                  placeholder="Rua, avenida, travessa..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Complemento
                </label>
                <Input
                  value={address.complement}
                  onChange={(event) =>
                    setAddress((current) => ({
                      ...current,
                      complement: event.target.value,
                    }))
                  }
                  placeholder="Apartamento, bloco, referência..."
                />
              </div>

              <div className="md:col-span-1">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Bairro
                </label>
                <Input
                  value={address.neighborhood}
                  onChange={(event) =>
                    setAddress((current) => ({
                      ...current,
                      neighborhood: event.target.value,
                    }))
                  }
                  placeholder="Centro"
                />
              </div>

              <div className="md:col-span-1">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Estado
                </label>
                <Input
                  value={address.state}
                  onChange={(event) =>
                    setAddress((current) => ({
                      ...current,
                      state: event.target.value.toUpperCase().slice(0, 2),
                    }))
                  }
                  placeholder="PB"
                  maxLength={2}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Cidade
                </label>
                <Input
                  value={address.city}
                  onChange={(event) =>
                    setAddress((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                  placeholder="Itabaiana"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
              Você pode editar qualquer campo manualmente após o preenchimento.
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Método de Entrega
                </p>
                <p className="text-sm text-muted-foreground">
                  Escolha como deseja receber seu pedido
                </p>
              </div>
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {deliveryOptions.map((option) => {
                const Icon = option.icon;
                const selected = deliveryMethod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeliveryMethod(option.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-3xl border px-4 py-4 text-left transition",
                      selected
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/70 hover:shadow-sm",
                    )}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {option.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Forma de Pagamento
                </p>
                <p className="text-sm text-muted-foreground">
                  Selecione a opção que mais combina com você
                </p>
              </div>
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const selected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-3xl border px-4 py-4 text-left transition",
                      selected
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/70 hover:shadow-sm",
                    )}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {method.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Observações do Pedido
                </p>
                <p className="text-sm text-muted-foreground">
                  Adicione instruções para a cozinha ou entrega
                </p>
              </div>
            </div>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Exemplo: Sem cebola, enviar hashi e retirar molho"
              className="min-h-[6rem]"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-full border border-border px-3 py-1">
                Sem cebola
              </span>
              <span className="rounded-full border border-border px-3 py-1">
                Enviar hashi
              </span>
              <span className="rounded-full border border-border px-3 py-1">
                Retirar molho
              </span>
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Cupom de Desconto
                </p>
                <p className="text-sm text-muted-foreground">
                  Use um cupom e garanta um desconto especial
                </p>
              </div>
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
                placeholder="Código do cupom"
                className="rounded-2xl"
              />
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-2xl"
                onClick={handleApplyCoupon}
              >
                Aplicar
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {couponMessage || "Ex: NIRAN10"}
            </p>
          </div>

          <Card className="rounded-[2rem] border-border p-4 shadow-sm">
            <CardHeader className="px-0 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Resumo do Pedido</CardTitle>
                  <CardDescription>
                    Revise os valores antes de confirmar.
                  </CardDescription>
                </div>
                <div className="rounded-2xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {deliveryMethod === "delivery" ? "Entrega" : "Retirada"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Itens</span>
                  <span>{totalItems} produto(s)</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Taxa de entrega</span>
                  <span>
                    {deliveryFee > 0 ? formatMoney(deliveryFee) : "Grátis"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Descontos</span>
                  <span
                    className={
                      appliedCoupon
                        ? "text-emerald-400"
                        : "text-muted-foreground"
                    }
                  >
                    {appliedCoupon
                      ? `- ${formatMoney(discount)}`
                      : "Nenhum cupom"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-0 pt-4">
              <div className="flex w-full items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total estimado
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatMoney(total)}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {paymentMethod.toUpperCase()}
                </span>
              </div>
            </CardFooter>
          </Card>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/95 px-4 py-4 backdrop-blur-xl">
        <div className="app-container">
          <div className="app-bottom-nav-inner flex max-w-full flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatMoney(total)}
                </p>
              </div>
              <Button
                type="button"
                className="min-w-[46%] rounded-3xl py-5 text-base font-semibold"
                onClick={handleCreateCheckout}
                disabled={
                  checkoutState === "loading" 
                }
              >
                {checkoutState === "loading" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processando
                  </span>
                ) : (
                  "Confirmar Pedido"
                )}
              </Button>
            </div>
            {checkoutState === "error" && checkoutMessage ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {checkoutMessage}
              </div>
            ) : null}
            {paymentPolling ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Aguardando
                confirmação do pagamento
              </div>
            ) : null}
            <p className="text-center text-xs text-muted-foreground">
              Ao confirmar, seu pedido será enviado para preparo imediato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
