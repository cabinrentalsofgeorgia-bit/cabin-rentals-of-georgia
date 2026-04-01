import Link from 'next/link'

export default function CheckoutSuccessPage() {
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
          Thank you for booking with Cabin Rentals of Georgia. A confirmation email has been sent to your inbox.
        </p>
      </div>

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
