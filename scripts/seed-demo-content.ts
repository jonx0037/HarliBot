import { writeFileSync, mkdirSync, readFileSync } from 'fs'
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

interface ServiceContent {
    title: string
    url: string
    description: string
    sections: Array<{
        heading: string
        content: string
        subsections?: Array<{
            heading: string
            content: string
        }>
    }>
    faq: Array<{
        question: string
        answer: string
    }>
    contactInfo: {
        department: string
        phone: string
        email: string
        hours: string
        location: string
        emergency?: string
    }
}

interface ServicesData {
    utilities: ServiceContent
    parks: ServiceContent
    permits: ServiceContent
    safety: ServiceContent
}

function hashString(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex').substring(0, 12)
}

function convertServiceToDocument(
    key: string,
    service: ServiceContent,
    language: 'en' | 'es',
    baseUrl: string = 'https://harlingentx.gov'
): ScrapedDocument[] {
    const documents: ScrapedDocument[] = []
    const fullUrl = `${baseUrl}${service.url}?lang=${language}`

    // Main service page document
    let mainContent = `${service.title}\n\n${service.description}\n\n`

    // Add all section content
    service.sections.forEach(section => {
        mainContent += `${section.heading}\n${section.content}\n\n`

        if (section.subsections) {
            section.subsections.forEach(subsection => {
                mainContent += `${subsection.heading}\n${subsection.content}\n\n`
            })
        }
    })

    // Add contact info
    mainContent += `Contact Information\n`
    mainContent += `Department: ${service.contactInfo.department}\n`
    mainContent += `Phone: ${service.contactInfo.phone}\n`
    if (service.contactInfo.emergency) {
        mainContent += `Emergency: ${service.contactInfo.emergency}\n`
    }
    mainContent += `Email: ${service.contactInfo.email}\n`
    mainContent += `Hours: ${service.contactInfo.hours}\n`
    mainContent += `Location: ${service.contactInfo.location}\n`

    documents.push({
        url: fullUrl,
        urlHash: hashString(fullUrl),
        title: service.title,
        content: mainContent,
        metadata: {
            department: service.contactInfo.department,
            category: 'services',
            tags: ['services', key, language],
            language,
            scrapedAt: new Date().toISOString(),
        },
        links: []
    })

    // Create separate document for FAQ section
    if (service.faq && service.faq.length > 0) {
        const faqUrl = `${fullUrl}/faq?lang=${language}`
        let faqContent = `${service.title} - Frequently Asked Questions\n\n`

        service.faq.forEach(item => {
            faqContent += `Q: ${item.question}\nA: ${item.answer}\n\n`
        })

        documents.push({
            url: faqUrl,
            urlHash: hashString(faqUrl),
            title: `${service.title} - FAQ`,
            content: faqContent,
            metadata: {
                department: service.contactInfo.department,
                category: 'faq',
                tags: ['faq', key, language],
                language,
                scrapedAt: new Date().toISOString(),
            },
            links: [fullUrl]
        })
    }

    return documents
}

async function main() {
    console.log('🌱 Seeding demo content for HarliBot...\n')

    const allDocuments: ScrapedDocument[] = []

    // Load English content
    console.log('📖 Loading English content...')
    const enPath = join(process.cwd(), '..', 'frontend', 'src', 'data', 'content', 'services-en.json')
    const enData: ServicesData = JSON.parse(readFileSync(enPath, 'utf-8'))

    // Load Spanish content
    console.log('📖 Loading Spanish content...')
    const esPath = join(process.cwd(), '..', 'frontend', 'src', 'data', 'content', 'services-es.json')
    const esData: ServicesData = JSON.parse(readFileSync(esPath, 'utf-8'))

    // Convert English services
    console.log('🔄 Processing English services...')
    Object.keys(enData).forEach(key => {
        const serviceKey = key as keyof ServicesData
        const docs = convertServiceToDocument(key, enData[serviceKey], 'en')
        allDocuments.push(...docs)
        console.log(`  ✅ ${enData[serviceKey].title}: ${docs.length} documents`)
    })

    // Convert Spanish services
    console.log('🔄 Processing Spanish services...')
    Object.keys(esData).forEach(key => {
        const serviceKey = key as keyof ServicesData
        const docs = convertServiceToDocument(key, esData[serviceKey], 'es')
        allDocuments.push(...docs)
        console.log(`  ✅ ${esData[serviceKey].title}: ${docs.length} documents`)
    })

    // Create output directory
    const outputDir = join(process.cwd(), 'data', 'raw')
    mkdirSync(outputDir, { recursive: true })

    // Save to JSON
    const outputPath = join(outputDir, 'documents.json')
    writeFileSync(outputPath, JSON.stringify(allDocuments, null, 2))

    console.log(`\n✨ Demo content seeding complete!`)
    console.log(`📊 Summary:`)
    console.log(`   Total documents: ${allDocuments.length}`)
    console.log(`   English documents: ${allDocuments.filter(d => d.metadata.language === 'en').length}`)
    console.log(`   Spanish documents: ${allDocuments.filter(d => d.metadata.language === 'es').length}`)
    console.log(`   Service pages: ${allDocuments.filter(d => d.metadata.category === 'services').length}`)
    console.log(`   FAQ pages: ${allDocuments.filter(d => d.metadata.category === 'faq').length}`)
    console.log(`\n💾 Saved to: ${outputPath}`)

    console.log('\n📋 Next steps:')
    console.log('   1. npm run process  # Process documents into chunks')
    console.log('   2. npm run index     # Index chunks in ChromaDB')
    console.log('   3. Test chatbot with new content!')
}

main().catch(console.error)
