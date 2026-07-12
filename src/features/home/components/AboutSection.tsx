import React from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import {
  Users,
  Compass,
  CheckCircle,
  Briefcase,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export function AboutSection() {
  return (
    <>
      <section id="about_sec" className="py-32 px-4 bg-surface-container-low scroll-mt-[72px]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Description Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-gold-accent font-semibold text-xs uppercase tracking-widest">
                Guaranteed Trust
              </span>
              <h2 className="text-3xl sm:text-4.5xl font-bold tracking-tight text-on-surface leading-tight">
                Why Choose Shiv Saya Properties?
              </h2>
              <p className="text-on-surface-variant text-sm leading-loose">
                Investing in real estate in Delhi NCR is highly competitive and legally complex. We
                eliminate search clutter and title risks, providing end-to-end guidance under RERA
                guidelines.
              </p>

              <div className="p-5 rounded-[24px] bg-gold-accent/5 border border-gold-accent/20 flex items-start gap-4">
                <Users className="h-8 w-8 text-gold-accent shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Direct Owner Listings</h4>
                  <p className="text-on-surface-variant text-xs mt-1">
                    We cut downstream brokerage loops through pre-vetted direct family owner
                    arrangements.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Cards Column */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: 'Local Market Experts',
                  desc: 'Comprehensive database covering property values, projected metro expansions, and RERA approvals.',
                  icon: <Compass className="h-5 w-5" />,
                },
                {
                  title: 'Verified Listings Only',
                  desc: 'Zero ghost listings. We complete registry, ownership, and structural verifications beforehand.',
                  icon: <CheckCircle className="h-5 w-5" />,
                },
                {
                  title: 'End-to-End Support',
                  desc: 'Documentation, loans from SBI, HDFC & ICICI, structural renovations, and rental agreement setup.',
                  icon: <Briefcase className="h-5 w-5" />,
                },
                {
                  title: 'RERA Registered Firm',
                  desc: 'Operated strictly within Indian Real Estate Regulatory Authority standards. Fully ethical advisory.',
                  icon: <Award className="h-5 w-5" />,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="p-6.5 bg-surface-container border border-outline-variant/50 rounded-[24px]"
                >
                  <div className="h-10 w-10 bg-slate-850 rounded-lg flex items-center justify-center text-gold-accent mb-5">
                    {card.icon}
                  </div>
                  <h3 className="text-on-surface text-md font-semibold tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-on-surface-variant text-xs mt-2.5 leading-loose">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
