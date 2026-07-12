import React, { useState, useEffect } from 'react'
import { Calculator } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'

interface DetailEmiCalculatorProps {
  price: number
}

export function DetailEmiCalculator({ price }: DetailEmiCalculatorProps) {
  const [loanPrincipal, setLoanPrincipal] = useState(Math.round(price * 0.8))
  const [interestRate, setInterestRate] = useState(8.5)
  const [loanTenure, setLoanTenure] = useState(20)
  const [monthlyEmi, setMonthlyEmi] = useState(0)
  const [showAmortization, setShowAmortization] = useState(false)

  useEffect(() => {
    setLoanPrincipal(Math.round(price * 0.8))
  }, [price])

  useEffect(() => {
    const P = loanPrincipal
    const r = interestRate / 12 / 100 // Monthly rate
    const n = loanTenure * 12 // Total monthly installments

    if (r === 0) {
      setMonthlyEmi(Math.round(P / n))
      return
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    setMonthlyEmi(Math.round(emi))
  }, [loanPrincipal, interestRate, loanTenure])

  const totalInterest = monthlyEmi * loanTenure * 12 - loanPrincipal
  const totalPayment = loanPrincipal + totalInterest

  const chartData = [
    { name: 'Principal Loan Amount', value: loanPrincipal },
    { name: 'Total Interest', value: totalInterest },
  ]
  const COLORS = ['#7c6214', '#475569']

  // Amortization Schedule Logic (Yearly for simplicity)
  const calculateAmortization = () => {
    let balance = loanPrincipal
    const r = interestRate / 12 / 100
    const schedule = []

    for (let year = 1; year <= loanTenure; year++) {
      let interestForYear = 0
      let principalForYear = 0

      for (let month = 1; month <= 12; month++) {
        const interest = balance * r
        const principal = monthlyEmi - interest
        interestForYear += interest
        principalForYear += principal
        balance -= principal
      }

      schedule.push({
        year,
        principal: Math.round(principalForYear),
        interest: Math.round(interestForYear),
        balance: Math.max(0, Math.round(balance)),
      })
    }
    return schedule
  }

  const schedule = calculateAmortization()

  return (
    <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-6">
      <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-3.5">
        <Calculator className="h-5 w-5 text-gold-accent" />
        <h3 className="text-on-surface font-extrabold text-lg">Dynamic Home Loan EMI Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-7 space-y-6">
          {/* Loan Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label
                htmlFor="auto-detailview-415"
                className="font-bold text-on-surface-variant uppercase tracking-wide"
              >
                Loan Amount (INR)
              </label>
              <span className="text-on-surface font-extrabold text-xs">
                ₹{(loanPrincipal / 100000).toFixed(1)} Lakhs
              </span>
            </div>
            <input
              id="auto-detailview-415"
              type="range"
              min={price * 0.2}
              max={price * 0.9}
              step={100000}
              value={loanPrincipal}
              onChange={(e) => setLoanPrincipal(Number(e.target.value))}
              className="w-full accent-gold-accent bg-outline-variant/30 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
              <span>₹{(price * 0.2) / 100000}L</span>
              <span>₹{(price * 0.9) / 100000}L</span>
            </div>
          </div>

          {/* Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label
                htmlFor="auto-detailview-416"
                className="font-bold text-on-surface-variant uppercase tracking-wide"
              >
                Interest Rate (P.A)
              </label>
              <span className="text-on-surface font-extrabold text-xs">{interestRate}%</span>
            </div>
            <input
              id="auto-detailview-416"
              type="range"
              min="5"
              max="15"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-gold-accent bg-outline-variant/30 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Tenure Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label
                htmlFor="auto-detailview-417"
                className="font-bold text-on-surface-variant uppercase tracking-wide"
              >
                Loan Tenure
              </label>
              <span className="text-on-surface font-extrabold text-xs">{loanTenure} Yrs</span>
            </div>
            <input
              id="auto-detailview-417"
              type="range"
              min="5"
              max="30"
              step="1"
              value={loanTenure}
              onChange={(e) => setLoanTenure(Number(e.target.value))}
              className="w-full accent-gold-accent bg-outline-variant/30 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Results Visualizer */}
        <div className="md:col-span-5 bg-surface-container border border-outline-variant/50 p-6 rounded-xl text-center flex flex-col items-center h-full">
          <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-2">
            Estimated Monthly EMI
          </div>
          <div className="text-4xl font-black text-gold-accent tracking-tight">
            ₹{monthlyEmi.toLocaleString('en-IN')}
          </div>
          <div className="w-full h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                  itemStyle={{ color: '#d4af37' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between w-full text-xs mt-4 px-2">
            <div className="text-left">
              <div className="text-on-surface-variant font-medium">Principal</div>
              <div className="text-on-surface font-semibold">
                ₹{loanPrincipal.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-on-surface-variant font-medium">Interest</div>
              <div className="text-on-surface font-semibold">
                ₹{totalInterest.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Toggle */}
      <div className="pt-4 border-t border-outline-variant/50 text-center">
        <button
          onClick={() => setShowAmortization(!showAmortization)}
          className="text-gold-accent hover:text-gold-hover text-sm font-semibold transition-colors"
        >
          {showAmortization ? 'Hide Amortization Schedule' : 'View Amortization Schedule'}
        </button>
      </div>

      {/* Amortization Table */}
      {showAmortization && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-outline-variant/50">
          <table className="w-full text-sm text-left text-on-surface-variant">
            <thead className="text-xs uppercase bg-surface-container-low text-on-surface">
              <tr>
                <th className="px-6 py-3">Year</th>
                <th className="px-6 py-3">Principal (A)</th>
                <th className="px-6 py-3">Interest (B)</th>
                <th className="px-6 py-3">Total Payment (A+B)</th>
                <th className="px-6 py-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.year} className="border-b border-outline-variant/50 bg-surface">
                  <td className="px-6 py-4 font-medium text-on-surface">{row.year}</td>
                  <td className="px-6 py-4">₹{row.principal.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">₹{row.interest.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    ₹{(row.principal + row.interest).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-semibold text-on-surface">
                    ₹{row.balance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
