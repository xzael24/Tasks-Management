"use client"
import { ParticleBackground } from "./particle-background"
import { HeroSection } from "./hero-section"
import { FeaturesSection } from "./features-section"
import { TestimonialsSection } from "./testimonials-section"
import { CTASection } from "./cta-section"
import { Header } from "./header"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <ParticleBackground />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </div>
  )
}
