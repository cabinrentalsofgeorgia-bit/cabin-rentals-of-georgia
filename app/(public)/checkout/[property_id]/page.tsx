'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

interface CheckoutFormProps {
  propertyId: string
  arrive: string
  depart: string
  onSuccess: () => void
}

function CheckoutForm({ propertyId, arrive, depart, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    adults: 2,
    children: 0,
    pets: 0,
    address: '',
    city: '',
    state: '',
    zip_code: '',
  })

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 border border-[#d4c4a8] rounded-lg bg-white text-[#533e27] placeholder:text-[#b7a98c] focus:outline-none focus:ring-2 focus:ring-[#7c2c00]/30 focus:border-[#7c2c00]'
  const labelClass = 'block text-sm font-medium text-[#533e27] mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-6">
        <h2 className="text-xl text-[#7c2c00] italic mb-4">Guest Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name *</label>
            <input className={inputClass} required value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input className={inputClass} required value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" className={inputClass} required value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input type="tel" className={inputClass} required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className={labelClass}>Adults</label>
            <input type="number" min={1} max={24} className={inputClass} value={form.adults} onChange={(e) => update('adults', parseInt(e.target.value) || 1)} />
          </div>
          <div>
            <label className={labelClass}>Children</label>
            <input type="number" min={0} max={24} className={inputClass} value={form.children} onChange={(e) => update('children', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className={labelClass}>Pets</label>
            <input type="number" min={0} max={10} className={inputClass} value={form.pets} onChange={(e) => update('pets', parseInt(e.target.value) || 0)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>State</label>
              <input className={inputClass} value={form.state} onChange={(e) => update('state', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Zip</label>
              <input className={inputClass} value={form.zip_code} onChange={(e) => update('zip_code', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-6">
        <h2 className="text-xl text-[#7c2c00] italic mb-4">Payment Information</h2>
        <PaymentElement />
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full py-3.5 rounded-xl bg-[#7c2c00] text-white text-lg italic font-medium hover:bg-[#5a1f00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </span>
        ) : (
          'Complete Reservation'
        )}
      </button>
    </form>
  )
}

export default function CheckoutPage({ params }: { params: { property_id: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [propertyName, setPropertyName] = useState('')
  const [nights, setNights] = useState(0)
  const [amountCents, setAmountCents] = useState(0)
  const [initError, setInitError] = useState<string | null>(null)
  const [stripePromise] = useState(() => STRIPE_PK ? loadStripe(STRIPE_PK) : null)

  const arrive = searchParams.get('arrive') || ''
  const depart = searchParams.get('depart') || ''

  useEffect(() => {
    if (!arrive || !depart) return

    async function initCheckout() {
      try {
        const res = await fetch('/api/proxy/api/v1/checkout/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: params.property_id,
            arrival_date: arrive,
            departure_date: depart,
            adults: 2,
            children: 0,
            pets: 0,
            first_name: 'Guest',
            last_name: 'Checkout',
            email: 'checkout@placeholder.com',
            phone: '0000000000',
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Checkout initialization failed' }))
          throw new Error(err.detail || `HTTP ${res.status}`)
        }
        const data = await res.json()
        setClientSecret(data.client_secret)
        setPropertyName(data.property_name)
        setNights(data.nights)
        setAmountCents(data.amount_cents)
      } catch (e: any) {
        setInitError(e.message)
      }
    }

    initCheckout()
  }, [params.property_id, arrive, depart])

  if (!arrive || !depart) {
    return (
      <div className="py-10 px-5 text-center">
        <h1 className="text-2xl text-[#7c2c00] italic mb-4">Missing Dates</h1>
        <p className="text-[#533e27]">Please select arrival and departure dates before checking out.</p>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="py-10 px-5 text-center">
        <h1 className="text-2xl text-[#7c2c00] italic mb-4">Checkout Error</h1>
        <p className="text-red-600">{initError}</p>
      </div>
    )
  }

  if (!clientSecret || !stripePromise) {
    return (
      <div className="py-10 px-5 text-center">
        <div className="flex items-center justify-center gap-3 text-[#533e27]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d4c4a8] border-t-[#7c2c00]" />
          <span className="text-lg italic">Preparing secure checkout...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-5 px-5 max-w-2xl mx-auto">
      <h1 className="text-[180%] text-[#7c2c00] italic mb-2">Secure Checkout</h1>

      <div className="rounded-xl border border-[#d4c4a8] bg-[#f7f1e7] p-4 mb-6">
        <p className="text-[#533e27] text-lg font-medium">{propertyName}</p>
        <p className="text-[#7c2c00] italic">
          {arrive} → {depart} · {nights} night{nights !== 1 ? 's' : ''}
        </p>
        <p className="text-[#533e27] text-xl font-bold mt-1">
          ${(amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
        <CheckoutForm
          propertyId={params.property_id}
          arrive={arrive}
          depart={depart}
          onSuccess={() => router.push('/checkout/success')}
        />
      </Elements>
    </div>
  )
}
