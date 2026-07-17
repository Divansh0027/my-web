import React, { Suspense, useEffect, useState } from 'react'
const AnalyticsChart = React.lazy(() => import('@/features/admin/components/AnalyticsChart'))
import { useAdmin } from '@/features/admin'
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { dbInstance as db } from '@/firebase'

interface BehaviorEvent {
  id: string;
  eventName?: string;
  timestamp?: any;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
}

interface ChartData {
  [key: string]: string | number;
  name: string;
  views: number;
  properties: number;
}

export default function AnalyticsPanel() {
  const props = useAdmin()
  const { properties, threeBhkCount, villaCount, commercialCount, standardFlatsCount } = props

  const [behaviorData, setBehaviorData] = useState<BehaviorEvent[]>([])
  const [cohorts, setCohorts] = useState({ wau: 0, mau: 0 })
  const [funnel, setFunnel] = useState({
    searches: 0,
    views: 0,
    saves: 0,
    enquiries: 0,
    contacts: 0,
  })
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    const fetchBehavior = async () => {
      try {
        if (!db) return;
        const q = query(collection(db, 'user_behavior'), orderBy('timestamp', 'asc'))
        const snapshot = await getDocs(q)
        const events: BehaviorEvent[] = []
        snapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() })
        })
        setBehaviorData(events)

        // Compute Funnel & Cohorts
        const usersInLast7Days = new Set<string>()
        const usersInLast30Days = new Set<string>()
        const now = new Date()

        let searches = 0,
          views = 0,
          saves = 0,
          enquiries = 0,
          contacts = 0
        const dailyStats: Record<string, { views: number; properties: number }> = {}

        events.forEach((e) => {
          if (e.timestamp && typeof e.timestamp.toDate === 'function') {
            const d = e.timestamp.toDate()
            const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24)
            const uid = e.userId || e.sessionId || 'anonymous'
            if (diffDays <= 7) usersInLast7Days.add(uid)
            if (diffDays <= 30) usersInLast30Days.add(uid)
          }

          if (e.eventName === 'search') searches++
          if (e.eventName === 'property_view') views++
          if (e.eventName === 'save_property') saves++
          if (e.eventName === 'enquiry_submit') enquiries++
          if (e.eventName === 'whatsapp_click' || e.eventName === 'contact_click') contacts++

          // Build chart data
          if (e.timestamp && typeof e.timestamp.toDate === 'function') {
            const date = e.timestamp.toDate()
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            if (!dailyStats[dayName]) {
              dailyStats[dayName] = { views: 0, properties: 0 }
            }
            if (e.eventName === 'property_view') {
              dailyStats[dayName].views += 1
            } else {
              dailyStats[dayName].properties += 1 // proxy for other events
            }
          }
        })

        setFunnel({ searches, views, saves, enquiries, contacts })
        setCohorts({ wau: usersInLast7Days.size, mau: usersInLast30Days.size })

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const formattedChartData = days.map((day) => ({
          name: day,
          views: dailyStats[day]?.views || 0,
          properties: dailyStats[day]?.properties || 0,
        }))
        setChartData(formattedChartData)
      } catch (error: unknown) {
        console.error('Failed to fetch behavior', error)
      }
    }
    fetchBehavior()
  }, [])

  return (
    <>
      <div className="space-y-6 animate-fadeIn text-left">
        <div>
          <h1 className="text-xl font-extrabold text-on-surface tracking-tight">
            Advanced Product Analytics
          </h1>
          <p className="text-xs text-on-surface-variant">
            Real-time behavior tracking, funnels, and performance logs.
          </p>
        </div>

        {/* Double Columns charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Breakdown of items */}
          <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
            <h2 className="font-extrabold text-on-surface text-xs uppercase tracking-wider">
              Indexed Listing Types
            </h2>
            <div className="space-y-4 pt-3.5">
              {[
                { name: '3 BHK Builder Floors', count: threeBhkCount, color: 'bg-gold-accent' },
                { name: 'Luxury Heritage Villas', count: villaCount, color: 'bg-teal-500' },
                {
                  name: 'Commercial Office / Land Plots',
                  count: commercialCount,
                  color: 'bg-blue-500',
                },
                {
                  name: 'Standard 1 / 2 BHK Flats',
                  count: standardFlatsCount,
                  color: 'bg-purple-500',
                },
              ].map((stat) => {
                const pctValue = Math.round((stat.count / Math.max(1, properties.length)) * 100)
                return (
                  <div key={stat.name} className="space-y-1.5 font-sans">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-on-surface-variant">{stat.name}</span>
                      <span className="text-on-surface font-bold">
                        {stat.count} properties ({pctValue}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`${stat.color} h-1.5 rounded-full`}
                        style={{ width: `${Math.max(5, pctValue)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* User Journey Funnel */}
          <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
            <h2 className="font-extrabold text-on-surface text-xs uppercase tracking-wider">
              User Journey Funnel (Real-Time)
            </h2>
            <div className="space-y-3 pt-2">
              {[
                { title: 'Searches Performed', count: funnel.searches, color: 'bg-blue-500' },
                { title: 'Properties Viewed', count: funnel.views, color: 'bg-indigo-500' },
                { title: 'Properties Saved', count: funnel.saves, color: 'bg-purple-500' },
                { title: 'Enquiries Submitted', count: funnel.enquiries, color: 'bg-gold-accent' },
                { title: 'Contacts / WhatsApp', count: funnel.contacts, color: 'bg-success-green' },
              ].map((step, idx) => {
                const max = Math.max(funnel.searches, funnel.views, 1)
                const pct = Math.round((step.count / max) * 100)
                return (
                  <div key={step.title} className="flex items-center gap-4">
                    <div className="w-32 text-xs font-semibold text-on-surface-variant text-right shrink-0">
                      {step.title}
                    </div>
                    <div className="flex-1 bg-surface rounded-full h-4 overflow-hidden relative">
                      <div
                        className={`${step.color} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      ></div>
                      <span className="absolute left-2 top-0 text-[10px] font-bold text-[var(--on-gold)] leading-4">
                        {step.count} ({pct}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-3.5 bg-surface/40 rounded-xl border border-outline-variant/50 mt-4 text-[11px] leading-relaxed text-on-surface-variant flex items-center justify-between">
              <span>
                Total Events Tracked: <strong>{behaviorData.length}</strong>
              </span>
              <span className="text-gold-accent font-bold">
                WAU: {cohorts.wau} | MAU: {cohorts.mau}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Chart Area */}
        <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
          <h2 className="font-extrabold text-on-surface text-xs uppercase tracking-wider">
            Property Views & Listing Activity (Past 7 Days)
          </h2>
          <div className="h-[300px] w-full pt-4">
            <Suspense
              fallback={
                <div className="h-full w-full bg-surface-container animate-pulse rounded-xl" />
              }
            >
              <AnalyticsChart type="area" data={chartData.length > 0 ? chartData : undefined} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
