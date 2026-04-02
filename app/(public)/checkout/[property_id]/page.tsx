'use client'

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import Image from 'next/image'

import BookingAddOns from '@/components/booking/BookingAddOns'
import AvailabilityCalendar from '@/components/cabin/AvailabilityCalendar'

import type { Stripe } from '@stripe/stripe-js'

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

interface LedgerLineItem {
  id: string
  name: string
  amount: number
  is_taxable: boolean
  type: 'rent' | 'fee' | 'addon' | 'tax' | 'deposit' | 'discount'
}

interface LedgerSummary {
  taxable_subtotal: number
  tax_amount: number
  non_taxable_subtotal: number
  grand_total: number
}

interface QuoteResponse {
  property_id: string
  property_name: string
  nights: number
  line_items: LedgerLineItem[]
  summary: LedgerSummary
  is_bookable: boolean
  currency: string
}

function PaymentSection({ onSubmitSuccess }: { onSubmitSuccess: () => void }) {
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

function ReservationTotal({
  quote,
  quoteLoading,
  quoteError,
  hasValidRange,
}: {
  quote: QuoteResponse | null
  quoteLoading: boolean
  quoteError: string | null
  hasValidRange: boolean
}) {
  return (
    <div className="sticky top-4 rounded-xl border border-[#d4c4a8] bg-[#f7f1e7] p-5 shadow-sm">
      <h3 className="text-[130%] text-[#7c2c00] italic mb-3 pb-2 border-b border-[#d4c4a8]">
        Reservation Total
      </h3>

      {quoteLoading ? (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-[#7c2c00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#533e27] italic text-sm">Calculating your getaway...</p>
        </div>
      ) : quote?.line_items && quote?.summary ? (
        <div className="space-y-3 text-[#533e27] text-sm">
          {/* Stay summary */}
          <div className="text-[13px] italic pb-2 border-b border-[#d4c4a8]/60">
            {quote.property_name} &middot; {quote.nights} {quote.nights === 1 ? 'night' : 'nights'}
          </div>

          {/* Lodging & Fees */}
          {(() => {
            const lodgingItems = quote.line_items.filter(
              (i) => i.type === 'rent' || i.type === 'fee' || i.type === 'discount'
            )
            return lodgingItems.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-[#7c2c00] font-semibold">
                  Lodging &amp; Fees
                </p>
                {lodgingItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className={item.amount < 0 ? 'text-green-700' : ''}>
                      {item.amount < 0 ? '-' : ''}${Math.abs(item.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null
          })()}

          {/* Add-Ons */}
          {(() => {
            const addonItems = quote.line_items.filter((i) => i.type === 'addon')
            return addonItems.length > 0 ? (
              <div className="border-t border-[#d4c4a8] pt-2 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-[#7c2c00] font-semibold">Add-Ons</p>
                {addonItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : null
          })()}

          {/* Taxes */}
          {(() => {
            const taxItems = quote.line_items.filter((i) => i.type === 'tax')
            return taxItems.length > 0 ? (
              <div className="border-t border-[#d4c4a8] pt-2 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-[#7c2c00] font-semibold">Taxes</p>
                {taxItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : null
          })()}

          {/* Security Deposits */}
          {(() => {
            const depositItems = quote.line_items.filter((i) => i.type === 'deposit')
            return depositItems.length > 0 ? (
              <div className="border-t border-[#d4c4a8] pt-2 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-[#7c2c00] font-semibold">
                  Security Deposits
                </p>
                {depositItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : null
          })()}

          {/* Grand Total */}
          <div className="flex justify-between pt-3 border-t-2 border-[#7c2c00] text-lg font-bold text-[#7c2c00]">
            <span>Total</span>
            <span>${quote.summary.grand_total.toFixed(2)}</span>
          </div>

          {!quote.is_bookable && (
            <p className="text-red-600 italic text-[12px] mt-2">
              This property is not available for the selected dates.
            </p>
          )}
        </div>
      ) : quoteError ? (
        <div className="py-3">
          <p className="text-red-600 italic text-sm">{quoteError}</p>
          <p className="text-[#533e27] italic text-[12px] mt-2">
            Please adjust your dates or contact us at (706) 432-2140.
          </p>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-[#533e27] italic text-sm mb-2">
            Select your arrival and departure dates to see pricing.
          </p>
          <p className="text-[#7c2c00] text-[12px]">
            Click two dates on the calendar or use the date inputs below.
          </p>
        </div>
      )}
    </div>
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
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})
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
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: false }))
    }
  }

  useEffect(() => {
    async function initStripe() {
      try {
        const res = await fetch('/api/proxy/api/v1/checkout/stripe-key')
        if (!res.ok) return
        const data = await res.json()
        if (data.publishable_key) {
          const stripe = await loadStripe(data.publishable_key)
          setStripeInstance(stripe)
        }
      } catch {}
    }
    initStripe()
  }, [])

  useEffect(() => {
    fetch(`/api/proxy/api/storefront/catalog/cabins/${propertyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.title) setCabin(data)
      })
      .catch(() => {})
  }, [propertyId])

  useEffect(() => {
    if (!arrive && !depart) return
    const url = new URL(window.location.href)
    if (arrive) url.searchParams.set('arrive', arrive)
    else url.searchParams.delete('arrive')
    if (depart) url.searchParams.set('depart', depart)
    else url.searchParams.delete('depart')
    window.history.replaceState({}, '', url.toString())
  }, [arrive, depart])

  const hasValidRange = useMemo(() => {
    return Boolean(arrive && depart && arrive < depart)
  }, [arrive, depart])

  useEffect(() => {
    setClientSecret(null)
  }, [arrive, depart, selectedAddOnIds, promoCode, form.adults, form.children, form.pets])

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
            promo_code: promoCode || undefined,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Quote failed' }))
          throw new Error(err.detail || `HTTP ${res.status}`)
        }
        const data = await res.json()
        if (!data.line_items || !data.summary) {
          throw new Error('Invalid quote response from server')
        }
        setQuote(data)
      } catch (error: any) {
        setQuoteError(error.message || 'Failed to calculate reservation total')
        setQuote(null)
      } finally {
        setQuoteLoading(false)
      }
    }

    const timer = setTimeout(fetchQuote, 300)
    return () => clearTimeout(timer)
  }, [propertyId, arrive, depart, form.adults, form.children, form.pets, selectedAddOnIds, promoCode, hasValidRange])

  const validateGuestForm = (): boolean => {
    const errors: Record<string, boolean> = {}
    if (!form.first_name.trim()) errors.first_name = true
    if (!form.last_name.trim()) errors.last_name = true
    if (!form.email.trim() || !form.email.includes('@')) errors.email = true
    if (!form.phone.trim()) errors.phone = true
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const continueToPayment = async () => {
    if (!quote || !hasValidRange) return
    if (!validateGuestForm()) {
      setCheckoutError('Please complete all required fields before continuing to payment.')
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
          promo_code: promoCode || undefined,
          total_cents: Math.round(quote.summary.grand_total * 100),
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

  const inputBase =
    'w-full px-3 py-2.5 border rounded-[6px] bg-white text-[#533e27] text-[15px] focus:outline-none transition-colors'
  const inputClass = (field?: string) =>
    `${inputBase} ${field && formErrors[field] ? 'border-red-400 bg-red-50' : 'border-[#d4c4a8] focus:border-[#7c2c00]'}`
  const dateInputClass =
    'w-[165px] px-3 py-2.5 border border-[#d4c4a8] rounded-[6px] bg-white text-[#533e27] text-base focus:outline-none focus:border-[#7c2c00]'
  const labelClass = 'block text-[#533e27] text-[13px] mb-1 italic'

  const isGuestFormComplete =
    form.first_name.trim() && form.last_name.trim() && form.email.trim() && form.phone.trim()

  return (
    <div className="py-5 px-5">
      <h1 className="font-normal italic text-[42px] max-[1010px]:text-[36px] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
        Book Your Getaway{cabin ? ` — ${cabin.title}` : ''}
      </h1>

      {/* Cabin Summary Header */}
      {cabin ? (
        <div className="flex flex-col md:flex-row gap-6 mb-8 pb-6 bg-[url('/images/cabin_separator.png')] bg-[center_bottom] bg-no-repeat">
          <div className="flex-1">
            <h2 className="text-[24px] text-[#7c2c00] italic mb-1">{cabin.title}</h2>
            {cabin.address?.city || cabin.address?.state ? (
              <p className="text-[#7c2c00] italic text-[16px] mb-2">
                {cabin.address?.city}
                {cabin.address?.city && cabin.address?.state ? ', ' : ''}
                {cabin.address?.state}
              </p>
            ) : null}
            <p className="text-[#533e27] italic text-[15px] mb-1">
              {cabin.property_type?.length ? cabin.property_type.map((pt) => pt.name).join(', ') : ''}
            </p>
            <p className="text-[#533e27] italic text-[15px] mb-2">
              {cabin.bedrooms ? `${cabin.bedrooms} Bedroom, ` : ''}
              {cabin.bathrooms ? `${cabin.bathrooms} Bath` : ''}
              {cabin.sleeps ? ` ~ Sleeps ${cabin.sleeps}` : ''}
            </p>
            {cabin.today_rate ? (
              <p className="text-[#533e27] italic text-[15px]">
                from ${Math.round(cabin.today_rate)}/night
              </p>
            ) : null}
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

      {/* Two-column layout: Left = form controls, Right = sticky total */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column — calendar, details, add-ons */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[130%] text-[#533e27] italic">Availability</h2>
            {!hasValidRange ? (
              <p className="text-[#7c2c00] italic text-sm text-right">
                Select your dates on the calendar below to begin your reservation.
              </p>
            ) : null}
          </div>

          <AvailabilityCalendar
            cabinId={propertyId}
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

          {/* Getaway Details */}
          <div className="mt-5 rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-4">
            <h3 className="text-[130%] text-[#7c2c00] italic mb-4">Details of your Getaway</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className={labelClass}>Arrival</label>
                <input
                  type="date"
                  className={dateInputClass}
                  value={arrive}
                  onChange={(e) => setArrive(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Departure</label>
                <input
                  type="date"
                  className={dateInputClass}
                  value={depart}
                  min={arrive}
                  onChange={(e) => setDepart(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Adults</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  className={inputBase + ' w-[80px] border-[#d4c4a8] focus:border-[#7c2c00]'}
                  value={form.adults}
                  onChange={(e) => updateForm('adults', Number(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className={labelClass}>Children</label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  className={inputBase + ' w-[90px] border-[#d4c4a8] focus:border-[#7c2c00]'}
                  value={form.children}
                  onChange={(e) => updateForm('children', Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className={labelClass}>Pets</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  className={inputBase + ' w-[80px] border-[#d4c4a8] focus:border-[#7c2c00]'}
                  value={form.pets}
                  onChange={(e) => updateForm('pets', Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div className="mt-5 rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-4">
            <h3 className="text-[130%] text-[#7c2c00] italic mb-3">Discount Code</h3>
            <input
              type="text"
              placeholder="Enter promo code"
              className={inputBase + ' max-w-[260px] uppercase border-[#d4c4a8] focus:border-[#7c2c00]'}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
          </div>

          {/* Optional Add-Ons */}
          <div className="mt-8 rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-4">
            <h3 className="text-[130%] text-[#7c2c00] italic mb-4">Optional Add-Ons</h3>
            <BookingAddOns
              propertyId={propertyId}
              selectedIds={selectedAddOnIds}
              onSelectionChange={setSelectedAddOnIds}
            />
          </div>
        </div>

        {/* Right column — sticky Reservation Total */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <ReservationTotal
            quote={quote}
            quoteLoading={quoteLoading}
            quoteError={quoteError}
            hasValidRange={hasValidRange}
          />
        </div>
      </div>

      {/* Guest Information */}
      <div className="mt-10 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat pt-8">
        <h2 className="font-normal italic text-[170%] text-[#7c2c00] leading-[100%] mb-5">
          Guest Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          <div>
            <label className={labelClass}>First Name *</label>
            <input
              className={inputClass('first_name')}
              required
              placeholder="First Name"
              value={form.first_name}
              onChange={(e) => updateForm('first_name', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input
              className={inputClass('last_name')}
              required
              placeholder="Last Name"
              value={form.last_name}
              onChange={(e) => updateForm('last_name', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              className={inputClass('email')}
              required
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input
              type="tel"
              className={inputClass('phone')}
              required
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <input
              className={inputClass()}
              placeholder="Street address"
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input
              className={inputClass()}
              placeholder="City"
              value={form.city}
              onChange={(e) => updateForm('city', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>State</label>
              <input
                className={inputClass()}
                placeholder="GA"
                value={form.state}
                onChange={(e) => updateForm('state', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Zip</label>
              <input
                className={inputClass()}
                placeholder="30513"
                value={form.zip_code}
                onChange={(e) => updateForm('zip_code', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Continue to Payment / Stripe Payment */}
        {!clientSecret ? (
          <div className="mt-6 max-w-4xl">
            {checkoutError ? (
              <p className="mb-3 text-red-600 italic text-sm">{checkoutError}</p>
            ) : null}
            <button
              type="button"
              onClick={continueToPayment}
              disabled={!quote || !quote.is_bookable || checkoutLoading || !isGuestFormComplete}
              className="w-full md:w-auto px-10 py-3.5 bg-[url('/images/bg_search_repeat.png')] bg-repeat-x rounded-[20px] text-white text-[140%] italic cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,.3)' }}
            >
              {checkoutLoading ? 'Preparing Secure Payment...' : 'Continue to Payment →'}
            </button>
            {!quote && hasValidRange && !quoteLoading ? (
              <p className="mt-3 text-[#533e27] italic text-[13px]">
                Please wait while we calculate your reservation total.
              </p>
            ) : null}
            {!hasValidRange ? (
              <p className="mt-3 text-[#7c2c00] italic text-[13px]">
                Please select your arrival and departure dates above.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 max-w-xl">
            <h2 className="font-normal italic text-[170%] text-[#7c2c00] leading-[100%] mb-5">
              Secure Payment
            </h2>
            {stripeInstance ? (
              <Elements
                stripe={stripeInstance}
                options={{ clientSecret, appearance: { theme: 'stripe' } }}
              >
                <PaymentSection
                  onSubmitSuccess={() => {
                    const piId = clientSecret?.split('_secret_')[0] || ''
                    router.push(`/checkout/success?payment_intent=${piId}`)
                  }}
                />
              </Elements>
            ) : (
              <p className="text-[#533e27] italic text-sm">Loading payment form...</p>
            )}
          </div>
        )}
      </div>

      {/* Clean funnel footer — no distracting cross-sell or memories */}
      <div className="mt-12 pt-6 border-t border-[#e8dcc8] text-center text-[#533e27] text-[13px] italic">
        <p>
          Need help? Call us at{' '}
          <a href="tel:7064322140" className="text-[#7c2c00] underline hover:text-[#b7714b]">
            (706) 432-2140
          </a>{' '}
          or email{' '}
          <a
            href="mailto:info@cabin-rentals-of-georgia.com"
            className="text-[#7c2c00] underline hover:text-[#b7714b]"
          >
            info@cabin-rentals-of-georgia.com
          </a>
        </p>
        <p className="mt-2">Available to reserve online 24/7</p>
      </div>
    </div>
  )
}

export default function CheckoutPage({ params }: { params: { property_id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="py-10 px-5 text-center text-[#533e27] italic">Loading checkout...</div>
      }
    >
      <CheckoutInner propertyId={params.property_id} />
    </Suspense>
  )
}
