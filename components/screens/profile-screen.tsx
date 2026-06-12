"use client"

import {
  User,
  MapPin,
  Clock,
  Settings,
  ChevronRight,
  CreditCard,
  Heart,
  Bell,
  HelpCircle,
  LogOut,
  LogIn,
} from "lucide-react"

import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function ProfileScreen() {
  const { data: session, status } = useSession()
  const isSignedIn = status === 'authenticated'
  const userId     = (session?.user as any)?.id as string | undefined
  const router = useRouter()

  const menuItems = [
    {
      icon: MapPin,
      label: "Endereços salvos",
      description: "Gerencie seus endereços de entrega",
    },
    {
      icon: CreditCard,
      label: "Formas de pagamento",
      description: "Cartões e outras formas de pagamento",
    },
    {
      icon: Clock,
      label: "Histórico de pedidos",
      description: "Veja seus pedidos anteriores",
    },
    {
      icon: Heart,
      label: "Favoritos",
      description: "Seus pratos favoritos",
    },
    {
      icon: Bell,
      label: "Notificações",
      description: "Configure suas notificações",
    },
    {
      icon: Settings,
      label: "Configurações",
      description: "Preferências do app",
    },
    {
      icon: HelpCircle,
      label: "Ajuda",
      description: "Central de ajuda e suporte",
    },
  ]

  const orderHistory = [
    {
      id: 1,
      date: "28/04/2025",
      items: "Combo Niran 30 peças",
      total: 79.9,
      status: "Entregue",
    },
    {
      id: 2,
      date: "20/04/2025",
      items: "Hot Roll Especial x2",
      total: 65.8,
      status: "Entregue",
    },
    {
      id: 3,
      date: "15/04/2025",
      items: "Combo Casal 40 peças",
      total: 109.9,
      status: "Entregue",
    },
  ]

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      await nextAuthSignOut({ redirect: false })
      router.push("/")
    } catch (error) {
      console.error(error)
    }
  }

  /*
    ==================================================
    NÃO LOGADO
    ==================================================
  */

  if (!isSignedIn || !userId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div
          className="
            mx-auto flex min-h-screen w-full max-w-7xl
            items-center justify-center
            px-4 py-10
          "
        >
          <div
            className="
              w-full max-w-md
              rounded-3xl border border-border/50
              bg-card/60 p-8
              backdrop-blur-xl
            "
          >
            {/* LOGO/TITLE */}
            <div className="mb-8 text-center">
              <div
                className="
                  mx-auto mb-4 flex h-20 w-20
                  items-center justify-center
                  rounded-full bg-primary
                "
              >
                <User className="h-10 w-10 text-primary-foreground" />
              </div>

              <h1 className="text-3xl font-bold">
                Entrar na conta
              </h1>

              <p className="mt-2 text-muted-foreground">
                Faça login para acessar seu perfil,
                pedidos e favoritos.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="space-y-4">
              <button
                onClick={() => router.push("/sign-in")}
                className="
                  flex w-full items-center justify-center gap-2
                  rounded-2xl bg-primary px-5 py-4
                  font-semibold text-primary-foreground
                  transition-all duration-300
                  hover:opacity-90
                "
              >
                <LogIn className="h-5 w-5" />
                Entrar
              </button>

              <button
                onClick={() => router.push("/sign-up")}
                className="
                  flex w-full items-center justify-center gap-2
                  rounded-2xl border border-border
                  bg-secondary/40 px-5 py-4
                  font-semibold
                  transition-all duration-300
                  hover:bg-secondary
                "
              >
                Criar conta
              </button>
            </div>

            {/* BENEFITS */}
            <div className="mt-8 space-y-3">
              <div className="rounded-2xl bg-secondary/40 p-4">
                <p className="font-medium">
                  ✓ Acompanhe seus pedidos
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/40 p-4">
                <p className="font-medium">
                  ✓ Salve endereços favoritos
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/40 p-4">
                <p className="font-medium">
                  ✓ Receba promoções exclusivas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /*
    ==================================================
    LOGADO
    ==================================================
  */

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl">

        {/* SIDEBAR DESKTOP */}
        <aside
          className="
            hidden w-72 border-r border-border/50
            bg-card/30 lg:flex lg:flex-col
          "
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div
                className="
                  flex h-16 w-16 items-center
                  justify-center rounded-full bg-primary
                "
              >
                <User className="h-8 w-8 text-primary-foreground" />
              </div>

              <div>
                <h2 className="font-bold">
                  Olá, Cliente!
                </h2>

                <p className="text-sm text-muted-foreground">
                  Usuário autenticado
                </p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="flex-1 space-y-2 px-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="
                  flex w-full items-center gap-3
                  rounded-2xl p-4 text-left
                  transition-all duration-300
                  hover:bg-secondary
                "
              >
                <div
                  className="
                    flex h-11 w-11 items-center
                    justify-center rounded-xl bg-secondary
                  "
                >
                  <item.icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">
                    {item.label}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* LOGOUT */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="
                flex w-full items-center justify-center gap-2
                rounded-2xl bg-destructive/10 p-4
                text-destructive transition-all duration-300
                hover:bg-destructive/20
              "
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1">

          {/* MOBILE HEADER */}
          <header
            className="
              sticky top-0 z-30
              border-b border-border/50
              bg-background/80
              backdrop-blur-xl
              lg:hidden
            "
          >
            <div className="px-4 py-4">
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex h-14 w-14 items-center
                    justify-center rounded-full bg-primary
                  "
                >
                  <User className="h-7 w-7 text-primary-foreground" />
                </div>

                <div>
                  <h1 className="text-lg font-bold">
                    Olá, Cliente!
                  </h1>

                  <p className="text-sm text-muted-foreground">
                    Usuário autenticado
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div
            className="
              mx-auto w-full max-w-5xl
              space-y-6
              px-4 py-6
              sm:px-6
              lg:px-10 lg:py-10
            "
          >

            {/* ADDRESS */}
            <section
              className="
                rounded-3xl border border-border/50
                bg-card/60 p-5 backdrop-blur-sm
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex h-14 w-14 items-center
                    justify-center rounded-2xl bg-primary/15
                  "
                >
                  <MapPin className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Endereço de entrega
                  </p>

                  <h3 className="font-semibold">
                    Rua Principal, 123 - Centro
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Itabaiana - PB
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </section>

            {/* ORDERS */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Pedidos recentes
                </h2>
              </div>

              <div
                className="
                  grid gap-4
                  sm:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {orderHistory.map((order) => (
                  <div
                    key={order.id}
                    className="
                      rounded-3xl border border-border/50
                      bg-card/60 p-5 transition-all
                      hover:border-primary/30
                    "
                  >
                    <div className="space-y-2">
                      <h3 className="font-semibold">
                        {order.items}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {order.date}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-primary">
                          R$ {order.total
                            .toFixed(2)
                            .replace(".", ",")}
                        </span>

                        <span className="text-sm text-green-500">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MENU MOBILE */}
            <section className="space-y-3 lg:hidden">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className="
                    flex w-full items-center gap-4
                    rounded-2xl border border-border/40
                    bg-card/60 p-4 text-left
                    transition-all duration-300
                    hover:bg-card
                  "
                >
                  <div
                    className="
                      flex h-12 w-12 items-center
                      justify-center rounded-2xl bg-secondary
                    "
                  >
                    <item.icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">
                      {item.label}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </section>

            {/* LOGOUT MOBILE */}
            <button
              onClick={handleLogout}
              className="
                flex w-full items-center justify-center gap-2
                rounded-2xl bg-destructive/10 p-4
                text-destructive transition-all duration-300
                hover:bg-destructive/20
                lg:hidden
              "
            >
              <LogOut className="h-5 w-5" />

              <span className="font-medium">
                Sair da conta
              </span>
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}