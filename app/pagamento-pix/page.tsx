'use client'

import React, { Suspense } from 'react'
import PagamentoPixContent from './pix-content'

export default function PagamentoPixPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">Carregando...</div>
      </div>
    }>
      <PagamentoPixContent />
    </Suspense>
  )
}
