'use client'

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import Image from 'next/image'

import BookingAddOns from '@/components/booking/BookingAddOns'
import AvailabilityCalendar from '@/components/cabin/AvailabilityCalendar'
import DemandBadge from '@/components/ui/DemandBadge'

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
  amount_cents: number
  is_taxable: boolean
  is_refundable: boolean
  refund_policy: string
  type: 'rent' | 'fee' | 'addon' | 'tax' | 'deposit' | 'discount'
  bucket?: 'lodging' | 'admin' | 'goods' | 'service' | 'exempt' | 'tax'
}

interface TaxBreakdownDetail {
  tax_name: string
  tax_rate: number
  taxable_base_cents: number
  amount_cents: number
  bucket: string
}

interface TaxBreakdown {
  state_sales_tax_cents: number
  county_sales_tax_cents: number
  lodging_tax_cents: number
  hospitality_tax_cents: number
  dot_fee_cents: number
  total_tax_cents: number
  county: string
  details: TaxBreakdownDetail[]
}

interface LedgerSummary {
  taxable_subtotal_cents: number
  tax_amount_cents: number
  non_taxable_subtotal_cents: number
  grand_total_cents: number
  tax_breakdown: TaxBreakdown | null
}

interface OptionalFeeOption {
  id: string
  name: string
  amount_cents: number
}

function formatDollars(cents: number): string {
  return (cents / 100).toFixed(2)
}

interface QuoteResponse {
  property_id: string
  property_name: string
  nights: number
  line_items: LedgerLineItem[]
  summary: LedgerSummary
  is_bookable: boolean
  currency: string
  available_enhancements?: OptionalFeeOption[]
}

