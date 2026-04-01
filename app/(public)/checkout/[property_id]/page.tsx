'use client'

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import Image from 'next/image'
import Link from 'next/link'

import BookingAddOns from '@/components/booking/BookingAddOns'
import AvailabilityCalendar from '@/components/cabin/AvailabilityCalendar'

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

const memories = [
  {
    cabin: 'High Hopes',
    cabinHref: '/cabin/high-hopes',
    body: 'The Sandlot Crew, college friends for 42+ years, enjoyed our stay for fun, football, and relaxing! The cabin was perfect for us with the perfect accommodations. Hope to stay here again! Thank you for your hospitality!',
    customerImage: '/images/testimonial_default.jpg',
  },
  {
    cabin: 'Riverview Lodge',
    cabinHref: '/cabin/riverview-lodge',
    body: 'Our stay in Blue Ridge was wonderful! It was really relaxing. The view was gorgeous! The cabin was quiet, spacious, and nice. The cabin was well stocked with all the must-haves! Thank you for all the accommodations!',
    customerImage: '/images/testimonial_default.jpg',
  },
]

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
  featured_image_title?: string | null
  address: { city?: string; state?: string } | null
  today_rate: number | null
  body: string | null
}

interface QuoteAddOnLine {
  id: string
  name: string
  amount: number
  pricing_model: string
}

interface QuoteNightlyRate {
  date: string
  rate: number
}

interface QuoteResponse {
  property_name: string
  nights: number
  nightly_rates: QuoteNightlyRate[]
  base_rent: number
  cleaning_fee: number
  addons: QuoteAddOnLine[]
  addons_total: number
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  total_cents: number
}

