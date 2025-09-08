'use client'

import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import DemoSection from '@/components/landing/DemoSection'
import CTASection from '@/components/landing/CTASection'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function HomePage() {
  const { isSignedIn } = useAuth()

  // Redirect authenticated users to dashboard
  if (isSignedIn) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
