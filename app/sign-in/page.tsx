"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react"

import { useSignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  const router = useRouter()

  const {
    isLoaded,
    signUp,
    setActive,
  } = useSignUp()

  const [name, setName] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [confirmPassword, setConfirmPassword] =
    useState("")

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault()

    if (!isLoaded) return

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const result =
        await signUp.create({
          emailAddress: email,
          password,
        })

      if (result.status === "complete") {
        await setActive({
          session:
            result.createdSessionId,
        })

        await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email,
          }),
        })

        router.push("/")
      } else {
        setError(
          "Não foi possível finalizar o cadastro."
        )
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.longMessage ||
          "Erro ao criar conta."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">

        {/* LEFT */}

        <div
          className="
          hidden flex-1 flex-col justify-between
          border-r border-border/50
          bg-gradient-to-br
          from-primary/10
          via-background
          to-background
          p-12
          lg:flex
        "
        >
          <div>
            <h1 className="text-5xl font-black">
              Niran Sushi
            </h1>

            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Crie sua conta e acompanhe seus pedidos.
            </p>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl bg-card/60 p-6">
              <h2 className="text-xl font-bold">
                ✓ Pedidos rápidos
              </h2>
            </div>

            <div className="rounded-3xl bg-card/60 p-6">
              <h2 className="text-xl font-bold">
                ✓ Promoções exclusivas
              </h2>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div
          className="
          flex w-full items-center justify-center
          px-4 py-10
          sm:px-6
          lg:w-[520px]
        "
        >
          <div className="w-full max-w-md">

            <div className="mb-10 text-center lg:hidden">
              <h1 className="text-4xl font-black">
                Niran Sushi
              </h1>

              <p className="mt-2 text-muted-foreground">
                Crie sua conta
              </p>
            </div>

            <div
              className="
              rounded-3xl
              border border-border/50
              bg-card/60
              p-6
              backdrop-blur-xl
              sm:p-8
            "
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold">
                  Criar conta
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Preencha seus dados.
                </p>
              </div>

              <form
                onSubmit={handleRegister}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nome
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Seu nome"
                    className="
                    h-14 w-full rounded-2xl
                    border border-border
                    bg-background px-4
                    outline-none
                    focus:border-primary
                  "
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Seu email"
                    className="
                    h-14 w-full rounded-2xl
                    border border-border
                    bg-background px-4
                    outline-none
                    focus:border-primary
                  "
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Senha
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Senha"
                      className="
                      h-14 w-full rounded-2xl
                      border border-border
                      bg-background
                      px-4 pr-14
                      outline-none
                      focus:border-primary
                    "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="
                      absolute right-4 top-1/2
                      -translate-y-1/2
                    "
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Confirmar senha
                  </label>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirme a senha"
                    className="
                    h-14 w-full rounded-2xl
                    border border-border
                    bg-background px-4
                    outline-none
                    focus:border-primary
                  "
                  />
                </div>

                {error && (
                  <div
                    className="
                    rounded-2xl
                    border
                    border-destructive/30
                    bg-destructive/10
                    p-4
                    text-sm
                    text-destructive
                  "
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                  flex h-14 w-full
                  items-center justify-center
                  gap-2
                  rounded-2xl
                  bg-primary
                  font-semibold
                  text-primary-foreground
                "
                >
                  {loading
                    ? "Criando..."
                    : "Criar conta"}

                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  Já possui conta?
                </p>

                <Link
                  href="/sign-in"
                  className="
                  mt-2 inline-flex
                  font-semibold
                  text-primary
                "
                >
                  Fazer login
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}