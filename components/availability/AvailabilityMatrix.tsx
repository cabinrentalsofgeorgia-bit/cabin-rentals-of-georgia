'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAvailabilityMatrix, AvailabilityMatrixResponse } from '@/lib/api/calendar'

interface AvailabilityMatrixProps {
  year: number
  month: number
}

/**
 * Availability Matrix Component
 * 
 * Displays a table with all cabins as rows and dates as columns.
 * Each cell shows the availability status for that cabin on that date.
 */
export default function AvailabilityMatrix({ year, month }: AvailabilityMatrixProps) {
  const [data, setData] = useState<AvailabilityMatrixResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const result = await getAvailabilityMatrix(year, month)
        setData(result)
      } catch (err: any) {
        setError(err.message || 'Failed to load availability data')
        console.error('Error fetching availability matrix:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [year, month])

  // Generate month options for dropdown (next 12 months)
  const generateMonthOptions = () => {
    const options: Array<{ value: string; label: string; url: string }> = []
    const current = new Date()
    if (current.getDate() > 28) {
      current.setDate(28)
    }

    for (let i = 0; i < 12; i++) {
      const date = new Date(current)
      date.setMonth(date.getMonth() + i)
      const optionYear = date.getFullYear()
      const optionMonth = date.getMonth() + 1
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      options.push({
        value: `${optionYear}/${optionMonth}`,
        label: monthName,
        url: `/availability/${optionYear}/${String(optionMonth).padStart(2, '0')}`,
      })
    }
    return options
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = monthOptions.find(opt => opt.value === e.target.value)
    if (selectedOption) {
      router.push(selectedOption.url)
    }
  }

  if (loading) {
    return (
      <div className="availability-matrix-page py-8 px-5">
        <div className="text-center">
          <p className="text-[#533e27]">Loading availability calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="availability-matrix-page py-8 px-5">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!data || !data.cabins.length) {
    return (
      <div className="availability-matrix-page py-8 px-5">
        <div className="text-center">
          <p className="text-[#533e27]">No availability data found.</p>
        </div>
      </div>
    )
  }

  const monthName = new Date(year, month - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthOptions = generateMonthOptions()
  const currentOption = monthOptions.find(
    opt => opt.value === `${year}/${month}`
  ) || monthOptions[0]

  // Generate array of dates for the month
  const dates: Array<{ day: number; dayOfWeek: number; dateStr: string }> = []
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    dates.push({
      day,
      dayOfWeek: date.getDay(), // 0 = Sunday, 6 = Saturday
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }

  // Get CSS class for a date
  const getCssClass = (cabin: typeof data.cabins[0], dateStr: string): string => {
    return cabin.availability[dateStr] || 'cal-available'
  }


  return (
    <div className="availability-matrix-page py-8 px-5">
      {/* Page Title */}
      <h1 className="text-[#7c2c00] text-[42px] max-[1010px]:text-[36px] font-normal italic leading-[100%] mb-4">
        Blue Ridge Cabin Rental Availability
      </h1>

      {/* Introductory Text */}
      <div className="text-[#533e27] mb-6 space-y-4">
        <p>
          Our Blue Ridge cabin rental availability calendar is up-to-date by the second. For help
          choosing a luxury cabin, call us at{' '}
          <a href="tel:706-432-2140" className="text-[#7c2c00] hover:underline">
            706-432-2140
          </a>
          .
        </p>
        <p>
          If you want to book online, from this calendar click on your cabin of choice, get an
          Instant Quote, and book directly online. You will then receive all the information you
          need - Welcome Emails, Directions, Things To Do, etc.
        </p>
        <p>
          We would love to help you plan fun things for you to do while in Blue Ridge ~ direct you
          to our favorite outfitters, locales, adventures, and eateries. Whether you seek a quiet
          relaxing getaway, or a true North Georgia Mountain adventure filled with hiking, boating,
          fishing, rafting, canoeing, or kayaking, we have the perfect luxury cabin rental for you.
        </p>
      </div>

      {/* Availability Legend */}
      <div className="cal-key mb-4 flex flex-wrap gap-4 justify-start">
        <div className="flex items-center gap-2">
          <span
            className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_available3.png')] bg-no-repeat bg-[left_center] bg-contain"
            style={{ minHeight: '20px' }}
          >
            Available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_in3.png')] bg-no-repeat bg-[left_center] bg-contain"
            style={{ minHeight: '20px' }}
          >
            Check In
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_out3.png')] bg-no-repeat bg-[left_center] bg-contain"
            style={{ minHeight: '20px' }}
          >
            Check Out
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_inout3.png')] bg-no-repeat bg-[left_center] bg-contain"
            style={{ minHeight: '20px' }}
          >
            Turn-Around Date (Reserved)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_booked3.png')] bg-no-repeat bg-[left_center] bg-contain"
            style={{ minHeight: '20px' }}
          >
            Reserved
          </span>
        </div>
      </div>

      {/* Month Selector */}
      <div className="availability-select mb-4">
        <select
          value={currentOption.value}
          onChange={handleMonthChange}
          className="bg-[#7c2c00] text-white px-4 py-2 rounded cursor-pointer border-none"
          style={{
            fontFamily: 'Fanwood Text, serif',
            fontSize: '18px',
          }}
        >
          {monthOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Availability Table */}
      <div className="availability-table-container overflow-x-auto">
        <table id="availability-matrix" className="w-full border-collapse">
          <thead>
            <tr>
              <th className="header-cell text-left p-2 border-none text-[#533e27] font-semibold">
                Cabin
              </th>
              <th
                colSpan={daysInMonth}
                className="text-center p-2 border-none text-[#533e27] font-semibold text-xl"
              >
                {monthName}
              </th>
            </tr>
            <tr>
              <th className="header-cell border-none"></th>
              {dates.map(date => {
                const dayLabel = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.dayOfWeek]
                const isWeekend = date.dayOfWeek === 0 || date.dayOfWeek === 6
                return (
                  <th
                    key={date.day}
                    className={`dow dotw${date.dayOfWeek} text-center p-1 border-none text-[#533e27] font-semibold text-sm ${
                      isWeekend ? 'weekend' : ''
                    }`}
                  >
                    <div>{dayLabel}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {data.cabins.map(cabin => {
              // Build cabin URL from slug
              const cabinUrl = cabin.cabin_slug
                ? `/cabin/${cabin.cabin_slug}`
                : `/cabin/${cabin.cabin_id}`

              return (
                <tr key={cabin.cabin_id}>
                  <td className="cabin-title text-left p-2 border border-[#7c2c00]">
                    <div className="w-[160px]">
                      <Link
                        href={cabinUrl}
                        className="text-[#7c2c00] hover:underline font-semibold"
                      >
                        {cabin.cabin_title}
                      </Link>
                    </div>
                  </td>
                  {dates.map(date => {
                    const cssClass = getCssClass(cabin, date.dateStr)
                    const isWeekend = date.dayOfWeek === 0 || date.dayOfWeek === 6

                    return (
                      <td
                        key={date.day}
                        className={`${cssClass} ${isWeekend ? 'weekend' : ''} dotw${date.dayOfWeek} text-center p-0 border border-[#7c2c00] align-middle`}
                      >
                        <div className="w-[23px] h-[23px] leading-[23px] text-center text-[90%]">
                          {date.day}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

