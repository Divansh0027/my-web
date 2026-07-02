import React, { Suspense } from "react";
const AnalyticsChart = React.lazy(() => import("./AnalyticsChart"));

import { useAdmin } from "../../context/AdminContext";

export default function AnalyticsPanel() {
  const props = useAdmin();
  const { 
    properties, 
    newEnquiriesCount, threeBhkCount, villaCount, commercialCount, standardFlatsCount, contactedEnquiriesCount, resolvedEnquiriesCount
  } = props;

  return (
<>
    <div className="space-y-6 animate-fadeIn text-left">
                  
                  <div>
                    <h1 className="text-xl font-extrabold text-on-surface tracking-tight">Aesthetic Real Estate Analytics</h1>
                    <p className="text-xs text-on-surface-variant">Performance logs, listing breakdowns, and estimations calculated live.</p>
                  </div>

                  {/* Double Columns charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Visual Breakdown of items */}
                    <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
                      <h3 className="font-extrabold text-on-surface text-xs uppercase tracking-wider">Indexed Listing Types</h3>
                      
                      <div className="space-y-4 pt-3.5">
                        {[
                          { name: "3 BHK Builder Floors", count: threeBhkCount, color: "bg-gold-accent" },
                          { name: "Luxury Heritage Villas", count: villaCount, color: "bg-teal-500" },
                          { name: "Commercial Office / Land Plots", count: commercialCount, color: "bg-blue-500" },
                          { name: "Standard 1 / 2 BHK Flats", count: standardFlatsCount, color: "bg-purple-500" }
                        ].map(stat => {
                          const pctValue = Math.round((stat.count / Math.max(1, properties.length)) * 100);
                          return (
                          <div key={stat.name} className="space-y-1.5 font-sans">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-on-surface-variant">{stat.name}</span>
                              <span className="text-on-surface font-bold">{stat.count} properties ({pctValue}%)</span>
                            </div>
                            <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                              <div className={`${stat.color} h-1.5 rounded-full`} style={{ width: `${Math.max(5, pctValue)}%` }}></div>
                            </div>
                          </div>
                        )})}
                      </div>
                    </div>

                    {/* Enquiry callback metrics */}
                    <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
                      <h3 className="font-extrabold text-on-surface text-xs uppercase tracking-wider">Callback Conversation Funnel</h3>
                      
                      <div className="grid grid-cols-3 gap-3 pt-4">
                        {[
                          { title: "New Callback", count: newEnquiriesCount, pct: "30%", color: "border-red-500/20 text-red-400 bg-red-500/5" },
                          { title: "Contacted Agent", count: contactedEnquiriesCount, pct: "50%", color: "border-amber-500/20 text-amber-400 bg-amber-500/5" },
                          { title: "Successful Deal", count: resolvedEnquiriesCount, pct: "20%", color: "border-emerald-500/20 text-success-green bg-gold-accent/5" }
                        ].map(f => (
                          <div key={f.title} className={`p-4 border rounded-xl text-center flex flex-col justify-center ${f.color}`}>
                            <span className="text-[17.5px] font-black">{f.count}</span>
                            <span className="text-[10px] mt-1 font-bold select-none leading-tight">{f.title}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 bg-surface/40 rounded-xl border border-outline-variant/50 mt-4 text-[11px] leading-relaxed text-on-surface-variant">
                        Top performance advisory analytics estimate a conversion velocity of <span className="text-gold-accent font-bold">4.2 Callback visits/week</span> under current verified RERA parameters.
                      </div>
                    </div>

                  </div>

                  {/* Activity Chart Area */}
                  <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 shadow-md space-y-4">
                    <h3 className="font-extrabold text-on-surface text-xs uppercase tracking-wider">Property Views & Listing Activity (Past 7 Days)</h3>
                    <div className="h-[300px] w-full pt-4">
                      <Suspense fallback={<div className="h-full w-full bg-surface-container animate-pulse rounded-xl" />}><AnalyticsChart type="area" /></Suspense>
                    </div>
                  </div>

                </div>
              
</>
  );
}