function PaymentSection({ clientSecret, onSubmitSuccess }: { clientSecret: string; onSubmitSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed')
      setLoading(false)
      return
    }

    onSubmitSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error ? <p className="text-red-600 italic text-sm">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="mt-2 w-full py-3 bg-[url('/images/bg_search_repeat.png')] bg-repeat-x rounded-[20px] text-white text-[140%] italic cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([])
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
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

  const updateForm = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    fetch(`/api/proxy/api/storefront/catalog/cabins/${propertyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.title) setCabin(data)
      })
      .catch(() => {})
  }, [propertyId])

  useEffect(() => {
    if (!arrive && !depart) {
      return
    }
    const url = new URL(window.location.href)
    if (arrive) {
      url.searchParams.set('arrive', arrive)
    } else {
      url.searchParams.delete('arrive')
    }
    if (depart) {
      url.searchParams.set('depart', depart)
    } else {
      url.searchParams.delete('depart')
    }
    window.history.replaceState({}, '', url.toString())
  }, [arrive, depart])

  const hasValidRange = useMemo(() => {
    return Boolean(arrive && depart && arrive < depart)
  }, [arrive, depart])

  useEffect(() => {
    setClientSecret(null)
  }, [arrive, depart, selectedAddOnIds, form.adults, form.children, form.pets])

  useEffect(() => {
    setClientSecret(null)
  }, [arrive, depart, selectedAddOnIds, form.adults, form.children, form.pets])

  useEffect(() => {
    async function fetchQuote() {
      if (!hasValidRange) {
        setQuote(null)
        setQuoteError(null)
        return
      }
      try {
        setQuoteLoading(true)
        setQuoteError(null)
        const res = await fetch('/api/proxy/api/v1/checkout/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: propertyId,
            arrival_date: arrive,
            departure_date: depart,
            adults: form.adults,
            children: form.children,
            pets: form.pets,
            selected_add_on_ids: selectedAddOnIds,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Quote failed' }))
          throw new Error(err.detail || `HTTP ${res.status}`)
        }
        const data = await res.json()
        setQuote(data)
      } catch (error: any) {
        setQuoteError(error.message || 'Failed to calculate reservation total')
        setQuote(null)
      } finally {
        setQuoteLoading(false)
      }
    }

    fetchQuote()
  }, [propertyId, arrive, depart, form.adults, form.children, form.pets, selectedAddOnIds, hasValidRange])

  const continueToPayment = async () => {
    if (!quote || !hasValidRange) return
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      setCheckoutError('Please complete the guest information form before continuing to payment.')
      return
    }

    try {
      setCheckoutLoading(true)
      setCheckoutError(null)
      const res = await fetch('/api/proxy/api/v1/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          arrival_date: arrive,
          departure_date: depart,
          adults: form.adults,
          children: form.children,
          pets: form.pets,
          selected_add_on_ids: selectedAddOnIds,
          total_cents: quote.total_cents,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          zip_code: form.zip_code,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Payment initialization failed' }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setClientSecret(data.client_secret)
    } catch (error: any) {
      setCheckoutError(error.message || 'Unable to initialize payment')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-[#d4c4a8] rounded-[16px] bg-white text-[#533e27] focus:outline-none focus:border-[#7c2c00]'
  const dateInputClass = "h-[29px] leading-[29px] border-none bg-[url('/images/bg_date_field.png')] bg-no-repeat bg-[right_center] text-base text-[#533e27] rounded-tl-[20px] rounded-bl-[20px] outline-none bg-transparent p-[1px_24px_1px_15px] w-[165px]" 
  const labelClass = 'block text-[#533e27] text-[13px] mb-1 italic'

  return (
    <div className="py-5 px-5">
      <h1 className="font-normal italic text-[42px] max-[1010px]:text-[36px] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
        Book Your Getaway{cabin ? ` - ${cabin.title}` : ''}
      </h1>

      {cabin ? (
        <div className="flex flex-col md:flex-row gap-6 mb-8 pb-6 bg-[url('/images/cabin_separator.png')] bg-[center_bottom] bg-no-repeat">
          <div className="flex-1">
            <h2 className="text-[24px] text-[#7c2c00] italic mb-1">{cabin.title}</h2>
            {cabin.address?.city || cabin.address?.state ? (
              <p className="text-[#7c2c00] italic text-[16px] mb-2">
                {cabin.address?.city}{cabin.address?.city && cabin.address?.state ? ', ' : ''}{cabin.address?.state}
              </p>
            ) : null}
            <p className="text-[#533e27] italic text-[15px] mb-1">
              {cabin.property_type?.length ? cabin.property_type.map((pt) => pt.name).join(', ') : ''}
            </p>
            <p className="text-[#533e27] italic text-[15px] mb-2">
              {cabin.bedrooms ? `${cabin.bedrooms}, ` : ''}
              {cabin.bathrooms ? `${cabin.bathrooms} Bath` : ''}
              {cabin.sleeps ? ` ~ Sleeps ${cabin.sleeps}` : ''}
            </p>
            {cabin.today_rate ? <p className="text-[#533e27] italic text-[15px]">from ${Math.round(cabin.today_rate)}/night</p> : null}
          </div>
          {cabin.featured_image_url ? (
            <div className="w-full md:w-[280px] flex-shrink-0">
              <Image
                src={cabin.featured_image_url}
                alt={cabin.featured_image_alt || cabin.title}
                width={280}
                height={180}
                className="w-full h-auto rounded shadow-md object-cover"
                style={{ boxShadow: '0 0 10px #333' }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[130%] text-[#533e27] italic">Availability</h2>
            {!hasValidRange ? (
              <p className="text-[#7c2c00] italic text-sm text-right">
                Select your dates on the calendar below to begin your reservation.
              </p>
            ) : null}
          </div>

          {cabin ? (
            <AvailabilityCalendar
              cabinId={cabin.id}
              months={12}
              showRates={true}
              visibleMonths={3}
              selectable={true}
              selectedArrive={arrive}
              selectedDepart={depart}
              onDateSelect={(newArrive, newDepart) => {
                setArrive(newArrive)
                setDepart(newDepart)
              }}
            />
          ) : null}

          <div className="mt-5 rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-4">
            <h3 className="text-[130%] text-[#7c2c00] italic mb-4">Details of your Getaway</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className={labelClass}>Arrival</label>
                <input type="date" className={dateInputClass} value={arrive} onChange={(e) => setArrive(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Departure</label>
                <input type="date" className={dateInputClass} value={depart} min={arrive} onChange={(e) => setDepart(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Adults</label>
                <input type="number" min={1} max={24} className={inputClass + ' w-[80px]'} value={form.adults} onChange={(e) => updateForm('adults', Number(e.target.value) || 1)} />
              </div>
              <div>
                <label className={labelClass}>Children</label>
                <input type="number" min={0} max={24} className={inputClass + ' w-[90px]'} value={form.children} onChange={(e) => updateForm('children', Number(e.target.value) || 0)} />
              </div>
              <div>
                <label className={labelClass}>Pets</label>
                <input type="number" min={0} max={10} className={inputClass + ' w-[80px]'} value={form.pets} onChange={(e) => updateForm('pets', Number(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-4">
            <h3 className="text-[130%] text-[#7c2c00] italic mb-4">Optional Add-Ons</h3>
            <BookingAddOns propertyId={propertyId} selectedIds={selectedAddOnIds} onSelectionChange={setSelectedAddOnIds} />
          </div>
        </div>

        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="sticky top-4 rounded-xl border border-[#d4c4a8] bg-[#f7f1e7] p-5 shadow-sm">
            <h3 className="text-[130%] text-[#7c2c00] italic mb-3 pb-2 border-b border-[#d4c4a8]">Reservation Total</h3>
            {quoteLoading ? (
              <p className="text-[#533e27] italic text-sm">Calculating your getaway...</p>
            ) : quote ? (
              <div className="space-y-3 text-[#533e27] text-sm">
                <div className="space-y-1">
                  {quote.nightly_rates.map((item) => (
                    <div key={item.date} className="flex justify-between">
                      <span>{item.date}</span>
                      <span>${item.rate.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#d4c4a8] pt-2 space-y-1">
                  <div className="flex justify-between"><span>Base Rent</span><span>${quote.base_rent.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Cleaning Fee</span><span>${quote.cleaning_fee.toFixed(2)}</span></div>
                  {quote.addons.map((addon) => (
                    <div key={addon.id} className="flex justify-between">
                      <span>{addon.name}</span><span>${addon.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {quote.addons_total > 0 ? <div className="flex justify-between"><span>Add-Ons Total</span><span>${quote.addons_total.toFixed(2)}</span></div> : null}
                  <div className="flex justify-between"><span>Tax ({Math.round(quote.tax_rate * 100)}%)</span><span>${quote.tax_amount.toFixed(2)}</span></div>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#d4c4a8] text-lg font-bold text-[#7c2c00]">
                  <span>Total</span>
                  <span>${quote.total.toFixed(2)}</span>
                </div>
              </div>
            ) : quoteError ? (
              <p className="text-red-600 italic text-sm">{quoteError}</p>
            ) : (
              <p className="text-[#533e27] italic text-sm">Select dates on the calendar to see your reservation total.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat pt-8">
        <h2 className="font-normal italic text-[170%] text-[#7c2c00] leading-[100%] mb-5">Guest Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          <div><label className={labelClass}>First Name *</label><input className={inputClass} required value={form.first_name} onChange={(e) => updateForm('first_name', e.target.value)} /></div>
          <div><label className={labelClass}>Last Name *</label><input className={inputClass} required value={form.last_name} onChange={(e) => updateForm('last_name', e.target.value)} /></div>
          <div><label className={labelClass}>Email *</label><input type="email" className={inputClass} required value={form.email} onChange={(e) => updateForm('email', e.target.value)} /></div>
          <div><label className={labelClass}>Phone *</label><input type="tel" className={inputClass} required value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} /></div>
          <div className="md:col-span-2"><label className={labelClass}>Address</label><input className={inputClass} value={form.address} onChange={(e) => updateForm('address', e.target.value)} /></div>
          <div><label className={labelClass}>City</label><input className={inputClass} value={form.city} onChange={(e) => updateForm('city', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>State</label><input className={inputClass} value={form.state} onChange={(e) => updateForm('state', e.target.value)} /></div>
            <div><label className={labelClass}>Zip</label><input className={inputClass} value={form.zip_code} onChange={(e) => updateForm('zip_code', e.target.value)} /></div>
          </div>
        </div>

        {!clientSecret ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={continueToPayment}
              disabled={!quote || checkoutLoading || !form.first_name || !form.last_name || !form.email || !form.phone}
              className="px-8 py-3 bg-[url('/images/bg_search_repeat.png')] bg-repeat-x rounded-[20px] text-white text-[130%] italic cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,.3)' }}
            >
              {checkoutLoading ? 'Preparing Payment...' : 'Continue to Payment'}
            </button>
            {checkoutError ? <p className="mt-3 text-red-600 italic text-sm">{checkoutError}</p> : null}
          </div>
        ) : (
          <div className="mt-8 max-w-xl">
            <h2 className="font-normal italic text-[170%] text-[#7c2c00] leading-[100%] mb-5">Secure Payment</h2>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <PaymentSection onSubmitSuccess={() => router.push('/checkout/success')} />
            </Elements>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-center pb-[25px] mb-[25px] bg-[url('/images/bg_block_header.png')] bg-[50%_100%] bg-no-repeat bg-bottom text-[#533e27] text-[170%] leading-[100%] font-normal italic">
          The Memories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {memories.map((testimonial) => (
            <div key={testimonial.cabin} className="mb-[25px]">
              <div className="float-left my-0.5 mx-[15px] mb-2.5 ml-1.5 p-0.5 shadow-[0px_0px_8px_1px_#888]">
                <Image src={testimonial.customerImage} alt="" width={48} height={48} />
              </div>
              <div className="flex flex-col">
                <div className="mb-1.5 leading-[120%] font-bold">
                  <Link href={testimonial.cabinHref} className="text-[#7c2c00] underline hover:text-[#b7714b] font-bold">
                    {testimonial.cabin}
                  </Link>
                </div>
                <div className="italic text-[#533e27]">{testimonial.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
