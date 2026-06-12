"use client"

import Image from "next/image"
import { MapPin, Clock, Phone, Instagram, Star, Heart } from "lucide-react"

export function AboutScreen() {
  const hours = [
    { day: "Segunda a Quinta", time: "18h às 23h" },
    { day: "Sexta e Sábado", time: "18h às 00h" },
    { day: "Domingo", time: "18h às 23h" },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Hero */}
      <div className="relative h-48 flex-shrink-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tSqWFzwujh2uaZGNIl6rc8ER6VZhV0.png"
          alt="Niran Sushi"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-primary">
              <Image
                src="/images/logo.png"
                alt="Niran Sushi Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Niran Sushi</h1>
              <p className="text-sm text-muted-foreground">
                Culinária Japonesa e Chinesa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {/* Rating */}
        <div className="flex items-center justify-between rounded-xl bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= 4
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-yellow-400/50 text-yellow-400/50"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">4.8</span>
          </div>
          <span className="text-sm text-muted-foreground">+500 avaliações</span>
        </div>

        {/* About */}
        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Heart className="h-4 w-4 text-primary" />
            Nossa História
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            O Niran Sushi nasceu da paixão pela culinária oriental e do desejo
            de levar sabores autênticos e de qualidade para Itabaiana - PB.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Com ingredientes selecionados e preparo artesanal, cada prato é feito
            com carinho para proporcionar a melhor experiência gastronômica aos
            nossos clientes.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Somos especialistas em sushi, sashimi, hot rolls, temakis e muito mais.
            Venha conhecer ou peça delivery!
          </p>
        </div>

        {/* Location */}
        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Localização
          </h2>
          <div className="mt-3 rounded-xl bg-card p-4">
            <p className="text-sm font-medium text-foreground">
              Centro - Itabaiana, PB
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Rua Principal, próximo à praça central
            </p>
            <button className="mt-3 w-full rounded-lg bg-primary/20 py-2 text-sm font-medium text-primary">
              Ver no mapa
            </button>
          </div>
        </div>

        {/* Hours */}
        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Horário de Funcionamento
          </h2>
          <div className="mt-3 space-y-2">
            {hours.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-card px-4 py-3"
              >
                <span className="text-sm text-foreground">{item.day}</span>
                <span className="text-sm font-medium text-primary">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-foreground">Contato</h2>
          <div className="space-y-2">
            <a
              href="tel:+5583999999999"
              className="flex items-center gap-3 rounded-xl bg-card p-4 transition-colors hover:bg-card/80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <Phone className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp</p>
                <p className="text-xs text-muted-foreground">(83) 9 9999-9999</p>
              </div>
            </a>
            <a
              href="https://instagram.com/niransushiita"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-card p-4 transition-colors hover:bg-card/80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                <Instagram className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Instagram</p>
                <p className="text-xs text-muted-foreground">@niransushiita</p>
              </div>
            </a>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Niran Sushi - Itabaiana PB
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
