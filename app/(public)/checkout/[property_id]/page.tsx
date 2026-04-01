'use client'

import { useState, useEffect, FormEvent, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Image from 'next/image'
import AvailabilityCalendar from '@/components/cabin/AvailabilityCalendar'

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

interface CabinData {
  id: string
  title: string
  cabin_slug: string
  bedrooms: string | null
  bathrooms: number | null
  sleeps: number | null
  property_type: Array<{ name: string }> | null
  amenities: Array<{ name: string }> | null
  featured_image_url: string | null
  featured_image_alt: string | null
  streamline_id: string | null
  address: { address1?: string; city?: string; state?: string } | null
  today_rate: number | null
  body: string | null
}

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: err } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
    })
    if (err) {
      setError(err.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="mt-3 text-red-600 text-sm italic">{error}</p>}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="mt-5 w-full py-3 bg-[url('/images/bg_search_repeat.png')] bg-repeat-x rounded-[20px] text-white text-[140%] italic cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,.3)' }}
      >
        {loading ? 'Processing...' : 'Complete Reservation'}
      </button>
    </form>
  )
}

function CheckoutInner({ propertyId }: { propertyId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cabin, setCabin] = useState<CabinData | null>(null)
  const [arrive, setArrive] = useState(searchParams.get('arrive') || '')
  const [depart, setDepart] = useState(searchParams.get('depart') || '')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [nights, setNights] = useState(0)
  const [amountCents, setAmountCents] = useState(0)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [stripePromise] = useState(() => STRIPE_PK ? loadStripe(STRIPE_PK) : null)

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    adults: 2, children: 0, pets: 0,
    address: '', city: '', state: '', zip_code: '',
  })
  const update = (f: string, v: string | number) => setForm(p => ({ ...p, [f]: v }))

  useEffect(() => {
    fetch(`/api/proxy/api/storefront/catalog/cabins/${propertyId}`)
      .then(r => r.json())
      .then(d => { if (d.title) setCabin(d) })
      .catch(() => {})
  }, [propertyId])

  const hasDates = arrive && depart && arrive < depart

  async function initPayment() {
    if (!hasDates || !form.first_name || !form.last_name || !form.email || !form.phone) return
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/proxy/api/v1/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          arrival_date: arrive,
          departure_date: depart,
          ...form,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Checkout failed' }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setClientSecret(data.client_secret)
      setNights(data.nights)
      setAmountCents(data.amount_cents)
    } catch (e: any) {
      setCheckoutError(e.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const ic = 'w-full px-3 py-2 border border-[#d4c4a8] rounded bg-white text-[#533e27] focus:outline-none focus:border-[#7c2c00]'
  const lc = 'block text-[#533e27] text-[13px] mb-0.5'

  return (
    <div className="py-5 px-5">
      <h1 className="font-normal italic text-[42px] max-[1010px]:text-[36px] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
        Book Your Getaway{cabin ? ` - ${cabin.title}` : ''}
      </h1>

      {cabin && (
        <div className="flex flex-col md:flex-row gap-6 mb-6 pb-5 bg-[url('/images/cabin_separator.png')] bg-[center_bottom] bg-no-repeat">
          <div className="flex-1">
            <h2 className="text-[24px] text-[#7c2c00] italic mb-1">{cabin.title}</h2>
            {cabin.address?.city && (
              <p className="text-[#7c2c00] italic text-[16px] mb-2">
                {cabin.address.city}{cabin.address.state ? `, ${cabin.address.state}` : ''}
              </p>
            )}
            <p className="text-[#533e27] italic text-[15px] mb-1">
              {cabin.bedrooms && <span>{cabin.bedrooms}, </span>}
              {cabin.bathrooms && <span>{cabin.bathrooms} Bath</span>}
              {cabin.sleeps && <span> ~ Sleeps {cabin.sleeps}</span>}
            </p>
            {cabin.today_rate && (
              <p className="text-[#533e27] italic text-[15px]">from ${Math.round(cabin.today_rate)}/night</p>
            )}
          </div>
          {cabin.featured_image_url && (
            <div className="w-full md:w-[280px] flex-shrink-0">
              <Image
                src={cabin.featured_image_url}
                alt={cabin.featured_image_alt || cabin.title}
                width={280} height={180}
                className="w-full h-auto rounded object-cover"
                style={{ boxShadow: '0 0 10px #333' }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-[130%] text-[#533e27] mb-3 italic">Select Your Dates</h3>
          {cabin && (
            <AvailabilityCalendar cabinId={cabin.id} months={12} showRates={true} visibleMonths={3} />
          )}

          <div className="mt-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className={lc}>Arrival</label>
              <input type="date" className={ic + ' w-[160px]'} value={arrive} onChange={e => { setArrive(e.target.value); setClientSecret(null) }} />
            </div>
            <div>
              <label className={lc}>Departure</label>
              <input type="date" className={ic + ' w-[160px]'} value={depart} min={arrive} onChange={e => { setDepart(e.target.value); setClientSecret(null) }} />
            </div>
            {hasDates && (
              <span className="text-[#7c2c00] italic text-[15px] pb-2">
                {Math.ceil((new Date(depart).getTime() - new Date(arrive).getTime()) / 86400000)} nights
              </span>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="sticky top-4 rounded-xl border border-[#d4c4a8] bg-[#f7f1e7] p-5">
            <h3 className="text-[130%] text-[#7c2c00] italic mb-3 pb-2 border-b border-[#d4c4a8]">
              Reservation Total
            </h3>
            {hasDates && amountCents > 0 ? (
              <div className="space-y-2 text-[#533e27]">
                <div className="flex justify-between"><span>Check-in</span><span className="font-medium">{arrive}</span></div>
                <div className="flex justify-between"><span>Check-out</span><span className="font-medium">{depart}</span></div>
                <div className="flex justify-between"><span>Nights</span><span className="font-medium">{nights}</span></div>
                <div className="flex justify-between pt-2 border-t border-[#d4c4a8] text-lg font-bold text-[#7c2c00]">
                  <span>Total</span>
                  <span>${(amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ) : (
              <p className="text-[#533e27] italic text-sm">
                {hasDates ? 'Calculating...' : 'Select dates on the calendar to see your total.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {hasDates && (
        <div className="mt-8 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat pt-8">
          <h2 className="font-normal italic text-[170%] text-[#7c2c00] leading-[100%] mb-5">Guest Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div><label className={lc}>First Name *</label><input className={ic} required value={form.first_name} onChange={e => update('first_name', e.target.value)} /></div>
            <div><label className={lc}>Last Name *</label><input className={ic} required value={form.last_name} onChange={e => update('last_name', e.target.value)} /></div>
            <div><label className={lc}>Email *</label><input type="email" className={ic} required value={form.email} onChange={e => update('email', e.target.value)} /></div>
            <div><label className={lc}>Phone *</label><input type="tel" className={ic} required value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <div><label className={lc}>Adults</label><input type="number" min={1} max={24} className={ic} value={form.adults} onChange={e => update('adults', +e.target.value || 1)} /></div>
              <div><label className={lc}>Children</label><input type="number" min={0} max={24} className={ic} value={form.children} onChange={e => update('children', +e.target.value || 0)} /></div>
              <div><label className={lc}>Pets</label><input type="number" min={0} max={10} className={ic} value={form.pets} onChange={e => update('pets', +e.target.value || 0)} /></div>
            </div>
            <div className="md:col-span-2"><label className={lc}>Address</label><input className={ic} value={form.address} onChange={e => update('address', e.target.value)} /></div>
            <div><label className={lc}>City</label><input className={ic} value={form.city} onChange={e => update('city', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lc}>State</label><input className={ic} value={form.state} onChange={e => update('state', e.target.value)} /></div>
              <div><label className={lc}>Zip</label><input className={ic} value={form.zip_code} onChange={e => update('zip_code', e.target.value)} /></div>
            </div>
          </div>

          {!clientSecret && (
            <button
              onClick={initPayment}
              disabled={checkoutLoading || !form.first_name || !form.last_name || !form.email || !form.phone}
              className="mt-6 px-8 py-3 bg-[url('/images/bg_search_repeat.png')] bg-repeat-x rounded-[20px] text-white text-[130%] italic cursor-pointer border-none disabled:opacity-50"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,.3)' }}
            >
              {checkoutLoading ? 'Preparing Payment...' : 'Continue to Payment'}
            </button>
          )}
          {checkoutError && <p className="mt-3 text-red-600 italic text-sm">{checkoutError}</p>}
        </div>
      )}

      {clientSecret && stripePromise && (
        <div className="mt-8 max-w-xl bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat pt-8">
          <h2 className="font-normal italic text-[170%] text-[#7c2c00] leading-[100%] mb-5">Secure Payment</h2>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <PaymentForm onSuccess={() => router.push('/checkout/success')} />
          </Elements>
        </div>
      )}
    </div>
  )
}

export default function CheckoutPage({ params }: { params: { property_id: string } }) {
  return (
    <Suspense fallback={<div className="py-10 px-5 text-center text-[#533e27] italic">Loading checkout...</div>}>
      <CheckoutInner propertyId={params.property_id} />
    </Suspense>
  )
}
