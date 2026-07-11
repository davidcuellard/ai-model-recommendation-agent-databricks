import { HeroSection } from '../components/landing/HeroSection'
import { ProblemSection } from '../components/landing/ProblemSection'
import { WhySection } from '../components/landing/WhySection'
import { HowItWorksSection } from '../components/landing/HowItWorksSection'
import { SystemDiagram } from '../components/landing/SystemDiagram'
import { FooterCTA } from '../components/landing/FooterCTA'

export function LandingPage() {
  return (
    <main className="bg-[#0a0f1e]">
      <HeroSection />
      <ProblemSection />
      <WhySection />
      <HowItWorksSection />
      <SystemDiagram />
      <FooterCTA />
    </main>
  )
}
