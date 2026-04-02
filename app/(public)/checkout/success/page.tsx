'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

interface Confirmation {
  status: string
  confirmation_code: string | null
  property_name: string | null
  check_in: string | null
  check_out: string | null
  nights: number | null
  guest_name: string | null
  total_amount: number | null
  payment_intent_id: string
}

function SuccessInner() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent') || searchParams.get('payment_intent_client_secret')?.split('_secret_')[0] || ''
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [loading, setLoading] = useState(true)
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    if (!paymentIntentId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchConfirmation() {
      try {
        const res = await fetch(`/api/proxy/api/v1/checkout/confirmation/${paymentIntentId}`)
        if (!res.ok) throw new Error('Failed to fetch confirmation')
        const data: Confirmation = await res.json()
        if (!cancelled) {
          setConfirmation(data)
          if (!data.confirmation_code && pollCount < 10) {
            setTimeout(() => setPollCount((c) => c + 1), 3000)
          }
        }
      } catch {
        if (!cancelled && pollCount < 10) {
          setTimeout(() => setPollCount((c) => c + 1), 3000)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchConfirmation()
    return () => { cancelled = true }
  }, [paymentIntentId, pollCount])

  const formatDate = (iso: string | null) => {
    if (!iso) return ''
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="py-10 px-5 text-center max-w-xl mx-auto">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-[180%] text-[#7c2c00] italic mb-2">Reservation Confirmed!</h1>
        <p className="text-[#533e27] text-lg">
          Thank you for booking with Cabin Rentals of Georgia.
          {confirmation?.confirmation_code ? ' Your confirmation code is below.' : ' A confirmation email has been sent to your inbox.'}
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-6 mb-6">
          <p className="text-[#533e27] italic">Loading your reservation details...</p>
        </div>
      ) : confirmation?.confirmation_code ? (
        <div className="rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-6 mb-6 text-left">
          <div className="text-center mb-4">
            <p className="text-[11px] uppercase tracking-wider text-[#7c2c00] font-semibold">Confirmation Code</p>
            <p className="text-3xl font-bold text-[#7c2c00] tracking-wider">{confirmation.confirmation_code}</p>
          </div>
          <div className="border-t border-[#d4c4a8] pt-4 space-y-2 text-[#533e27]">
            {confirmation.property_name ? (
              <div className="flex justify-between">
                <span className="font-semibold">Property</span>
                <span>{confirmation.property_name}</span>
              </div>
            ) : null}
            {confirmation.guest_name ? (
              <div className="flex justify-between">
                <span className="font-semibold">Guest</span>
                <span>{confirmation.guest_name}</span>
              </div>
            ) : null}
            {confirmation.check_in ? (
              <div className="flex justify-between">
                <span className="font-semibold">Check-In</span>
                <span>{formatDate(confirmation.check_in)}</span>
              </div>
            ) : null}
            {confirmation.check_out ? (
              <div className="flex justify-between">
                <span className="font-semibold">Check-Out</span>
                <span>{formatDate(confirmation.check_out)}</span>
              </div>
            ) : null}
            {confirmation.nights ? (
              <div className="flex justify-between">
                <span className="font-semibold">Nights</span>
                <span>{confirmation.nights}</span>
              </div>
            ) : null}
            {confirmation.total_amount ? (
              <div className="flex justify-between border-t border-[#d4c4a8] pt-2 mt-2 text-lg font-bold text-[#7c2c00]">
                <span>Total Paid</span>
                <span>${confirmation.total_amount.toFixed(2)}</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-6 mb-6">
          <p className="text-[#533e27] italic">
            {confirmation?.status === 'processing (succeeded)'
              ? 'Payment confirmed! Your reservation is being created — this page will update momentarily.'
              : 'Your payment is being processed. Please check your email for confirmation details.'}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-[#d4c4a8] bg-[#faf6ee] p-6 mb-6 text-left">
        <h2 className="text-lg text-[#7c2c00] italic mb-3">What happens next?</h2>
        <ul className="space-y-2 text-[#533e27]">
          <li className="flex items-start gap-2">
            <span className="text-[#7c2c00] font-bold">1.</span>
            You will receive a confirmation email with your reservation details.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7c2c00] font-bold">2.</span>
            Check-in instructions and access codes will be sent 24 hours before arrival.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7c2c00] font-bold">3.</span>
            Our team is available at 706-432-2140 for any questions.
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-[#7c2c00] text-white italic hover:bg-[#5a1f00] transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/blue-ridge-cabins"
          className="px-6 py-3 rounded-xl border border-[#7c2c00] text-[#7c2c00] italic hover:bg-[#7c2c00]/5 transition-colors"
        >
          Browse More Cabins
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="py-10 px-5 text-center text-[#533e27] italic">Loading...</div>}>
      <SuccessInner />
    </Suspense>
  )
}
