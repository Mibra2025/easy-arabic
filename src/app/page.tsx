import { Hero } from '@/components/sections/hero'
import { Features } from '@/components/sections/features'
import { Teachers } from '@/components/sections/teachers'
import { Pricing } from '@/components/sections/pricing'
import { Contact } from '@/components/sections/contact'
import { Navigation } from '@/components/sections/navigation'
import { Footer } from '@/components/sections/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <Teachers />
      <Pricing />
      <Contact />
      <Footer />
    </main>
  )
}
