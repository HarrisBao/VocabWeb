import React from 'react'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import { HeroSection } from '../../components/landing/HeroSection'
import { StatsSection } from '../../components/landing/StatsSection'
import { FeaturesSection } from '../../components/landing/FeaturesSection'
import { CoursesSection } from '../../components/landing/CoursesSection'
import { TestimonialsSection } from '../../components/landing/TestimonialsSection'
import { CTASection } from '../../components/landing/CTASection'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <CoursesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
