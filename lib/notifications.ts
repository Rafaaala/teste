import { toast } from '@/hooks/use-toast'

const toastMessages = {
  orderCreated: {
    title: 'Pedido realizado',
    description: 'Seu pedido foi criado com sucesso.',
  },
  addressSaved: {
    title: 'Endereço salvo',
    description: 'Os dados do endereço foram persistidos.',
  },
  paymentApproved: {
    title: 'Pagamento aprovado',
    description: 'Seu pagamento foi confirmado.',
  },
  paymentProcessing: {
    title: 'Pedido em processamento',
    description: 'Aguardando confirmação do pagamento.',
  },
  awaitingConfirmation: {
    title: 'Aguardando confirmação',
    description: 'Estamos validando as informações do seu pedido.',
  },
  orderCreationError: {
    title: 'Falha ao criar pedido',
    description: 'Verifique os dados e tente novamente.',
  },
  addressFetchError: {
    title: 'Falha ao buscar endereço',
    description: 'Não foi possível completar o endereço agora.',
  },
  paymentError: {
    title: 'Falha no pagamento',
    description: 'Não foi possível concluir a cobrança.',
  },
} as const

type ToastKey = keyof typeof toastMessages

export function notifySuccess(key: ToastKey) {
  return toast(toastMessages[key])
}

export function notifyError(key: ToastKey) {
  return toast({
    ...toastMessages[key],
    variant: 'destructive',
  })
}

export function notifyInfo(key: ToastKey) {
  return toast(toastMessages[key])
}

export const toastCatalog = toastMessages