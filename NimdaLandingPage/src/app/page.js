'use client';
import Navbar from '../components/Landing/Navbar';
import HeroSection from '../components/Landing/HeroSection';
import ActivityCards from '../components/Landing/ActivityCards';
import TimelineSection from '../components/Landing/TimelineSection';
import { AwardsSection, Footer } from '../components/Landing/FooterContent';
import FloatingCTA from '../components/Landing/FloatingCTA';

export default function Page() {
  return (
    <main className="bg-[#050505] min-h-screen text-white selection:bg-indigo-500 selection:text-white font-sans relative pt-0">
      <Navbar />
      
      {/* Hero with ID for scroll */}
      <div id="home" className="min-h-screen flex items-center justify-center">
        <HeroSection />
      </div>

      <div id="activities" className="py-32 md:py-48">
        <ActivityCards />
      </div>

      <div id="projects" className="py-32 md:py-48">
        <TimelineSection />
      </div>

      <div id="awards" className="py-32 md:py-48">
        <AwardsSection />
      </div>

      <div id="contact">
        <Footer />
      </div>

      <FloatingCTA />
      
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #222 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
    </main>
  );
}