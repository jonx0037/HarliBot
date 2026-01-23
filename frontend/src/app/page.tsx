'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'
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
} from 'lucide-react'

export default function HomePage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { language, setLanguage, t } = useLanguage()

    return (
        <div className="min-h-screen">
            {/* Skip Link for Keyboard Navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-harlingen-navy focus:text-white focus:p-4 focus:m-2 focus:rounded"
            >
                {t('Skip to main content', 'Saltar al contenido principal')}
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
                                <h1 className="text-base sm:text-xl font-bold text-shadow-md">
                                    {t('City of Harlingen', 'Ciudad de Harlingen')}
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-200">Texas</p>
                            </div>
                        </Link>

                        {/* Navigation - Desktop */}
                        <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
                            <NavLink href="#government">{t('Government', 'Gobierno')}</NavLink>
                            <NavLink href="#departments">{t('Departments', 'Departamentos')}</NavLink>
                            <NavLink href="#community">{t('Community', 'Comunidad')}</NavLink>
                            <NavLink href="#services">{t('Services', 'Servicios')}</NavLink>
                            <Link href="/contact" className="text-white/90 hover:text-white transition-smooth font-medium text-sm relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-harlingen-gold after:transition-all hover:after:w-full">
                                {t('Contact', 'Contacto')}
                            </Link>
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-smooth"
                            aria-label={mobileMenuOpen ? t("Close menu", "Cerrar menú") : t("Open menu", "Abrir menú")}
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
                                <MobileNavLink href="#government" onClick={() => setMobileMenuOpen(false)}>
                                    {t('Government', 'Gobierno')}
                                </MobileNavLink>
                                <MobileNavLink href="#departments" onClick={() => setMobileMenuOpen(false)}>
                                    {t('Departments', 'Departamentos')}
                                </MobileNavLink>
                                <MobileNavLink href="#community" onClick={() => setMobileMenuOpen(false)}>
                                    {t('Community', 'Comunidad')}
                                </MobileNavLink>
                                <MobileNavLink href="#services" onClick={() => setMobileMenuOpen(false)}>
                                    {t('Services', 'Servicios')}
                                </MobileNavLink>
                                <Link
                                    href="/contact"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-smooth font-medium border border-white/10 min-h-[44px] flex items-center"
                                >
                                    {t('Contact', 'Contacto')}
                                </Link>
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
                                {t('Welcome to', 'Bienvenido a')}
                            </span>
                            <span className="block text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-shadow-lg mb-2 sm:mb-4">
                                Harlingen
                            </span>
                            <p className="text-white/90 text-base sm:text-xl md:text-2xl text-shadow-sm max-w-2xl font-light">
                                {t('Your Gateway to the Rio Grande Valley', 'Tu Puerta de Entrada al Valle del Río Grande')}
                            </p>
                        </div>

                        {/* Call-to-Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                            <Link href="#services" className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-harlingen-navy font-semibold rounded-lg shadow-lg hover:shadow-xl transition-smooth hover:scale-105">
                                {t('Explore Services', 'Explorar Servicios')}
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white font-semibold rounded-lg border-2 border-white/50 hover:bg-white/20 transition-smooth backdrop-blur-sm hover:scale-105">
                                {t('Contact Us', 'Contáctenos')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Language Selector */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
                    <div className="flex items-center gap-1 glass-dark px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-sm" role="group" aria-label={t('Language selection', 'Selección de idioma')}>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-3 py-1 rounded-full font-medium transition-smooth ${language === 'en'
                                ? 'bg-white text-harlingen-navy'
                                : 'text-white/70 hover:text-white'
                                }`}
                            aria-pressed={language === 'en'}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage('es')}
                            className={`px-3 py-1 rounded-full font-medium transition-smooth ${language === 'es'
                                ? 'bg-white text-harlingen-navy'
                                : 'text-white/70 hover:text-white'
                                }`}
                            aria-pressed={language === 'es'}
                        >
                            ES
                        </button>
                    </div>
                </div>
            </section>

            {/* Quick Links Section */}
            <section className="py-6 sm:py-8 bg-white border-b shadow-sm" aria-label={t('Quick access links', 'Enlaces de acceso rápido')}>
                <div className="container mx-auto px-3 sm:px-4">
                    <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 scrollbar-hide touch-scroll snap-x" role="navigation" aria-label={t('Quick links', 'Enlaces rápidos')}>
                        <QuickLink icon={<FileCheck className="w-5 h-5" />} title={t('Meetings & Agendas', 'Reuniones y Agendas')} href="#news" />
                        <QuickLink icon={<Building2 className="w-5 h-5" />} title={t('City Services', 'Servicios de la Ciudad')} href="#services" />
                        <QuickLink icon={<Calendar className="w-5 h-5" />} title={t('Events Calendar', 'Calendario de Eventos')} href="#news" />
                        <QuickLink icon={<FileCheck className="w-5 h-5" />} title={t('Permits', 'Permisos')} href="#services" />
                        <QuickLink icon={<Droplets className="w-5 h-5" />} title={t('Utilities', 'Servicios Públicos')} href="#services" />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main id="main-content" className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    {/* City Services Grid */}
                    <section id="services" className="mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 text-center">
                            {t('City Services', 'Servicios de la Ciudad')}
                        </h2>
                        <p className="text-gray-600 text-center mb-8 sm:mb-12 text-base sm:text-lg px-4">
                            {t('Explore our comprehensive range of municipal services', 'Explore nuestra amplia gama de servicios municipales')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            <ServiceCard
                                title={t('Utilities', 'Servicios Públicos')}
                                description={t('Water, electric, and trash services', 'Servicios de agua, electricidad y basura')}
                                icon={<div className="flex gap-1"><Droplets className="w-5 h-5" /><Zap className="w-4 h-4" /></div>}
                            />
                            <ServiceCard
                                title={t('Public Works', 'Obras Públicas')}
                                description={t('Street maintenance and infrastructure', 'Mantenimiento de calles e infraestructura')}
                                icon={<Construction className="w-6 h-6" />}
                            />
                            <ServiceCard
                                title={t('Parks & Recreation', 'Parques y Recreación')}
                                description={t('Community programs and facilities', 'Programas comunitarios e instalaciones')}
                                icon={<Trees className="w-6 h-6" />}
                            />
                            <ServiceCard
                                title={t('Police Department', 'Departamento de Policía')}
                                description={t('Public safety and emergency services', 'Seguridad pública y servicios de emergencia')}
                                icon={<ShieldCheck className="w-6 h-6 fill-current" />}
                            />
                            <ServiceCard
                                title={t('Fire Department', 'Departamento de Bomberos')}
                                description={t('Fire protection and rescue services', 'Protección contra incendios y servicios de rescate')}
                                icon={<Flame className="w-6 h-6 fill-current" />}
                            />
                            <ServiceCard
                                title={t('Permits & Licenses', 'Permisos y Licencias')}
                                description={t('Building permits and business licenses', 'Permisos de construcción y licencias comerciales')}
                                icon={<FileCheck className="w-6 h-6" />}
                            />
                        </div>
                    </section>

                    {/* News & Events */}
                    <section id="news" className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <div className="md:col-span-2 glass-light p-6 sm:p-8 rounded-xl shadow-card hover:shadow-card-hover transition-smooth">
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
                                <span className="text-harlingen-navy">📰</span>
                                {t('Latest News', 'Últimas Noticias')}
                            </h3>
                            <div className="space-y-4 sm:space-y-6">
                                <NewsItem
                                    title={t('City Commission Meeting - January 2026', 'Reunión de la Comisión de la Ciudad - Enero 2026')}
                                    date={t('January 15, 2026', '15 de enero de 2026')}
                                    excerpt={t('Join us for the monthly commission meeting to discuss upcoming city initiatives.', 'Acompáñenos en la reunión mensual de la comisión para discutir las próximas iniciativas de la ciudad.')}
                                />
                                <NewsItem
                                    title={t('New Parks and Recreation Programs', 'Nuevos Programas de Parques y Recreación')}
                                    date={t('January 10, 2026', '10 de enero de 2026')}
                                    excerpt={t('Exciting new community programs launching this spring for all ages.', 'Emocionantes nuevos programas comunitarios que se lanzan esta primavera para todas las edades.')}
                                />
                                <NewsItem
                                    title={t('Infrastructure Improvement Projects Update', 'Actualización de Proyectos de Mejora de Infraestructura')}
                                    date={t('January 5, 2026', '5 de enero de 2026')}
                                    excerpt={t('Check out the progress on our major infrastructure enhancement projects.', 'Consulte el progreso de nuestros principales proyectos de mejora de infraestructura.')}
                                />
                            </div>
                        </div>
                        <div className="text-white p-6 sm:p-8 rounded-xl shadow-card" style={{
                            background: 'linear-gradient(135deg, #1a2b4e 0%, #2d4a5e 100%)'
                        }}>
                            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                                <span>ℹ️</span>
                                {t('Quick Info', 'Información Rápida')}
                            </h3>
                            <div className="space-y-4 sm:space-y-5 text-sm">
                                <InfoItem label={t('City Hall Hours', 'Horario del Ayuntamiento')} value={t('Mon-Fri, 8am-5pm', 'Lun-Vie, 8am-5pm')} />
                                <InfoItem label={t('Emergency', 'Emergencia')} value="911" />
                                <InfoItem label={t('Non-Emergency', 'No Emergencia')} value="(956) 427-8080" />
                                <InfoItem label={t('Population', 'Población')} value="~72,000" />
                                <div className="pt-4 border-t border-white/20">
                                    <Link href="/contact" className="flex items-center gap-2 text-harlingen-gold hover:text-white transition-smooth font-semibold">
                                        <span>{t('Contact Us', 'Contáctenos')}</span>
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
                            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
                                {t('City of Harlingen', 'Ciudad de Harlingen')}
                            </h4>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                418 E. Tyler Ave<br />
                                Harlingen, TX 78550
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
                                {t('Quick Links', 'Enlaces Rápidos')}
                            </h4>
                            <FooterLink href="#services">{t('Services', 'Servicios')}</FooterLink>
                            <FooterLink href="#news">{t('News', 'Noticias')}</FooterLink>
                            <FooterLink href="/contact">{t('Contact', 'Contacto')}</FooterLink>
                        </div>
                        <div>
                            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
                                {t('Services', 'Servicios')}
                            </h4>
                            <FooterLink href="#services">{t('Utilities', 'Servicios Públicos')}</FooterLink>
                            <FooterLink href="#services">{t('Permits', 'Permisos')}</FooterLink>
                            <FooterLink href="#services">{t('Parks & Recreation', 'Parques y Recreación')}</FooterLink>
                        </div>
                        <div>
                            <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
                                {t('Contact', 'Contacto')}
                            </h4>
                            <p className="text-gray-300 text-sm mb-2">
                                {t('Phone', 'Teléfono')}: (956) 427-8080
                            </p>
                            <p className="text-gray-300 text-sm">
                                {t('Email', 'Correo')}: city@harlingentx.gov
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-white/20 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-300 text-xs sm:text-sm">
                        © 2026 {t('City of Harlingen. All rights reserved.', 'Ciudad de Harlingen. Todos los derechos reservados.')}
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

function ServiceCard({ title, description, icon }: {
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="group glass-light p-4 sm:p-6 rounded-xl shadow-card hover:shadow-card-hover transition-smooth-slow border border-gray-100 hover:border-harlingen-navy/20 animate-scale-in">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-harlingen-blue to-harlingen-teal rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-smooth shadow-glow">
                <span className="text-white">{icon}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-harlingen-navy transition-smooth">{title}</h3>
            <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed">{description}</p>
        </div>
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
