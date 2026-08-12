import type { RazorpayCheckoutPayload } from '@cafe/shared-types'

type RazorpaySuccessResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayCheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  image?: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
    method?: string
    vpa?: string
  }
  config?: {
    display?: {
      blocks?: Record<
        string,
        {
          name: string
          instruments: Array<{
            method: string
            flows?: string[]
            banks?: string[]
          }>
        }
      >
      sequence?: string[]
      preferences?: {
        show_default_blocks?: boolean
      }
    }
  }
  theme?: { color?: string }
  handler: (response: RazorpaySuccessResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

type RazorpayInstance = {
  open: () => void
  on: (event: 'payment.failed', handler: (response: unknown) => void) => void
}

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

let scriptPromise: Promise<void> | null = null

function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay Checkout requires a browser'))
  }
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout]',
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Razorpay Checkout')),
      )
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout'))
    document.body.appendChild(script)
  })

  return scriptPromise
}

/**
 * Opens Razorpay Checkout.js and resolves with the signed success payload.
 * Rejects if the customer dismisses the modal or payment fails.
 */
export async function openRazorpayCheckout(
  payload: RazorpayCheckoutPayload,
): Promise<{
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}> {
  await loadCheckoutScript()
  const RazorpayCtor = window.Razorpay
  if (!RazorpayCtor) {
    throw new Error('Razorpay Checkout is unavailable')
  }

    const key =
      payload.keyId && payload.keyId !== 'mock'
        ? payload.keyId
        : (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined)
    if (!key) {
      throw new Error('Razorpay Key ID missing from checkout payload / VITE_RAZORPAY_KEY_ID')
    }

    return new Promise((resolve, reject) => {
      let settled = false
      const rzp = new RazorpayCtor({
        key,
        amount: payload.amount,
        currency: payload.currency,
        name: payload.name,
        description: payload.description,
        image: payload.logo,
        order_id: payload.razorpayOrderId,
        // Browser-friendly test path:
        // - Netbanking → mock bank page → Success (no phone / no intl cards)
        // - UPI collect → type success@razorpay (not QR scan)
        prefill: {
          ...payload.prefill,
          method: 'netbanking',
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Netbanking (recommended for test)',
                instruments: [{ method: 'netbanking' }],
              },
              upiCollect: {
                name: 'UPI ID',
                instruments: [{ method: 'upi', flows: ['collect'] }],
              },
              cards: {
                name: 'Cards',
                instruments: [{ method: 'card' }],
              },
            },
            sequence: ['block.banks', 'block.upiCollect', 'block.cards'],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        theme: payload.themeColor ? { color: payload.themeColor } : undefined,
        handler: (response) => {
          settled = true
          resolve({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
        },
        modal: {
          ondismiss: () => {
            if (!settled) {
              reject(new Error('Payment cancelled'))
            }
          },
        },
      })

      rzp.on('payment.failed', () => {
        if (!settled) {
          settled = true
          reject(new Error('Payment failed'))
        }
      })

      rzp.open()
    })
}
