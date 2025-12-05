import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { DemoSection } from '@/components/DemoSection';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { Pricing } from '@/components/Pricing';
import { Accessibility } from '@/components/Accessibility';
import { FAQ } from '@/components/FAQ';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';
import { TextToSpeech } from '@/components/TextToSpeech';
import { AccessibilityAnnouncer } from '@/components/AccessibilityAnnouncer';

export default function LandingPage() {
  return (
    <>
      <AccessibilityAnnouncer />
      <Navbar />
      <main id="main-content">
        <Hero />
        <DemoSection />
        <Features />
        <HowItWorks />
        <Pricing />
        <Accessibility />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <TextToSpeech />
    </>
  );
}
