'use client'

import { useEffect, useState } from 'react'

interface TaxReportRow {
  property_name: string
  confirmation_code: string
  check_in: string
  check_out: string
  nights: number
  total_amount: number
  state_sales_tax: number
  county_sales_tax: number
  lodging_tax: number
  dot_fee: number
  total_tax: number
  county: string
}

interface TaxReportSummary {
  month: number
  year: number
  total_reservations: number
  total_revenue: number
  total_state_sales_tax: number
  total_county_sales_tax: number
  total_lodging_tax: number
  total_dot_fees: number
  total_all_taxes: number
  rows: TaxReportRow[]
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function TaxReportsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [report, setReport] = useState<TaxReportSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/proxy/api/v1/tax-reports/monthly?month=${month}&year=${year}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        if (!cancelled) setReport(data)
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load report')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [month, year])

  const downloadCsv = () => {
    window.open(`/api/proxy/api/v1/tax-reports/monthly/csv?month=${month}&year=${year}`, '_blank')
  }

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tax Vault</h1>
          <p className="text-sm text-slate-500 mt-1">Monthly tax filing report for all jurisdictions</p>
        </div>
        <button
          onClick={downloadCsv}
          disabled={!report || report.total_reservations === 0}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download CSV for Filing
        </button>
      </div>

      {/* Month/Year Picker */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-slate-600">Period:</label>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading tax data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              label="GA State Sales Tax"
              sublabel="Pay to: GA Department of Revenue"
              value={fmt(report.total_state_sales_tax)}
              color="blue"
            />
            <SummaryCard
              label="County Sales Tax"
              sublabel="Pay to: County Tax Commissioner"
              value={fmt(report.total_county_sales_tax)}
              color="amber"
            />
            <SummaryCard
              label="Lodging Tax"
              sublabel="Pay to: County Tax Commissioner"
              value={fmt(report.total_lodging_tax)}
              color="purple"
            />
            <SummaryCard
              label="GA DOT Fee"
              sublabel="Pay to: GA Department of Revenue"
              value={fmt(report.total_dot_fees)}
              color="emerald"
            />
          </div>

          {/* Total Banner */}
          <div className="bg-slate-800 text-white rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Total Taxes &amp; Fees — {MONTHS[month - 1]} {year}</p>
              <p className="text-3xl font-bold mt-1">{fmt(report.total_all_taxes)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">{report.total_reservations} reservations</p>
              <p className="text-sm text-slate-400">Revenue: {fmt(report.total_revenue)}</p>
            </div>
          </div>

          {/* Detail Table */}
          {report.rows.length > 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Property</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Confirmation</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Dates</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Revenue</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">State Sales</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">County Sales</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Lodging</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">DOT</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600 bg-slate-100">Total Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-medium text-slate-800">{row.property_name}</td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{row.confirmation_code}</td>
                        <td className="px-4 py-2.5 text-slate-600 text-xs">
                          {row.check_in} → {row.check_out} ({row.nights}n)
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-700">{fmt(row.total_amount)}</td>
                        <td className="px-4 py-2.5 text-right text-blue-700">{fmt(row.state_sales_tax)}</td>
                        <td className="px-4 py-2.5 text-right text-amber-700">{fmt(row.county_sales_tax)}</td>
                        <td className="px-4 py-2.5 text-right text-purple-700">{fmt(row.lodging_tax)}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-700">{fmt(row.dot_fee)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-800 bg-slate-50">{fmt(row.total_tax)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 border-t-2 border-slate-300 font-semibold">
                      <td colSpan={3} className="px-4 py-3 text-slate-700">TOTALS</td>
                      <td className="px-4 py-3 text-right text-slate-800">{fmt(report.total_revenue)}</td>
                      <td className="px-4 py-3 text-right text-blue-800">{fmt(report.total_state_sales_tax)}</td>
                      <td className="px-4 py-3 text-right text-amber-800">{fmt(report.total_county_sales_tax)}</td>
                      <td className="px-4 py-3 text-right text-purple-800">{fmt(report.total_lodging_tax)}</td>
                      <td className="px-4 py-3 text-right text-emerald-800">{fmt(report.total_dot_fees)}</td>
                      <td className="px-4 py-3 text-right text-slate-900 bg-slate-200">{fmt(report.total_all_taxes)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500">No completed reservations found for {MONTHS[month - 1]} {year}.</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

function SummaryCard({ label, sublabel, value, color }: {
  label: string
  sublabel: string
  value: string
  color: 'blue' | 'amber' | 'purple' | 'emerald'
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs mt-2 opacity-50">{sublabel}</p>
    </div>
  )
}