/* ------------------------------------------------------------------ */
/*  Stripe Payment Section                                            */
/* ------------------------------------------------------------------ */

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
      {error ? <p className="text-red-600 italic text-[15px]">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="mt-2 w-full py-3 bg-[url('/images/bg_search_repeat.png')] bg-repeat-x rounded-[20px] text-white text-[22.4px] italic cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: '"Fanwood Text", serif', boxShadow: '0 2px 4px rgba(0,0,0,.3)' }}
      >
        {loading ? 'Processing...' : 'Complete Reservation'}
      </button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Reservation Total (sticky sidebar)                                */
/* ------------------------------------------------------------------ */

function ReservationTotal({
  quote,
  quoteLoading,
  quoteError,
  hasValidRange,
  selectedEnhancements,
  onToggleEnhancement,
}: {
  quote: QuoteResponse | null
  quoteLoading: boolean
  quoteError: string | null
  hasValidRange: boolean
  selectedEnhancements: Set<string>
  onToggleEnhancement: (id: string) => void
}) {
  const [taxOpen, setTaxOpen] = useState(false)

  return (
    <div className="rounded-xl border border-[#e8dcc8] bg-[#faf6ef] p-5 shadow-sm">
      <h3
        className="text-[20.8px] text-[#7c2c00] italic mb-3 pb-2 border-b border-[#e8dcc8]"
        style={{ fontFamily: '"Fanwood Text", serif', lineHeight: '20.8px' }}
      >
        Reservation Total
      </h3>

      {quoteLoading ? (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-[#7c2c00] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#533e27] italic text-[15px]" style={{ fontFamily: '"Fanwood Text", serif' }}>
            Calculating your getaway...
          </p>
        </div>
      ) : quote?.line_items && quote?.summary ? (
        <div className="space-y-3 text-[#533e27] text-[15px]" style={{ fontFamily: '"Fanwood Text", serif' }}>
          <div className="text-[14px] italic pb-2 border-b border-[#e8dcc8]/60">
            {quote.property_name} &middot; {quote.nights} {quote.nights === 1 ? 'night' : 'nights'}
          </div>

          {/* Dynamic bucket-based fee grouping */}
          {(() => {
            const lodgingItems = quote.line_items.filter(
              (i) => (i.bucket === 'lodging' || (!i.bucket && (i.type === 'rent' || i.type === 'fee' || i.type === 'discount'))) && i.type !== 'tax'
            )
            const adminItems = quote.line_items.filter(
              (i) =>
                (i.bucket === 'admin' || i.bucket === 'exempt') &&
                i.type !== 'deposit' &&
                i.type !== 'addon' &&
                i.type !== 'tax'
            )
            const goodsItems = quote.line_items.filter((i) => i.bucket === 'goods' || i.type === 'addon')
            const serviceItems = quote.line_items.filter((i) => i.bucket === 'service')
            const depositItems = quote.line_items.filter((i) => i.type === 'deposit')

            const renderSection = (label: string, items: LedgerLineItem[], isFirst: boolean) =>
              items.length > 0 ? (
                <div className={isFirst ? 'space-y-1' : 'border-t border-[#e8dcc8] pt-2 space-y-1'}>
                  <p className="text-[11px] uppercase tracking-wider text-[#7c2c00] font-semibold">{label}</p>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className={item.amount_cents < 0 ? 'text-green-700' : ''}>
                        {item.amount_cents < 0 ? '-' : ''}${formatDollars(Math.abs(item.amount_cents))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null

            let sectionRendered = false
            const sections = [
              { label: 'Lodging & Fees', items: lodgingItems },
              { label: 'Protection & Processing', items: adminItems },
              { label: 'Add-Ons', items: goodsItems },
              { label: 'Services', items: serviceItems },
              { label: 'Deposits', items: depositItems },
            ]

            return (
              <>
                {sections.map(({ label, items }) => {
                  if (items.length === 0) return null
                  const isFirst = !sectionRendered
                  sectionRendered = true
                  return <div key={label}>{renderSection(label, items, isFirst)}</div>
                })}
              </>
            )
          })()}

          {/* Stay Enhancements — optional fees the guest can toggle */}
          {quote.available_enhancements && quote.available_enhancements.length > 0 && (
            <div className="border-t border-[#e8dcc8] pt-2 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-[#7c2c00] font-semibold">
                Stay Enhancements
              </p>
              {quote.available_enhancements.map((enh) => {
                const isOn = selectedEnhancements.has(enh.id)
                return (
                  <label
                    key={enh.id}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                          isOn ? 'bg-[#7c2c00]' : 'bg-[#d4c8b8]'
                        }`}
                        onClick={(e) => { e.preventDefault(); onToggleEnhancement(enh.id) }}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                            isOn ? 'translate-x-[18px]' : 'translate-x-0.5'
                          }`}
                        />
                      </span>
                      <span className={isOn ? 'text-[#533e27]' : 'text-[#9a8b78]'}>
                        {enh.name}
                      </span>
                    </span>
                    <span className={isOn ? 'text-[#533e27] font-semibold' : 'text-[#9a8b78]'}>
                      +${formatDollars(enh.amount_cents)}
                    </span>
                  </label>
                )
              })}
            </div>
          )}

          {/* Taxes & Assessments — with collapsible breakdown */}
          {quote.summary.tax_amount_cents > 0 && (
            <div className="border-t border-[#e8dcc8] pt-2 space-y-1">
              <button
                type="button"
                onClick={() => setTaxOpen(!taxOpen)}
                className="flex items-center justify-between w-full text-left group"
              >
                <p className="text-[11px] uppercase tracking-wider text-[#7c2c00] font-semibold">
                  Tax &amp; Fees Breakdown
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-semibold text-[#7c2c00]">
                    ${formatDollars(quote.summary.tax_amount_cents)}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-[#7c2c00] transition-transform ${taxOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {taxOpen && quote.summary.tax_breakdown ? (
                <div className="mt-2 pt-2 border-t border-[#e8dcc8]/40 space-y-1.5 text-[13px]">
                  {quote.summary.tax_breakdown.state_sales_tax_cents > 0 && (
                    <div className="flex justify-between">
                      <span>GA State Sales Tax</span>
                      <span>${formatDollars(quote.summary.tax_breakdown.state_sales_tax_cents)}</span>
                    </div>
                  )}
                  {quote.summary.tax_breakdown.county_sales_tax_cents > 0 && (
                    <div className="flex justify-between">
                      <span>{quote.summary.tax_breakdown.county} County Sales Tax</span>
                      <span>${formatDollars(quote.summary.tax_breakdown.county_sales_tax_cents)}</span>
                    </div>
                  )}
                  {quote.summary.tax_breakdown.lodging_tax_cents > 0 && (
                    <div className="flex justify-between">
                      <span>{quote.summary.tax_breakdown.county} County Lodging Tax</span>
                      <span>${formatDollars(quote.summary.tax_breakdown.lodging_tax_cents)}</span>
                    </div>
                  )}
                  {quote.summary.tax_breakdown.hospitality_tax_cents > 0 && (
                    <div className="flex justify-between">
                      <span>{quote.summary.tax_breakdown.county} Hospitality Tax</span>
                      <span>${formatDollars(quote.summary.tax_breakdown.hospitality_tax_cents)}</span>
                    </div>
                  )}
                  {quote.summary.tax_breakdown.dot_fee_cents > 0 && (
                    <div className="flex justify-between">
                      <span>GA DOT Fee</span>
                      <span>${formatDollars(quote.summary.tax_breakdown.dot_fee_cents)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-[#e8dcc8]/40 font-semibold text-[#7c2c00]">
                    <span>Total Taxes &amp; Fees</span>
                    <span>${formatDollars(quote.summary.tax_breakdown.total_tax_cents)}</span>
                  </div>
                </div>
              ) : taxOpen ? (
                <div className="mt-2 space-y-1 text-[13px]">
                  {quote.line_items
                    .filter((i) => i.type === 'tax')
                    .map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>${formatDollars(item.amount_cents)}</span>
                      </div>
                    ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Security Deposits */}
          {(() => {
            const depositItems = quote.line_items.filter((i) => i.type === 'deposit')
            return depositItems.length > 0 ? (
              <div className="border-t border-[#e8dcc8] pt-2 space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-[#7c2c00] font-semibold">
                  Security Deposits
                </p>
                {depositItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>${formatDollars(item.amount_cents)}</span>
                  </div>
                ))}
              </div>
            ) : null
          })()}

          {/* Subtotals */}
          {quote.summary.taxable_subtotal_cents > 0 && (
            <div className="border-t border-[#e8dcc8] pt-2 space-y-1">
              <div className="flex justify-between text-[14px]">
                <span>Subtotal</span>
                <span>${formatDollars(quote.summary.taxable_subtotal_cents)}</span>
              </div>
              {quote.summary.tax_amount_cents > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span>Tax Total</span>
                  <span>${formatDollars(quote.summary.tax_amount_cents)}</span>
                </div>
              )}
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between pt-3 border-t-2 border-[#7c2c00] text-[18px] font-bold text-[#7c2c00]">
            <span>Total</span>
            <span>${formatDollars(quote.summary.grand_total_cents)}</span>
          </div>

          {!quote.is_bookable && (
            <p className="text-red-600 italic text-[13px] mt-2">
              This property is not available for the selected dates.
            </p>
          )}
        </div>
      ) : quoteError ? (
        <div className="py-3">
          <p className="text-red-600 italic text-[15px]" style={{ fontFamily: '"Fanwood Text", serif' }}>
            {quoteError}
          </p>
          <p className="text-[#533e27] italic text-[13px] mt-2" style={{ fontFamily: '"Fanwood Text", serif' }}>
            Please adjust your dates or contact us at (706) 432-2140.
          </p>
        </div>
      ) : (
        <div className="py-4 text-center" style={{ fontFamily: '"Fanwood Text", serif' }}>
          <p className="text-[#533e27] italic text-[15px] mb-2">
            Select your arrival and departure dates to see pricing.
          </p>
          <p className="text-[#7c2c00] text-[13px]">
            Click two dates on the calendar or use the date inputs below.
          </p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Travelex Insurance Section                                        */
/* ------------------------------------------------------------------ */

function TravelexSection() {
  return (
    <div className="mt-8 pt-6 border-t border-[#e8dcc8]">
      <div className="flex items-start gap-4 mb-4">
        <Image
          src="/images/travelex_logo.png"
          alt="Travelex Insurance Services"
          width={145}
          height={38}
          className="object-contain flex-shrink-0 mt-1"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>
      <div className="text-[#533e27] italic text-[15.2px] leading-[160%]" style={{ fontFamily: '"Fanwood Text", serif' }}>
        <p>
          <span className="text-red-600">*</span> In today&apos;s changing travel environment,
          it&apos;s important to protect your travel investment so you can relax and enjoy your
          trip. Unforeseen events such as flight delays, baggage loss or even a sudden sickness or
          injury could impact your travel plans. For your convenience, we offer Travelex Insurance
          Services{' '}
          <a
            href="https://partner.travelexinsurance.com/docs/tis/retail-products/travel-basic-flyer-std-no-rates_tbb-0623_final_06012023.pdf?sfvrsn=60ee9ca4_5"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#7c2c00] hover:text-[#b7714b]"
          >
            Travel Basic
          </a>
          ,{' '}
          <a
            href="https://partner.travelexinsurance.com/docs/tis/retail-products/travel-select-flyer-std-no-rates_tsb-0623_final_06012023.pdf?sfvrsn=b8ee9ca4_3"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#7c2c00] hover:text-[#b7714b]"
          >
            Travel Select
          </a>
          , and{' '}
          <a
            href="https://partner.travelexinsurance.com/docs/tis/specialty-risk-products/post-departure-plan-flyer-std-final-4.22.22.pdf?sfvrsn=70ba9fa4_3"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#7c2c00] hover:text-[#b7714b]"
          >
            Travel Med
          </a>{' '}
          protection plans to help protect you and your travel investment against the unexpected.
        </p>
        <p className="mt-3">
          For more information on the available plans{' '}
          <a
            href="https://www.travelexinsurance.com/highlights"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#7c2c00] hover:text-[#b7714b]"
          >
            click here
          </a>{' '}
          or contact Travelex Insurance{' '}
          <span className="font-bold not-italic">800-228-9792</span> and reference location
          number <span className="font-bold not-italic">10-0454</span>.
        </p>
      </div>

      {/* Terms & Conditions */}
      <div
        className="mt-6 pt-4 border-t border-[#e8dcc8] text-[#533e27] text-[14px] italic leading-[150%]"
        style={{ fontFamily: '"Fanwood Text", serif' }}
      >
        <p>
          By completing this reservation, you agree to our{' '}
          <a href="/rental-policies" className="text-[#7c2c00] underline hover:text-[#b7714b]">
            Rental Policies &amp; Terms
          </a>
          , including cancellation policies, check-in/check-out procedures, and pet policies.
          A rental agreement will be sent to the email address provided. All rates are subject
          to applicable state, local, and DOT taxes as shown in the Reservation Total above.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Checkout Content                                             */
/* ------------------------------------------------------------------ */

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
  const [selectedEnhancements, setSelectedEnhancements] = useState<Set<string>>(new Set())
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    adults: 2,
    children: 0,
    pets: 0,
    pets_detail: '',
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

  const enhancementsKey = useMemo(
    () => Array.from(selectedEnhancements).sort().join(','),
    [selectedEnhancements],
  )

  useEffect(() => {
    setClientSecret(null)
  }, [arrive, depart, selectedAddOnIds, enhancementsKey, promoCode, form.adults, form.children, form.pets])

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
        const allSelectedIds = [...selectedAddOnIds, ...Array.from(selectedEnhancements)]
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
            selected_add_on_ids: allSelectedIds,
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
  }, [propertyId, arrive, depart, form.adults, form.children, form.pets, selectedAddOnIds, enhancementsKey, promoCode, hasValidRange])

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
      const allSelectedIds = [...selectedAddOnIds, ...Array.from(selectedEnhancements)]
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
          selected_add_on_ids: allSelectedIds,
          promo_code: promoCode || undefined,
          total_cents: quote.summary.grand_total_cents,
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

  /*
   * Legacy form styles extracted via Playwright:
   *   label: Fanwood Text 16px, italic, #533e27
   *   input: Fanwood Text 16px, 28px height, border #594634
   */
  const labelClass =
    'block text-[#533e27] text-[16px] italic mb-1'
  const inputBase =
    'w-full px-[15px] py-[4px] border bg-transparent text-[#533e27] text-[16px] focus:outline-none transition-colors'
  const inputClass = (field?: string) =>
    `${inputBase} ${field && formErrors[field] ? 'border-red-400 bg-red-50' : 'border-[#594634] focus:border-[#7c2c00]'}`
  const dateInputClass =
    'w-[165px] px-[15px] py-[4px] border border-[#594634] bg-transparent text-[#533e27] text-[16px] focus:outline-none focus:border-[#7c2c00]'
  const selectClass =
    'px-2 py-[4px] border border-[#594634] bg-transparent text-[#533e27] text-[16px] focus:outline-none focus:border-[#7c2c00]'

  const isGuestFormComplete =
    form.first_name.trim() && form.last_name.trim() && form.email.trim() && form.phone.trim()

  const fontLegacy: React.CSSProperties = { fontFamily: '"Fanwood Text", serif' }

  return (
    <div className="max-w-[972px] mx-auto px-[20px] py-[15px]" style={fontLegacy}>
      {/* ── Page Title ── */}
      <h1
        className="font-normal italic text-[35.2px] text-[#7c2c00] my-[15px]"
        style={{ ...fontLegacy, lineHeight: '35.2px' }}
      >
        Book Your Getaway{cabin ? ` - ${cabin.title}` : ''}
      </h1>

      {cabin?.cabin_slug && (
        <DemandBadge propertySlug={cabin.cabin_slug} className="mb-4" />
      )}

      {/* ══════════════════════════════════════════════════════════════
          TWO-COLUMN LAYOUT  (legacy: content 609px | sidebar 319px)
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row gap-0">
        {/* ── LEFT COLUMN (content) ── */}
        <div className="flex-1 min-w-0 lg:pr-[20px]">

          {/* Cabin Summary — matches legacy .main-image + property info */}
          {cabin ? (
            <div className="mb-6 pb-4 border-b border-[#e8dcc8]">
              <div className="flex flex-col sm:flex-row gap-5">
                {cabin.featured_image_url ? (
                  <div className="w-full sm:w-[260px] flex-shrink-0">
                    <Image
                      src={cabin.featured_image_url}
                      alt={cabin.featured_image_alt || cabin.title}
                      width={260}
                      height={170}
                      className="w-full h-auto object-cover"
                      style={{ padding: '3px', boxShadow: '0px 0px 10px #333' }}
                    />
                  </div>
                ) : null}
                <div>
                  <h2
                    className="text-[27.2px] text-[#7c2c00] italic mb-1"
                    style={{ ...fontLegacy, lineHeight: '27.2px' }}
                  >
                    {cabin.title}
                  </h2>
                  {cabin.address?.city || cabin.address?.state ? (
                    <p className="text-[#533e27] italic text-[16px] mb-2">
                      {cabin.address?.city}
                      {cabin.address?.city && cabin.address?.state ? ', ' : ''}
                      {cabin.address?.state}
                    </p>
                  ) : null}
                  <p className="text-[#533e27] text-[16px] mb-1">
                    {cabin.property_type?.length
                      ? cabin.property_type.map((pt) => pt.name).join(', ')
                      : ''}
                  </p>
                  <p className="text-[#533e27] text-[16px] mb-2">
                    {cabin.bedrooms ? `${cabin.bedrooms} Bedroom, ` : ''}
                    {cabin.bathrooms ? `${cabin.bathrooms} Bath` : ''}
                    {cabin.sleeps ? ` ~ Sleeps ${cabin.sleeps}` : ''}
                  </p>
                  {cabin.today_rate ? (
                    <p className="text-[#533e27] italic text-[16px]">
                      from ${Math.round(cabin.today_rate)}/night
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {/* ── Calendar ── */}
          <AvailabilityCalendar
            cabinId={propertyId}
            months={12}
            showRates={false}
            visibleMonths={3}
            selectable={true}
            selectedArrive={arrive}
            selectedDepart={depart}
            onDateSelect={(newArrive, newDepart) => {
              setArrive(newArrive)
              setDepart(newDepart)
            }}
          />

          {/* ══════════════════════════════════════════════════════════
              DETAILS OF YOUR GETAWAY — matches legacy form exactly
              ══════════════════════════════════════════════════════════ */}
          <div className="mt-6">
            <h2
              className="text-[27.2px] text-[#7c2c00] italic mb-4"
              style={{ ...fontLegacy, lineHeight: '27.2px' }}
            >
              Details of your Getaway
            </h2>

            {/* Arrival / Departure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass} style={fontLegacy}>Arrival *</label>
                <input
                  type="date"
                  className={dateInputClass}
                  style={fontLegacy}
                  value={arrive}
                  onChange={(e) => setArrive(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} style={fontLegacy}>Departure *</label>
                <input
                  type="date"
                  className={dateInputClass}
                  style={fontLegacy}
                  value={depart}
                  min={arrive}
                  onChange={(e) => setDepart(e.target.value)}
                />
              </div>
            </div>

            {/* Adults / Children / Pets */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClass} style={fontLegacy}>Adults *</label>
                <select
                  className={selectClass}
                  style={fontLegacy}
                  value={form.adults}
                  onChange={(e) => updateForm('adults', Number(e.target.value) || 1)}
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} style={fontLegacy}>Children</label>
                <select
                  className={selectClass}
                  style={fontLegacy}
                  value={form.children}
                  onChange={(e) => updateForm('children', Number(e.target.value) || 0)}
                >
                  {Array.from({ length: 25 }, (_, i) => i).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} style={fontLegacy}>Pets</label>
                <select
                  className={selectClass}
                  style={fontLegacy}
                  value={form.pets}
                  onChange={(e) => updateForm('pets', Number(e.target.value) || 0)}
                >
                  {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pet detail — shown only when pets > 0 */}
            {form.pets > 0 && (
              <div className="mb-4">
                <label className={labelClass} style={fontLegacy}>
                  Enter breed and weight of your pet(s)
                </label>
                <input
                  type="text"
                  className={inputClass()}
                  style={fontLegacy}
                  placeholder="e.g., Golden Retriever, 65 lbs"
                  value={form.pets_detail}
                  onChange={(e) => updateForm('pets_detail', e.target.value)}
                />
              </div>
            )}

            {/* Discount Coupon Code */}
            <div className="mb-4">
              <label className={labelClass} style={fontLegacy}>Discount Coupon Code</label>
              <input
                type="text"
                className={inputClass() + ' max-w-[300px] uppercase'}
                style={fontLegacy}
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              />
            </div>

            {/* Optional Add-Ons — legacy shows as checkboxes with price in label */}
            <div className="mt-6 mb-6">
              <BookingAddOns
                propertyId={propertyId}
                selectedIds={selectedAddOnIds}
                onSelectionChange={setSelectedAddOnIds}
              />
            </div>
          </div>

          {/* ── Guest Information ── */}
          <div className="mt-6 pt-6 border-t border-[#e8dcc8]">
            <h2
              className="text-[27.2px] text-[#7c2c00] italic mb-4"
              style={{ ...fontLegacy, lineHeight: '27.2px' }}
            >
              Guest Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={fontLegacy}>First Name *</label>
                <input
                  className={inputClass('first_name')}
                  style={fontLegacy}
                  required
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={(e) => updateForm('first_name', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} style={fontLegacy}>Last Name *</label>
                <input
                  className={inputClass('last_name')}
                  style={fontLegacy}
                  required
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={(e) => updateForm('last_name', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} style={fontLegacy}>Email *</label>
                <input
                  type="email"
                  className={inputClass('email')}
                  style={fontLegacy}
                  required
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} style={fontLegacy}>Phone *</label>
                <input
                  type="tel"
                  className={inputClass('phone')}
                  style={fontLegacy}
                  required
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} style={fontLegacy}>Address</label>
                <input
                  className={inputClass()}
                  style={fontLegacy}
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} style={fontLegacy}>City</label>
                <input
                  className={inputClass()}
                  style={fontLegacy}
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={fontLegacy}>State</label>
                  <input
                    className={inputClass()}
                    style={fontLegacy}
                    placeholder="GA"
                    value={form.state}
                    onChange={(e) => updateForm('state', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass} style={fontLegacy}>Zip</label>
                  <input
                    className={inputClass()}
                    style={fontLegacy}
                    placeholder="30513"
                    value={form.zip_code}
                    onChange={(e) => updateForm('zip_code', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Continue to Payment / Stripe Payment */}
            {!clientSecret ? (
              <div className="mt-6">
                {checkoutError ? (
                  <p className="mb-3 text-red-600 italic text-[15px]" style={fontLegacy}>
                    {checkoutError}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={continueToPayment}
                  disabled={!quote || !quote.is_bookable || checkoutLoading || !isGuestFormComplete}
                  className="w-full sm:w-auto px-10 py-3 bg-[url('/images/bg_search_repeat.png')] bg-repeat-x rounded-[20px] text-white text-[22.4px] italic cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ ...fontLegacy, boxShadow: '0 2px 4px rgba(0,0,0,.3)' }}
                >
                  {checkoutLoading ? 'Preparing Secure Payment...' : 'Continue to Payment →'}
                </button>
                {!quote && hasValidRange && !quoteLoading ? (
                  <p className="mt-3 text-[#533e27] italic text-[14px]" style={fontLegacy}>
                    Please wait while we calculate your reservation total.
                  </p>
                ) : null}
                {!hasValidRange ? (
                  <p className="mt-3 text-[#7c2c00] italic text-[14px]" style={fontLegacy}>
                    Please select your arrival and departure dates above.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-8 max-w-xl">
                <h2
                  className="text-[27.2px] text-[#7c2c00] italic mb-4"
                  style={{ ...fontLegacy, lineHeight: '27.2px' }}
                >
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
                  <p className="text-[#533e27] italic text-[15px]" style={fontLegacy}>
                    Loading payment form...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Travelex + Terms ── */}
          <TravelexSection />

          {/* ── Contact footer ── */}
          <div
            className="mt-8 pt-6 border-t border-[#e8dcc8] text-center text-[#533e27] text-[14px] italic"
            style={fontLegacy}
          >
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

        {/* ── RIGHT COLUMN (sidebar — 319px) ── */}
        <div className="w-full lg:w-[319px] flex-shrink-0 lg:pl-[1px] mt-8 lg:mt-0">
          <div className="sticky top-4 space-y-6">
            <ReservationTotal
              quote={quote}
              quoteLoading={quoteLoading}
              quoteError={quoteError}
              hasValidRange={hasValidRange}
              selectedEnhancements={selectedEnhancements}
              onToggleEnhancement={(id) => {
                setSelectedEnhancements((prev) => {
                  const next = new Set(prev)
                  if (next.has(id)) next.delete(id)
                  else next.add(id)
                  return next
                })
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage({ params }: { params: { property_id: string } }) {
  return (
    <Suspense
      fallback={
        <div
          className="py-10 px-5 text-center text-[#533e27] italic text-[16px]"
          style={{ fontFamily: '"Fanwood Text", serif' }}
        >
          Loading checkout...
        </div>
      }
    >
      <CheckoutInner propertyId={params.property_id} />
    </Suspense>
  )
}
