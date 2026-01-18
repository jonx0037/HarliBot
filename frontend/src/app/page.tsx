'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Droplets,
  Zap,
  Construction,
  Trees,
  ShieldCheck,
  Flame,
  FileCheck,
  Calendar,
  Building2,
  Wrench
} from 'lucide-react'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-harlingen-navy focus:text-white focus:p-4 focus:m-2 focus:rounded"
      >
        Skip to main content
      </a>
      {/* Header with Harlingen branding */}
      <header className="sticky top-0 z-40 shadow-lg glass-dark backdrop-blur-md" style={{ backgroundColor: 'rgba(26, 43, 78, 0.95)' }}>
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 transition-smooth group-hover:scale-105">
                <Image
                  src="/harlingen-logo.png"
                  alt="City of Harlingen"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-white">
                <h1 className="text-base sm:text-xl font-bold text-shadow-md">City of Harlingen</h1>
                <p className="text-xs sm:text-sm text-gray-200">Texas</p>
              </div>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
              <NavLink href="#government">Government</NavLink>
              <NavLink href="#departments">Departments</NavLink>
              <NavLink href="#community">Community</NavLink>
              <NavLink href="#services">Services</NavLink>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-smooth text-sm font-medium backdrop-blur-sm border border-white/20 hover:scale-105">
                AI Chatbot
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-smooth"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div id="mobile-menu" className="md:hidden pb-4 px-2 animate-fade-in">
              <nav className="flex flex-col space-y-2" aria-label="Mobile navigation">
                <MobileNavLink href="#government" onClick={() => setMobileMenuOpen(false)}>Government</MobileNavLink>
                <MobileNavLink href="#departments" onClick={() => setMobileMenuOpen(false)}>Departments</MobileNavLink>
                <MobileNavLink href="#community" onClick={() => setMobileMenuOpen(false)}>Community</MobileNavLink>
                <MobileNavLink href="#services" onClick={() => setMobileMenuOpen(false)}>Services</MobileNavLink>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-smooth text-sm font-medium border border-white/20"
                >
                  AI Chatbot
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero/Slider Section - Animated Gradient Background */}
      <section id="slider" className="relative min-h-[500px] md:min-h-[600px] overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-harlingen-navy via-harlingen-teal to-harlingen-purple animate-gradient">
          <div className="absolute inset-0 bg-black/30" />
          {/* Decorative Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Slider Caption */}
        <div className="relative z-10 container mx-auto px-4 h-[500px] md:h-[600px] flex flex-col justify-center">
          <div className="max-w-3xl space-y-4 sm:space-y-6">
            <div className="animate-fade-in">
              <span className="block text-white/90 text-xl sm:text-2xl md:text-3xl font-medium text-shadow-md mb-2">
                Welcome to
              </span>
              <span className="block text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-shadow-lg mb-2 sm:mb-4">
                Harlingen
              </span>
              <p className="text-white/90 text-base sm:text-xl md:text-2xl text-shadow-sm max-w-2xl font-light">
                Your Gateway to the Rio Grande Valley
              </p>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link href="#services" className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-harlingen-navy font-semibold rounded-lg shadow-lg hover:shadow-xl transition-smooth hover:scale-105">
                Explore Services
              </Link>
              <Link href="#contact" className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white font-semibold rounded-lg border-2 border-white/50 hover:bg-white/20 transition-smooth backdrop-blur-sm hover:scale-105">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
          <div className="flex items-center gap-2 glass-dark px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm" role="group" aria-label="Language selection">
            <button className="text-white font-medium hover:text-harlingen-gold transition-smooth">
              EN
            </button>
            <span className="text-white/50">|</span>
            <button className="text-white/70 font-medium hover:text-white transition-smooth">
              ES
            </button>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-6 sm:py-8 bg-white border-b shadow-sm" aria-label="Quick access links">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 scrollbar-hide touch-scroll snap-x" role="navigation" aria-label="Quick links">
            <QuickLink icon={<FileCheck className="w-5 h-5" />} title="Meetings & Agendas" href="#agendas" />
            <QuickLink icon={<Building2 className="w-5 h-5" />} title="City Services" href="#services" />
            <QuickLink icon={<Calendar className="w-5 h-5" />} title="Events Calendar" href="#events" />
            <QuickLink icon={<FileCheck className="w-5 h-5" />} title="Permits" href="#permits" />
            <QuickLink icon={<Droplets className="w-5 h-5" />} title="Utilities" href="#utilities" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          {/* City Services Grid */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 text-center">
              City Services
            </h2>
            <p className="text-gray-600 text-center mb-8 sm:mb-12 text-base sm:text-lg px-4">
              Explore our comprehensive range of municipal services
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <ServiceCard
                title="Utilities"
                description="Water, electric, and trash services"
                icon={<div className="flex gap-1"><Droplets className="w-5 h-5" /><Zap className="w-4 h-4" /></div>}
                href="#utilities"
              />
              <ServiceCard
                title="Public Works"
                description="Street maintenance and infrastructure"
                icon={<Construction className="w-6 h-6" />}
                href="#public-works"
              />
              <ServiceCard
                title="Parks & Recreation"
                description="Community programs and facilities"
                icon={<Trees className="w-6 h-6" />}
                href="#parks"
              />
              <ServiceCard
                title="Police Department"
                description="Public safety and emergency services"
                icon={<ShieldCheck className="w-6 h-6 fill-current" />}
                href="#police"
              />
              <ServiceCard
                title="Fire Department"
                description="Fire protection and rescue services"
                icon={<Flame className="w-6 h-6 fill-current" />}
                href="#fire"
              />
              <ServiceCard
                title="Permits & Licenses"
                description="Building permits and business licenses"
                icon={<FileCheck className="w-6 h-6" />}
                href="#permits"
              />
            </div>
          </section>

          {/* News & Events */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="md:col-span-2 glass-light p-6 sm:p-8 rounded-xl shadow-card hover:shadow-card-hover transition-smooth">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
                <span className="text-harlingen-navy">📰</span>
                Latest News
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <NewsItem
                  title="City Commission Meeting - January 2026"
                  date="January 15, 2026"
                  excerpt="Join us for the monthly commission meeting to discuss upcoming city initiatives."
                />
                <NewsItem
                  title="New Parks and Recreation Programs"
                  date="January 10, 2026"
                  excerpt="Exciting new community programs launching this spring for all ages."
                />
                <NewsItem
                  title="Infrastructure Improvement Projects Update"
                  date="January 5, 2026"
                  excerpt="Check out the progress on our major infrastructure enhancement projects."
                />
              </div>
            </div>
            <div className="text-white p-6 sm:p-8 rounded-xl shadow-card" style={{
              background: 'linear-gradient(135deg, #1a2b4e 0%, #2d4a5e 100%)'
            }}>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <span>ℹ️</span>
                Quick Info
              </h3>
              <div className="space-y-4 sm:space-y-5 text-sm">
                <InfoItem label="City Hall Hours" value="Mon-Fri, 8am-5pm" />
                <InfoItem label="Emergency" value="911" />
                <InfoItem label="Non-Emergency" value="(956) 427-8080" />
                <InfoItem label="Population" value="~72,000" />
                <div className="pt-4 border-t border-white/20">
                  <Link href="#contact" className="flex items-center gap-2 text-harlingen-gold hover:text-white transition-smooth font-semibold">
                    <span>Contact Us</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white py-10 sm:py-12 relative" style={{ backgroundColor: '#1a2b4e' }}>
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-harlingen-teal via-harlingen-purple to-harlingen-teal"></div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">City of Harlingen</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                418 E. Tyler Ave<br />
                Harlingen, TX 78550
              </p>
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h4>
              <FooterLink href="#government">Government</FooterLink>
              <FooterLink href="#departments">Departments</FooterLink>
              <FooterLink href="#community">Community</FooterLink>
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Services</h4>
              <FooterLink href="#utilities">Utilities</FooterLink>
              <FooterLink href="#permits">Permits</FooterLink>
              <FooterLink href="#parks">Parks & Recreation</FooterLink>
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Contact</h4>
              <p className="text-gray-300 text-sm mb-2">
                Phone: (956) 427-8080
              </p>
              <p className="text-gray-300 text-sm">
                Email: city@harlingentx.gov
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-300 text-xs sm:text-sm">
            © 2026 City of Harlingen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component helpers
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-white/90 hover:text-white transition-smooth font-medium text-sm relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-harlingen-gold after:transition-all hover:after:w-full"
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-smooth font-medium border border-white/10 min-h-[44px] flex items-center"
    >
      {children}
    </Link>
  )
}

