"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

type Tab = "cliente-login" | "cliente-cadastro" | "staff-login";

export default function SignInPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("cliente-login");

  // ── Cliente - campos ───────────────────────────────────────────────────
  const [clienteName, setClienteName] = useState("");
  const [clienteIdentifier, setClienteIdentifier] = useState("");

  // ── Staff - campos ─────────────────────────────────────────────────────
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  // ── campos compartilhados ──────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── LOGIN CLIENTE ──────────────────────────────────────────────────────
  async function handleClienteLogin(e: React.FormEvent) {
    e.preventDefault();
    const value = clienteIdentifier.trim();
    if (!value) return setError("Email ou telefone é obrigatório");

    setLoading(true);
    setError("");

    const isEmail = value.includes("@");
    const res = await signIn("credentials", {
      redirect: false,
      ...(isEmail ? { email: value } : { phone: value }),
    });

    setLoading(false);

    if (res?.error) {
      setError("Dados não encontrados. Verifique e tente novamente.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  // ── CADASTRO CLIENTE ───────────────────────────────────────────────────
  async function handleClienteRegister(e: React.FormEvent) {
    e.preventDefault();
    const nameVal = clienteName.trim();
    const idVal = clienteIdentifier.trim();

    if (!nameVal) return setError("Nome é obrigatório");
    if (!idVal) return setError("Email ou telefone é obrigatório");

    setLoading(true);
    setError("");

    const isEmail = idVal.includes("@");

    // 1. Cria o cliente no banco
    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameVal,
        ...(isEmail ? { email: idVal } : { phone: idVal }),
      }),
    });

    if (!registerRes.ok) {
      const data = await registerRes.json().catch(() => ({}));
      setLoading(false);
      setError(data.error || "Erro ao criar conta. Tente novamente.");
      return;
    }

    // 2. Faz login automaticamente
    const loginRes = await signIn("credentials", {
      redirect: false,
      ...(isEmail ? { email: idVal } : { phone: idVal }),
    });

    setLoading(false);

    if (loginRes?.error) {
      setError("Conta criada, mas não foi possível entrar. Tente fazer login.");
      setTab("cliente-login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  // ── LOGIN STAFF ────────────────────────────────────────────────────────
  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    const email = staffEmail.trim().toLowerCase();
    const password = staffPassword;

    if (!email) return setError("Email é obrigatório");
    if (!password) return setError("Senha é obrigatória");

    setLoading(true);
    setError("");

    const res = await signIn("staff", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou senha inválidos.");
      return;
    }

    router.push("/mesas");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        {/* ── LEFT (decorativo, desktop) ────────────────────────────── */}
        <div
          className="
            hidden flex-1 flex-col justify-between
            border-r border-border/50
            bg-linear-to-br from-primary/10 via-background to-background
            p-12 lg:flex
          "
        >
          <div>
            <h1 className="text-5xl font-black">Niran Sushi</h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Entre ou crie sua conta e acompanhe seus pedidos.
            </p>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl bg-card/60 p-6">
              <h2 className="text-xl font-bold">✓ Pedidos rápidos</h2>
            </div>
            <div className="rounded-3xl bg-card/60 p-6">
              <h2 className="text-xl font-bold">✓ Promoções exclusivas</h2>
            </div>
          </div>
        </div>

        {/* ── RIGHT (formulário) ───────────────────────────────────── */}
        <div
          className="
            flex w-full items-center justify-center
            px-4 py-10 sm:px-6 lg:w-[520px]
          "
        >
          <div className="w-full max-w-md">
            <div className="mb-10 text-center lg:hidden">
              <h1 className="text-4xl font-black">Niran Sushi</h1>
            </div>

            <div
              className="
                rounded-3xl border border-border/50
                bg-card/60 p-6 backdrop-blur-xl sm:p-8
              "
            >
              {/* Abas */}
              <div className="mb-8 grid grid-cols-3 rounded-2xl bg-secondary/40 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab("cliente-login");
                    setError("");
                  }}
                  className={`rounded-xl py-2.5 px-2 text-xs sm:text-sm font-semibold transition-all ${
                    tab === "cliente-login"
                      ? "bg-background shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🛍️ Cliente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("cliente-cadastro");
                    setError("");
                  }}
                  className={`rounded-xl py-2.5 px-2 text-xs sm:text-sm font-semibold transition-all ${
                    tab === "cliente-cadastro"
                      ? "bg-background shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ✏️ Registrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("staff-login");
                    setError("");
                  }}
                  className={`rounded-xl py-2.5 px-2 text-xs sm:text-sm font-semibold transition-all ${
                    tab === "staff-login"
                      ? "bg-background shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  👨‍💼 Staff
                </button>
              </div>

              {/* ── LOGIN CLIENTE ──────────────────────────────────── */}
              {tab === "cliente-login" && (
                <form onSubmit={handleClienteLogin} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email ou telefone
                    </label>
                    <input
                      type="text"
                      value={clienteIdentifier}
                      onChange={(e) => setClienteIdentifier(e.target.value)}
                      placeholder="email@ex.com ou +55 11 91234-5678"
                      className="
                        h-14 w-full rounded-2xl border border-border
                        bg-background px-4 outline-none focus:border-primary
                      "
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      flex h-14 w-full items-center justify-center gap-2
                      rounded-2xl bg-primary font-semibold text-primary-foreground
                      transition-all hover:opacity-90 disabled:opacity-60
                    "
                  >
                    {loading ? (
                      "Entrando..."
                    ) : (
                      <>
                        <span>Entrar</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── CADASTRO CLIENTE ────────────────────────────────– */}
              {tab === "cliente-cadastro" && (
                <form onSubmit={handleClienteRegister} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={clienteName}
                      onChange={(e) => setClienteName(e.target.value)}
                      placeholder="Seu nome"
                      className="
                        h-14 w-full rounded-2xl border border-border
                        bg-background px-4 outline-none focus:border-primary
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email ou telefone
                    </label>
                    <input
                      type="text"
                      value={clienteIdentifier}
                      onChange={(e) => setClienteIdentifier(e.target.value)}
                      placeholder="email@ex.com ou +55 11 91234-5678"
                      className="
                        h-14 w-full rounded-2xl border border-border
                        bg-background px-4 outline-none focus:border-primary
                      "
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      flex h-14 w-full items-center justify-center gap-2
                      rounded-2xl bg-primary font-semibold text-primary-foreground
                      transition-all hover:opacity-90 disabled:opacity-60
                    "
                  >
                    {loading ? (
                      "Criando conta..."
                    ) : (
                      <>
                        <span>Criar conta</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── LOGIN STAFF ────────────────────────────────────── */}
              {tab === "staff-login" && (
                <form onSubmit={handleStaffLogin} className="space-y-5">
                  <div className="rounded-2xl bg-blue-500/10 border border-blue-500/30 p-3 text-sm text-blue-700 dark:text-blue-300">
                    ℹ️ Acesso para garçons, gerentes e administradores
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="admin@niransushi.com"
                      className="
                        h-14 w-full rounded-2xl border border-border
                        bg-background px-4 outline-none focus:border-primary
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="
                        h-14 w-full rounded-2xl border border-border
                        bg-background px-4 outline-none focus:border-primary
                      "
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      flex h-14 w-full items-center justify-center gap-2
                      rounded-2xl bg-primary font-semibold text-primary-foreground
                      transition-all hover:opacity-90 disabled:opacity-60
                    "
                  >
                    {loading ? (
                      "Entrando..."
                    ) : (
                      <>
                        <span>Entrar como Staff</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Ao continuar, você concorda com nossos{" "}
                <Link href="/" className="underline hover:text-foreground">
                  Termos de Uso
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
