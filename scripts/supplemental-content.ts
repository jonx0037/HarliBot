/**
 * Supplemental Content Generator for HarliBot
 * 
 * This script generates structured content documents for key city information
 * that may not be explicitly present or well-structured on the scraped website.
 * 
 * It ensures that common questions like "Where is City Hall?" have authoritative
 * answers in the RAG knowledge base.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import * as crypto from 'crypto'

interface ScrapedDocument {
    url: string
    urlHash: string
    title: string
    content: string
    metadata: {
        department?: string
        category: string
        tags: string[]
        language: 'en' | 'es'
        scrapedAt: string
    }
    links: string[]
}

function hashString(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex').substring(0, 12)
}

// Supplemental content for English
const supplementalContentEN: ScrapedDocument[] = [
    {
        url: 'https://www.harlingentx.gov/contact/city-hall',
        urlHash: hashString('https://www.harlingentx.gov/contact/city-hall'),
        title: 'City Hall - Contact Information',
        content: `City Hall - Contact Information

Where is City Hall?
Harlingen City Hall is located at 118 E. Tyler Avenue, Harlingen, TX 78550.

City Hall Address:
118 E. Tyler Avenue
Harlingen, Texas 78550

City Hall Hours:
Monday through Friday, 8:00 AM to 5:00 PM
Closed on weekends and city holidays.

City Hall Phone Numbers:
Main Number: (956) 427-8700
City Secretary: (956) 216-5010
City Manager: (956) 216-5000
Fax: (956) 216-5012

Email:
General Inquiries: city@harlingentx.gov

What services are available at City Hall?
City Hall houses several departments including:
- City Secretary's Office
- City Manager's Office
- Finance Department
- Building & Development Services
- Planning & Zoning
- Human Resources

How to Visit City Hall:
City Hall is located in downtown Harlingen on East Tyler Avenue. Parking is available on the street and in nearby public parking areas. The building is ADA accessible.

For Emergencies: Call 911
For Non-Emergency Police: Call (956) 216-5401`,
        metadata: {
            department: 'City Secretary',
            category: 'contact',
            tags: ['contact', 'city hall', 'hours', 'address', 'phone'],
            language: 'en',
            scrapedAt: new Date().toISOString(),
        },
        links: [],
    },
    {
        url: 'https://www.harlingentx.gov/contact/departments',
        urlHash: hashString('https://www.harlingentx.gov/contact/departments'),
        title: 'Department Contact Information',
        content: `City of Harlingen - Department Contact Directory

Utilities Department
Address: 418 E. Tyler Avenue, Harlingen, TX 78550
Phone: (956) 427-8080
Hours: Monday-Friday, 8:00 AM - 5:00 PM
Services: Water, wastewater, trash collection, billing

Police Department (Non-Emergency)
Address: 1018 Fair Park Blvd, Harlingen, TX 78550
Non-Emergency Phone: (956) 216-5401
Emergency: 911
Records: (956) 216-5476

Fire Department
Address: 1102 S. Commerce Street, Harlingen, TX 78550
Non-Emergency Phone: (956) 216-5900
Emergency: 911

Parks & Recreation
Address: 410 E. Tyler Avenue, Harlingen, TX 78550
Phone: (956) 430-6600
Email: parks@harlingentx.gov

Building & Development Services (Permits)
Address: 118 E. Tyler Avenue, Harlingen, TX 78550 (City Hall)
Phone: (956) 216-5160
Services: Building permits, inspections, zoning

Public Works
Address: 701 N. 13th Street, Harlingen, TX 78550
Phone: (956) 216-5300
Services: Streets, drainage, traffic signals

Library (Harlingen Public Library)
Address: 410 '76 Drive, Harlingen, TX 78550
Phone: (956) 216-5800
Hours: Mon-Thu 10AM-8PM, Fri-Sat 10AM-5PM

Animal Shelter
Address: 1106 Markowsky, Harlingen, TX 78550
Phone: (956) 216-5250
Email: animalshelter@harlingentx.gov`,
        metadata: {
            department: 'City Secretary',
            category: 'contact',
            tags: ['contact', 'departments', 'phone numbers', 'addresses'],
            language: 'en',
            scrapedAt: new Date().toISOString(),
        },
        links: [],
    },
]

// Supplemental content for Spanish
const supplementalContentES: ScrapedDocument[] = [
    {
        url: 'https://www.harlingentx.gov/contacto/ayuntamiento',
        urlHash: hashString('https://www.harlingentx.gov/contacto/ayuntamiento'),
        title: 'Ayuntamiento - Información de Contacto',
        content: `Ayuntamiento - Información de Contacto

¿Dónde está el Ayuntamiento?
El Ayuntamiento de Harlingen está ubicado en 118 E. Tyler Avenue, Harlingen, TX 78550.

Dirección del Ayuntamiento:
118 E. Tyler Avenue
Harlingen, Texas 78550

Horario del Ayuntamiento:
Lunes a viernes, de 8:00 AM a 5:00 PM
Cerrado los fines de semana y días festivos de la ciudad.

Teléfonos del Ayuntamiento:
Número principal: (956) 427-8700
Secretaría de la Ciudad: (956) 216-5010
Administrador de la Ciudad: (956) 216-5000
Fax: (956) 216-5012

Correo Electrónico:
Consultas generales: city@harlingentx.gov

¿Qué servicios están disponibles en el Ayuntamiento?
El Ayuntamiento alberga varios departamentos incluyendo:
- Oficina del Secretario de la Ciudad
- Oficina del Administrador de la Ciudad
- Departamento de Finanzas
- Servicios de Construcción y Desarrollo
- Planificación y Zonificación
- Recursos Humanos

Cómo Visitar el Ayuntamiento:
El Ayuntamiento está ubicado en el centro de Harlingen en East Tyler Avenue. Hay estacionamiento disponible en la calle y en áreas de estacionamiento público cercanas. El edificio es accesible para personas con discapacidades.

Para Emergencias: Llame al 911
Para Policía (No Emergencia): Llame al (956) 216-5401`,
        metadata: {
            department: 'Secretaría de la Ciudad',
            category: 'contacto',
            tags: ['contacto', 'ayuntamiento', 'horario', 'dirección', 'teléfono'],
            language: 'es',
            scrapedAt: new Date().toISOString(),
        },
        links: [],
    },
    {
        url: 'https://www.harlingentx.gov/contacto/departamentos',
        urlHash: hashString('https://www.harlingentx.gov/contacto/departamentos'),
        title: 'Información de Contacto de Departamentos',
        content: `Ciudad de Harlingen - Directorio de Contacto de Departamentos

Departamento de Servicios Públicos
Dirección: 418 E. Tyler Avenue, Harlingen, TX 78550
Teléfono: (956) 427-8080
Horario: Lunes-Viernes, 8:00 AM - 5:00 PM
Servicios: Agua, aguas residuales, recolección de basura, facturación

Departamento de Policía (No Emergencia)
Dirección: 1018 Fair Park Blvd, Harlingen, TX 78550
Teléfono No Emergencia: (956) 216-5401
Emergencia: 911
Registros: (956) 216-5476

Departamento de Bomberos
Dirección: 1102 S. Commerce Street, Harlingen, TX 78550
Teléfono No Emergencia: (956) 216-5900
Emergencia: 911

Parques y Recreación
Dirección: 410 E. Tyler Avenue, Harlingen, TX 78550
Teléfono: (956) 430-6600
Correo: parks@harlingentx.gov

Servicios de Construcción y Desarrollo (Permisos)
Dirección: 118 E. Tyler Avenue, Harlingen, TX 78550 (Ayuntamiento)
Teléfono: (956) 216-5160
Servicios: Permisos de construcción, inspecciones, zonificación

Obras Públicas
Dirección: 701 N. 13th Street, Harlingen, TX 78550
Teléfono: (956) 216-5300
Servicios: Calles, drenaje, señales de tráfico

Biblioteca (Biblioteca Pública de Harlingen)
Dirección: 410 '76 Drive, Harlingen, TX 78550
Teléfono: (956) 216-5800
Horario: Lun-Jue 10AM-8PM, Vie-Sáb 10AM-5PM

Refugio de Animales
Dirección: 1106 Markowsky, Harlingen, TX 78550
Teléfono: (956) 216-5250
Correo: animalshelter@harlingentx.gov`,
        metadata: {
            department: 'Secretaría de la Ciudad',
            category: 'contacto',
            tags: ['contacto', 'departamentos', 'teléfonos', 'direcciones'],
            language: 'es',
            scrapedAt: new Date().toISOString(),
        },
        links: [],
    },
]

async function main() {
    console.log('📄 Generating Supplemental Content for HarliBot...\n')

    const allSupplemental = [...supplementalContentEN, ...supplementalContentES]

    // Load existing documents - note: running from scripts/ so go up one level
    const rawDir = join(process.cwd(), '..', 'data', 'raw')
    const documentsPath = join(rawDir, 'documents.json')

    let existingDocuments: ScrapedDocument[] = []

    if (existsSync(documentsPath)) {
        existingDocuments = JSON.parse(readFileSync(documentsPath, 'utf-8'))
        console.log(`📖 Loaded ${existingDocuments.length} existing documents`)
    } else {
        console.log('⚠️  No existing documents found. Creating new file.')
        mkdirSync(rawDir, { recursive: true })
    }

    // Remove any previously added supplemental content (by URL pattern)
    const supplementalUrls = new Set(allSupplemental.map(d => d.url))
    const filteredDocuments = existingDocuments.filter(
        d => !supplementalUrls.has(d.url) &&
            !d.url.includes('/contact/city-hall') &&
            !d.url.includes('/contact/departments') &&
            !d.url.includes('/contacto/ayuntamiento') &&
            !d.url.includes('/contacto/departamentos')
    )

    // Merge supplemental content
    const mergedDocuments = [...filteredDocuments, ...allSupplemental]

    // Save merged documents
    writeFileSync(documentsPath, JSON.stringify(mergedDocuments, null, 2))

    console.log(`\n✨ Supplemental content added successfully!`)
    console.log(`📊 Summary:`)
    console.log(`   Previous documents: ${existingDocuments.length}`)
    console.log(`   Supplemental documents added: ${allSupplemental.length}`)
    console.log(`   Total documents: ${mergedDocuments.length}`)
    console.log(`\n💾 Saved to: ${documentsPath}`)

    console.log('\n📋 Next steps:')
    console.log('   1. npm run process    # Process documents into chunks')
    console.log('   2. npm run embed      # Generate embeddings')
    console.log('   3. npm run index      # Index to ChromaDB')
    console.log('\n   Or run: npm run pipeline')
}

main().catch(console.error)