function QuickLink({ icon, title, href }: { icon: React.ReactNode; title: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-harlingen-navy/10 hover:to-harlingen-teal/10 rounded-xl transition-smooth whitespace-nowrap shadow-sm hover:shadow-md border border-gray-200 hover:border-harlingen-navy/20 group flex-shrink-0 snap-start min-h-[44px]"
    >
      <span className="text-harlingen-navy group-hover:text-harlingen-teal transition-smooth group-hover:scale-110">{icon}</span>
      <span className="text-sm font-semibold text-gray-700 group-hover:text-harlingen-navy">{title}</span>
    </Link>
  )
}

function ServiceCard({ title, description, icon, href }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group glass-light p-4 sm:p-6 rounded-xl shadow-card hover:shadow-card-hover transition-smooth-slow border border-gray-100 hover:border-harlingen-navy/20 animate-scale-in"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-harlingen-blue to-harlingen-teal rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-smooth shadow-glow">
        <span className="text-white">{icon}</span>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-harlingen-navy transition-smooth">{title}</h3>
      <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed">{description}</p>
      <span className="text-harlingen-blue font-semibold text-sm group-hover:text-harlingen-navy group-hover:underline flex items-center gap-2">
        Learn More
        <span className="group-hover:translate-x-1 transition-smooth">→</span>
      </span>
    </Link>
  )
}

function NewsItem({ title, date, excerpt }: { title: string; date: string; excerpt?: string }) {
  return (
    <div className="border-l-4 border-harlingen-blue pl-4 py-2 hover:border-harlingen-navy transition-smooth group cursor-pointer">
      <h4 className="font-bold text-base sm:text-lg text-gray-900 mb-1 group-hover:text-harlingen-navy transition-smooth">{title}</h4>
      <p className="text-xs sm:text-sm text-gray-500 mb-2">{date}</p>
      {excerpt && <p className="text-sm text-gray-600 leading-relaxed">{excerpt}</p>}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-3 last:border-0">
      <dt className="text-gray-300 text-xs mb-1 uppercase tracking-wide">{label}</dt>
      <dd className="font-bold text-base sm:text-lg">{value}</dd>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block text-gray-300 hover:text-harlingen-gold transition-smooth text-sm mb-2 hover:translate-x-1"
    >
      {children}
    </Link>
  )
}
