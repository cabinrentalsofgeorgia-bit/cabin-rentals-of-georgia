'use client'

import { useEffect, useState, useRef } from 'react'
import { getCabinCalendar, CabinCalendar, CalendarMonth } from '@/lib/api/calendar'

interface AvailabilityCalendarProps {
  cabinId: string
  months?: number
  showRates?: boolean
  className?: string
  visibleMonths?: number // How many months to show at once (default 1)
  selectable?: boolean
  selectedArrive?: string
  selectedDepart?: string
  onDateSelect?: (arrive: string, depart: string) => void
}

/**
 * Availability Calendar Component
 * Displays availability calendar with optional daily rates
 */
export default function AvailabilityCalendar({
  cabinId,
  months = 3,
  showRates = true,
  className = '',
  visibleMonths = 1,
  selectable = false,
  selectedArrive = '',
  selectedDepart = '',
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [calendar, setCalendar] = useState<CabinCalendar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchCalendar() {
      try {
        setLoading(true)
        setError(null)
        const data = await getCabinCalendar(cabinId, months, undefined, showRates)
        setCalendar(data)
        setCurrentMonthIndex(0) // Start with first month
      } catch (err: any) {
        setError(err.message || 'Failed to load calendar')
        console.error('Error fetching calendar:', err)
      } finally {
        setLoading(false)
      }
    }

    if (cabinId) {
      fetchCalendar()
    }
  }, [cabinId, months, showRates])

  const handlePreviousMonth = () => {
    setCurrentMonthIndex(prev => Math.max(0, prev - visibleMonths))
  }

  const handleNextMonth = () => {
    if (calendar) {
      const maxIndex = Math.max(0, calendar.months.length - visibleMonths)
      setCurrentMonthIndex(prev => Math.min(maxIndex, prev + visibleMonths))
    }
  }

  const handleDateSelection = (dateStr: string) => {
    if (!onDateSelect) return

    if (!selectedArrive || (selectedArrive && selectedDepart)) {
      onDateSelect(dateStr, '')
      return
    }

    if (dateStr <= selectedArrive) {
      onDateSelect(dateStr, '')
      return
    }

    onDateSelect(selectedArrive, dateStr)
  }

  if (loading) {
    return (
      <div className={`availability-calendar ${className}`}>
        <div className="text-center py-8">
          <p className="text-[#533e27]">Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    // Don't show error for 404 - just hide the calendar section
    if (error.includes('404') || error.includes('not found')) {
      return null
    }
    return (
      <div className={`availability-calendar ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading calendar: {error}</p>
        </div>
      </div>
    )
  }

  if (!calendar || !calendar.months.length) {
    return null
  }

  return (
    <div className={`availability-calendar ${className}`}>
      {/* Calendar Key/Legend */}
      <div className="cal-key mb-4 flex flex-wrap gap-4 justify-start">
        {/* Show legend in specific order matching the design */}
        <div className="flex items-center gap-2">
          <span className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_available3.png')] bg-no-repeat bg-[left_center] bg-contain">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_in3.png')] bg-no-repeat bg-[left_center] bg-contain">Check In</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_out3.png')] bg-no-repeat bg-[left_center] bg-contain">Check Out</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_inout3.png')] bg-no-repeat bg-[left_center] bg-contain">Turn-Around Date</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#533e27] text-sm pl-[25px] bg-[url('/images/calendar_images/cal_booked3.png')] bg-no-repeat bg-[left_center] bg-contain">Reserved</span>
        </div>
      </div>

      {/* Calendar Viewport with Slider */}
      <div
        ref={viewportRef}
        className={`cal-viewport w-full mx-auto relative ${visibleMonths === 1 ? 'max-w-[600px] max-[1010px]:max-w-[440px]' : ''}`}
        style={{ overflow: 'hidden', position: 'relative' }}
      >
        {/* Calendar Month Container - Image Slider Style */}
        <div
          className="cal-viewport-inner flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${(currentMonthIndex / calendar.months.length) * 100}%)`,
            width: `${(calendar.months.length / visibleMonths) * 100}%`,
          }}
        >
          {calendar.months.map((month, index) => (
            <div
              key={`${month.year}-${month.month}`}
              className="cal-month flex-shrink-0 px-1"
              style={{
                width: `${100 / calendar.months.length}%`,
                flexShrink: 0,
              }}
            >
              <CalendarMonthComponent
                month={month}
                allMonths={calendar.months}
                showRates={showRates}
                compact={visibleMonths > 1}
                selectable={selectable}
                selectedArrive={selectedArrive}
                selectedDepart={selectedDepart}
                onSelectDate={handleDateSelection}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className={`cal-buttons flex justify-between mt-4 w-full mx-auto mb-[5px] ${visibleMonths === 1 ? 'max-w-[600px]' : ''}`}>
          <button
            type="button"
            onClick={handlePreviousMonth}
            disabled={currentMonthIndex === 0}
            className="cal-backward bg-[url('/images/bg_search_repeat.png')] bg-repeat-x border-none rounded-[15px] text-white text-xl px-4 italic font-['Fanwood_Text',serif] shadow-[0px_1px_3px_#999] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{
              textShadow: '0px 0px 3px #999',
            }}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={currentMonthIndex >= calendar.months.length - visibleMonths}
            className="cal-forward bg-[url('/images/bg_search_repeat.png')] bg-repeat-x border-none rounded-[15px] text-white text-xl px-4 italic font-['Fanwood_Text',serif] shadow-[0px_1px_3px_#999] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{
              textShadow: '0px 0px 3px #999',
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual Calendar Month Component
 */
function CalendarMonthComponent({
  month,
  allMonths,
  showRates,
  compact = false,
  selectable = false,
  selectedArrive = '',
  selectedDepart = '',
  onSelectDate,
}: {
  month: CalendarMonth
  allMonths: CalendarMonth[]
  showRates: boolean
  compact?: boolean
  selectable?: boolean
  selectedArrive?: string
  selectedDepart?: string
  onSelectDate?: (dateStr: string) => void
}) {
  const monthName = new Date(month.year, month.month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstDay = new Date(month.year, month.month - 1, 1)
  const lastDay = new Date(month.year, month.month, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Calculate previous month's last days
  const prevMonth = month.month === 1 ? 12 : month.month - 1
  const prevYear = month.month === 1 ? month.year - 1 : month.year
  const prevMonthLastDay = new Date(prevYear, prevMonth, 0)
  const prevMonthDays = prevMonthLastDay.getDate()

  // Calculate next month info
  const nextMonth = month.month === 12 ? 1 : month.month + 1
  const nextYear = month.month === 12 ? month.year + 1 : month.year

  // Create array of days
  const days: Array<{ date: number; dateStr: string; availability?: any; rate?: any; isAdjacentMonth?: boolean }> = []

  // Helper function to find rate from any month
  const findRateForDate = (dateStr: string): any => {
    // First check current month
    if (month.rates[dateStr]) {
      return month.rates[dateStr]
    }
    // Then check all other months
    for (const m of allMonths) {
      if (m.rates[dateStr]) {
        return m.rates[dateStr]
      }
    }
    return null
  }

  // Helper function to find availability from any month
  const findAvailabilityForDate = (dateStr: string): any => {
    // First check current month
    if (month.availability[dateStr]) {
      return month.availability[dateStr]
    }
    // Then check all other months
    for (const m of allMonths) {
      if (m.availability[dateStr]) {
        return m.availability[dateStr]
      }
    }
    return null
  }

  // Add previous month's days for empty cells at the start
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = prevMonthDays - i
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevDate).padStart(2, '0')}`
    days.push({
      date: prevDate,
      dateStr,
      availability: findAvailabilityForDate(dateStr),
      rate: findRateForDate(dateStr),
      isAdjacentMonth: true,
    })
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${month.year}-${String(month.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({
      date: day,
      dateStr,
      availability: month.availability[dateStr],
      rate: month.rates[dateStr],
      isAdjacentMonth: false,
    })
  }

  // Ensure we always have 6 rows (42 cells) for consistent height across all months
  // Fill remaining cells with next month's days
  let nextMonthDay = 1
  while (days.length < 42) {
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`
    days.push({
      date: nextMonthDay,
      dateStr,
      availability: findAvailabilityForDate(dateStr),
      rate: findRateForDate(dateStr),
      isAdjacentMonth: true,
    })
    nextMonthDay++
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // For compact mode, use CSS Grid with gaps
  if (compact) {
    return (
      <div className="calendar-month h-full">
        <h4 className="text-black mb-2 text-center text-sm">{monthName}</h4>
        <div className="overflow-hidden border border-black">
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-[2px] mb-[2px]">
            {dayNames.map(day => (
              <div
                key={day}
                className="text-center text-[#533e27] font-semibold text-[10px] py-1"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-[2px]">
            {days.map((day, index) => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const dayDate = new Date(day.dateStr)
              dayDate.setHours(0, 0, 0, 0)
              const isToday = day.dateStr === today.toISOString().split('T')[0]
              const isPast = dayDate < today
              const availability = day.availability
              const isAdjacentMonth = day.isAdjacentMonth || false

              const cssClass = availability?.state?.css_class || 'cal-available'
              let bgImage = '/images/calendar_images/cal_available_85px2.png'

              switch (cssClass) {
                case 'cal-available':
                case 'cal-av':
                  bgImage = '/images/calendar_images/cal_available_85px2.png'
                  break
                case 'cal-in':
                  bgImage = '/images/calendar_images/cal_in_85px2.png'
                  break
                case 'cal-out':
                  bgImage = '/images/calendar_images/cal_out_85px2.png'
                  break
                case 'cal-inout':
                  bgImage = '/images/calendar_images/cal_inout_85px.png'
                  break
                case 'cal-booked':
                case 'cal-opt':
                  bgImage = '/images/calendar_images/cal_booked_85px.png'
                  break
                case 'cal-na':
                case 'cal-nc':
                  bgImage = '/images/calendar_images/cal_booked_85px.png'
                  break
                default:
                  bgImage = '/images/calendar_images/cal_available_85px2.png'
              }

              let cellOpacity = 1
              if (isAdjacentMonth) {
                cellOpacity = 0.4
              } else if (isPast && !isAdjacentMonth) {
                cellOpacity = 0.6
              }

              const isBlocked = ['cal-booked', 'cal-opt', 'cal-na', 'cal-nc'].includes(cssClass) || availability?.state?.is_available === false
              const isClickable = selectable && !isAdjacentMonth && !isPast && !isBlocked
              const isArrival = selectedArrive === day.dateStr
              const isDeparture = selectedDepart === day.dateStr
              const isInRange = !!selectedArrive && !!selectedDepart && day.dateStr > selectedArrive && day.dateStr < selectedDepart

              return (
                <div
                  key={index}
                  onClick={isClickable ? () => onSelectDate?.(day.dateStr) : undefined}
                  className={`aspect-square flex items-center justify-center bg-cover bg-center bg-no-repeat ${isToday ? 'ring-2 ring-yellow-400' : ''} ${isClickable ? 'cursor-pointer hover:brightness-110' : isBlocked ? 'cursor-not-allowed' : ''}`}
                  style={{
                    backgroundImage: isAdjacentMonth ? 'none' : `url(${bgImage})`,
                    opacity: cellOpacity,
                    boxShadow: isArrival || isDeparture ? 'inset 0 0 0 2px #7c2c00' : undefined,
                    backgroundColor: isInRange ? 'rgba(124, 44, 0, 0.18)' : undefined,
                    backgroundBlendMode: isInRange ? 'multiply' : undefined,
                  }}
                >
                  <span className="text-black font-bold text-[11px] font-[Arial,Helvetica,sans-serif]">
                    {day.date}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Original table layout for non-compact mode
  return (
    <div className="calendar-month">
      <h4 className="text-black mb-2 text-center mt-[5px] text-xl">{monthName}</h4>
      <div className="overflow-hidden border border-[1px] border-black">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr>
              {dayNames.map(day => (
                <th
                  key={day}
                  className="text-center text-[#533e27] font-semibold bg-transparent p-2 text-sm"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
              <tr key={weekIndex}>
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = days[weekIndex * 7 + dayIndex]
                  if (!day) {
                    return (
                      <td
                        key={dayIndex}
                        className="border-none p-0 bg-gray-100 aspect-square"
                      />
                    )
                  }

                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const dayDate = new Date(day.dateStr)
                  dayDate.setHours(0, 0, 0, 0)
                  const isToday = day.dateStr === today.toISOString().split('T')[0]
                  const isPast = dayDate < today
                  const availability = day.availability
                  const rate = day.rate
                  const isAdjacentMonth = day.isAdjacentMonth || false

                  const cssClass = availability?.state?.css_class || 'cal-available'
                  let bgImage = '/images/calendar_images/cal_available_85px.png'

                  switch (cssClass) {
                    case 'cal-available':
                    case 'cal-av':
                      bgImage = '/images/calendar_images/cal_available_85px2.png'
                      break
                    case 'cal-in':
                      bgImage = '/images/calendar_images/cal_in_85px2.png'
                      break
                    case 'cal-out':
                      bgImage = '/images/calendar_images/cal_out_85px2.png'
                      break
                    case 'cal-inout':
                      bgImage = '/images/calendar_images/cal_inout_85px.png'
                      break
                    case 'cal-booked':
                    case 'cal-opt':
                      bgImage = '/images/calendar_images/cal_booked_85px.png'
                      break
                    case 'cal-na':
                    case 'cal-nc':
                      bgImage = '/images/calendar_images/cal_booked_85px.png'
                      break
                    default:
                      bgImage = '/images/calendar_images/cal_available_85px2.png'
                  }

                  let cellOpacity = 1
                  if (isAdjacentMonth) {
                    cellOpacity = 0.5
                  } else if (isPast && !isAdjacentMonth) {
                    cellOpacity = 0.6
                  }

                  const isBlocked = ['cal-booked', 'cal-opt', 'cal-na', 'cal-nc'].includes(cssClass) || availability?.state?.is_available === false
                  const isClickable = selectable && !isAdjacentMonth && !isPast && !isBlocked
                  const isArrival = selectedArrive === day.dateStr
                  const isDeparture = selectedDepart === day.dateStr
                  const isInRange = !!selectedArrive && !!selectedDepart && day.dateStr > selectedArrive && day.dateStr < selectedDepart

                  return (
                    <td
                      key={dayIndex}
                      onClick={isClickable ? () => onSelectDate?.(day.dateStr) : undefined}
                      className={`border-none ${isToday ? 'ring-2 ring-yellow-400' : ''} text-center relative bg-cover bg-center bg-no-repeat aspect-square p-2 max-[1010px]:p-1 ${isClickable ? 'cursor-pointer hover:brightness-110' : isBlocked ? 'cursor-not-allowed' : ''}`}
                      style={{
                        backgroundImage: isAdjacentMonth ? 'none' : `url(${bgImage})`,
                        backgroundColor: isInRange ? 'rgba(124, 44, 0, 0.18)' : 'transparent',
                        opacity: cellOpacity,
                        boxShadow: isArrival || isDeparture ? 'inset 0 0 0 2px #7c2c00' : undefined,
                        backgroundBlendMode: isInRange ? 'multiply' : undefined,
                      }}
                    >
                      <div className="h-full flex flex-col justify-between">
                        <p className="text-black !font-bold font-[Arial,Helvetica,sans-serif] !m-0 text-[14px] text-right">
                          {day.date}
                        </p>
                        {showRates && rate && (
                          <div className="text-black mt-auto text-center font-[Arial,Helvetica,sans-serif] mb-[10px] max-[1010px]:mb-[2px]">
                            ${Math.round(rate.daily_rate)}
                          </div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

