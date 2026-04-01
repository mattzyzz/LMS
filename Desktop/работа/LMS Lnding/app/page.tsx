import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Stats } from '@/components/Stats'
import { Clients } from '@/components/Clients'
import { Features } from '@/components/Features'
import { Testimonials } from '@/components/Testimonials'
import { AISection } from '@/components/AISection'
import { ROICalculator } from '@/components/ROICalculator'
import { FAQ } from '@/components/FAQ'
import { ContactForm } from '@/components/ContactForm'
import { Footer } from '@/components/Footer'

export default function Page() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Перейти к содержанию
      </a>
      <Nav />
      <main id="main-content">
        <Hero />
        <Stats />
        <Clients />
        <Features />
        <Testimonials />
        <AISection />
        <ROICalculator />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
