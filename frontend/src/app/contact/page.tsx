'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Phone, Mail, MapPin, Clock, Building2, ChevronLeft } from 'lucide-react'

export default function ContactPage() {
    const { language, t } = useLanguage()

    const departments = [
        {
            name: t('City Hall / General Information', 'Ayuntamiento / Información General'),
            phone: '(956) 427-8700',
            email: 'city@harlingentx.gov',
            address: '118 E. Tyler Avenue, Harlingen, TX 78550',
        },
        {
            name: t('Utilities Department', 'Departamento de Servicios Públicos'),
            phone: '(956) 427-8080',
            email: 'utilities@harlingentx.gov',
            address: '418 E. Tyler Avenue, Harlingen, TX 78550',
        },
        {
            name: t('Parks & Recreation', 'Parques y Recreación'),
            phone: '(956) 430-6600',
            email: 'parks@harlingentx.gov',
            address: '410 E. Tyler Avenue, Harlingen, TX 78550',
        },
        {
            name: t('Building & Development Services', 'Servicios de Construcción y Desarrollo'),
            phone: '(956) 427-8060',
            email: 'permits@harlingentx.gov',
            address: '118 E. Tyler Avenue, Harlingen, TX 78550',
        },
        {
            name: t('Police Department (Non-Emergency)', 'Departamento de Policía (No Emergencia)'),
            phone: '(956) 427-8080',
            email: 'police@harlingentx.gov',
            address: '1102 S. 77 Sunshine Strip, Harlingen, TX 78550',
        },
        {
            name: t('Fire Department', 'Departamento de Bomberos'),
            phone: '(956) 427-8080',
            email: 'fire@harlingentx.gov',
            address: 'Station 1: 1102 S. Commerce Street, Harlingen, TX 78550',
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-40 shadow-lg glass-dark backdrop-blur-md" style={{ backgroundColor: 'rgba(26, 43, 78, 0.95)' }}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        <Link href="/" className="flex items-center gap-3 group">
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

                        <Link
                            href="/"
                            className="flex items-center gap-2 text-white/90 hover:text-white transition-smooth"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('Back to Home', 'Volver al Inicio')}</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                {/* Page Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        {t('Contact Us', 'Contáctenos')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t(
                            'Get in touch with the City of Harlingen. We\'re here to help!',
                            '¡Comuníquese con la Ciudad de Harlingen. Estamos aquí para ayudarle!'
                        )}
                    </p>
                </div>

                {/* Emergency Notice */}
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
                    <p className="font-semibold text-red-800">
                        {t('For Emergencies, call 911', 'Para Emergencias, llame al 911')}
                    </p>
                </div>

                {/* City Hall Info Card */}
                <div className="bg-gradient-to-br from-harlingen-navy to-harlingen-teal text-white p-8 rounded-2xl shadow-xl mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Building2 className="w-8 h-8" />
                        <h2 className="text-2xl font-bold">{t('City Hall', 'Ayuntamiento')}</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">{t('Address', 'Dirección')}</p>
                                    <p className="text-white/90">118 E. Tyler Avenue<br />Harlingen, TX 78550</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">{t('Hours', 'Horario')}</p>
                                    <p className="text-white/90">{t('Monday - Friday', 'Lunes - Viernes')}, 8:00 AM - 5:00 PM</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">{t('Phone', 'Teléfono')}</p>
                                    <a href="tel:9564278700" className="text-white/90 hover:text-white underline">
                                        (956) 427-8700
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">{t('Email', 'Correo Electrónico')}</p>
                                    <a href="mailto:city@harlingentx.gov" className="text-white/90 hover:text-white underline">
                                        city@harlingentx.gov
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Department Directory */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t('Department Directory', 'Directorio de Departamentos')}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {departments.map((dept, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-smooth"
                        >
                            <h3 className="font-bold text-lg text-gray-900 mb-3">{dept.name}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <a href={`tel:${dept.phone.replace(/[^0-9]/g, '')}`} className="hover:text-harlingen-blue">
                                        {dept.phone}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <a href={`mailto:${dept.email}`} className="hover:text-harlingen-blue">
                                        {dept.email}
                                    </a>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{dept.address}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Map Placeholder */}
                <div className="mt-12 p-8 bg-gray-100 rounded-xl text-center">
                    <p className="text-gray-500">
                        {t(
                            'City of Harlingen - Located in the heart of the Rio Grande Valley',
                            'Ciudad de Harlingen - Ubicada en el corazón del Valle del Río Grande'
                        )}
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-white py-8 mt-12" style={{ backgroundColor: '#1a2b4e' }}>
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-300 text-sm">
                        © 2026 {t('City of Harlingen', 'Ciudad de Harlingen')}. {t('All rights reserved.', 'Todos los derechos reservados.')}
                    </p>
                </div>
            </footer>
        </div>
    )
}
