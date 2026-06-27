'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import OrderSuccessContent from './order-success-content';

function OrderSuccessLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-slate-600 dark:text-slate-400">
          Carregando seu pedido...
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessLoadingFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
