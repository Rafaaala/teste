"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutScreen = CheckoutScreen;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var cart_context_1 = require("@/lib/cart-context");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var utils_1 = require("@/lib/utils");
var deliveryOptions = [
    {
        id: "delivery",
        title: "Entrega",
        description: "Receba no endereço escolhido",
        icon: lucide_react_1.Truck,
    },
    {
        id: "pickup",
        title: "Retirada no local",
        description: "Buscar no restaurante",
        icon: lucide_react_1.Package,
    },
];
var paymentMethods = [
    {
        id: "pix",
        title: "PIX",
        description: "Pagamento rápido pelo app",
        icon: lucide_react_1.Hash,
    },
    {
        id: "credit",
        title: "Cartão de Crédito",
        description: "Parcelar em até 3x",
        icon: lucide_react_1.CreditCard,
    },
    {
        id: "debit",
        title: "Cartão de Débito",
        description: "Pagamento instantâneo",
        icon: lucide_react_1.CreditCard,
    },
    {
        id: "cash",
        title: "Dinheiro",
        description: "Troco na entrega",
        icon: lucide_react_1.DollarSign,
    },
];
function CheckoutScreen(_a) {
    var onBack = _a.onBack;
    var _b = (0, cart_context_1.useCart)(), items = _b.items, totalItems = _b.totalItems, totalPrice = _b.totalPrice;
    var _c = (0, react_1.useState)("delivery"), deliveryMethod = _c[0], setDeliveryMethod = _c[1];
    var _d = (0, react_1.useState)("pix"), paymentMethod = _d[0], setPaymentMethod = _d[1];
    var _e = (0, react_1.useState)(""), notes = _e[0], setNotes = _e[1];
    var _f = (0, react_1.useState)(""), coupon = _f[0], setCoupon = _f[1];
    var _g = (0, react_1.useState)(null), appliedCoupon = _g[0], setAppliedCoupon = _g[1];
    var _h = (0, react_1.useState)(""), couponMessage = _h[0], setCouponMessage = _h[1];
    var discount = (0, react_1.useMemo)(function () {
        if (appliedCoupon === "NIRAN10") {
            return 8.5;
        }
        return 0;
    }, [appliedCoupon]);
    var deliveryFee = deliveryMethod === "delivery" ? 8.5 : 0;
    var subtotal = totalPrice;
    var total = subtotal + deliveryFee - discount;
    var formatMoney = function (value) {
        return "R$ ".concat(value.toFixed(2).replace(".", ","));
    };
    var handleApplyCoupon = function () {
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
    var handleConfirm = function () {
        if (items.length === 0) {
            return;
        }
        window.alert("Pedido confirmado! Obrigado pela compra.");
    };
    if (items.length === 0) {
        return (<div className="flex h-full flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-card px-4 pb-4 pt-10">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <lucide_react_1.ArrowLeft className="h-4 w-4"/> Voltar
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
            <lucide_react_1.MapPin className="h-10 w-10 text-muted-foreground"/>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Nenhum item no checkout
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Volte ao carrinho para selecionar os pratos e confirmar seu pedido.
          </p>
        </div>
      </div>);
    }
    return (<div className="flex h-full flex-col overflow-hidden">
      <header className="flex-shrink-0 bg-card px-4 pb-4 pt-10">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/70 hover:text-primary">
            <lucide_react_1.ArrowLeft className="h-4 w-4"/> Voltar
          </button>
          <div className="text-right">
            <h1 className="text-xl font-semibold text-foreground">Finalizar Pedido</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-40 pt-4">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Endereço de Entrega</p>
              <p className="mt-3 text-base font-bold text-foreground">
                Rua das Flores, 478
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                João Silva · Itabaiana, Centro
              </p>
            </div>
            <button_1.Button variant="outline" size="sm" onClick={function () { return alert("Alterar endereço"); }}>Alterar</button_1.Button>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Método de Entrega</p>
                <p className="text-sm text-muted-foreground">
                  Escolha como deseja receber seu pedido
                </p>
              </div>
              <lucide_react_1.Truck className="h-5 w-5 text-primary"/>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {deliveryOptions.map(function (option) {
            var Icon = option.icon;
            var selected = deliveryMethod === option.id;
            return (<button key={option.id} type="button" onClick={function () { return setDeliveryMethod(option.id); }} className={(0, utils_1.cn)("flex items-start gap-3 rounded-3xl border px-4 py-4 text-left transition", selected
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border bg-card hover:border-primary/70 hover:shadow-sm")}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5"/>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {option.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>);
        })}
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Forma de Pagamento</p>
                <p className="text-sm text-muted-foreground">
                  Selecione a opção que mais combina com você
                </p>
              </div>
              <lucide_react_1.CreditCard className="h-5 w-5 text-primary"/>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map(function (method) {
            var Icon = method.icon;
            var selected = paymentMethod === method.id;
            return (<button key={method.id} type="button" onClick={function () { return setPaymentMethod(method.id); }} className={(0, utils_1.cn)("flex items-start gap-3 rounded-3xl border px-4 py-4 text-left transition", selected
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border bg-card hover:border-primary/70 hover:shadow-sm")}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5"/>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {method.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </button>);
        })}
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Observações do Pedido</p>
                <p className="text-sm text-muted-foreground">
                  Adicione instruções para a cozinha ou entrega
                </p>
              </div>
            </div>
            <textarea_1.Textarea value={notes} onChange={function (event) { return setNotes(event.target.value); }} placeholder="Exemplo: Sem cebola, enviar hashi e retirar molho" className="min-h-[6rem]"/>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-full border border-border px-3 py-1">Sem cebola</span>
              <span className="rounded-full border border-border px-3 py-1">Enviar hashi</span>
              <span className="rounded-full border border-border px-3 py-1">Retirar molho</span>
            </div>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm border border-border">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Cupom de Desconto</p>
                <p className="text-sm text-muted-foreground">
                  Use um cupom e garanta um desconto especial
                </p>
              </div>
              <Receipt className="h-5 w-5 text-primary"/>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input_1.Input value={coupon} onChange={function (event) { return setCoupon(event.target.value); }} placeholder="Código do cupom" className="rounded-2xl"/>
              <button_1.Button type="button" variant="outline" size="lg" className="rounded-2xl" onClick={handleApplyCoupon}>
                Aplicar
              </button_1.Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{couponMessage || "Ex: NIRAN10"}</p>
          </div>

          <card_1.Card className="rounded-[2rem] border-border p-4 shadow-sm">
            <card_1.CardHeader className="px-0 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <card_1.CardTitle className="text-base">Resumo do Pedido</card_1.CardTitle>
                  <card_1.CardDescription>
                    Revise os valores antes de confirmar.
                  </card_1.CardDescription>
                </div>
                <div className="rounded-2xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {deliveryMethod === "delivery" ? "Entrega" : "Retirada"}
                </div>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="px-0">
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
                  <span>{deliveryFee > 0 ? formatMoney(deliveryFee) : "Grátis"}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Descontos</span>
                  <span className={appliedCoupon ? "text-emerald-400" : "text-muted-foreground"}>
                    {appliedCoupon ? "- ".concat(formatMoney(discount)) : "Nenhum cupom"}
                  </span>
                </div>
              </div>
            </card_1.CardContent>
            <card_1.CardFooter className="px-0 pt-4">
              <div className="flex w-full items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total estimado</p>
                  <p className="text-2xl font-bold text-foreground">{formatMoney(total)}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {paymentMethod.toUpperCase()}
                </span>
              </div>
            </card_1.CardFooter>
          </card_1.Card>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/95 px-4 py-4 backdrop-blur-xl">
        <div className="app-container">
          <div className="app-bottom-nav-inner flex max-w-full flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold text-foreground">{formatMoney(total)}</p>
            </div>
            <button_1.Button type="button" className="min-w-[46%] rounded-3xl py-5 text-base font-semibold" onClick={handleConfirm}>
              Confirmar Pedido
            </button_1.Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Ao confirmar, seu pedido será enviado para preparo imediato.
          </p>
          </div>
        </div>
      </div>
    </div>);
}
