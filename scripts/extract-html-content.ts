/**
 * HTML Content Extractor for HarliBot
 * 
 * Processes the downloaded HTML files from harlingentx.gov and converts them
 * to the document format expected by the existing processing pipeline.
 * 
 * Usage: npx ts-node scripts/extract-html-content.ts
 */

import * as cheerio from 'cheerio'
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get the project root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')

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

// Directories to prioritize for high-value content
const HIGH_VALUE_DIRECTORIES = [
    'departments',
    'community',
    'government',
    'forms'
]

// File patterns to skip (low-value content)
const SKIP_PATTERNS = [
    /agenda_detail/,
    /bid_detail/,
    /business_detail/,
    /news_detail/,
    /calendar\.php/,
    /search\.php/,
    /newslist\.php/,
]

function hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(36)
}

function detectLanguage(text: string): 'en' | 'es' {
    const spanishIndicators = ['el', 'la', 'los', 'las', 'de', 'del', 'y', 'para', 'con', 'que', 'en', 'es', 'por']
    const words = text.toLowerCase().split(/\s+/).slice(0, 100)
    const spanishScore = words.filter(w => spanishIndicators.includes(w)).length
    return spanishScore > 10 ? 'es' : 'en'
}

function cleanText(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .replace(/\t+/g, ' ')
        .trim()
}

function extractContentFromHTML(html: string, filename: string): ScrapedDocument | null {
    const $ = cheerio.load(html)

    // Remove non-content elements
    $('nav, header, footer, script, style, iframe, noscript, .advertisement, .sidebar, .menu, #menu, #nav, #footer, #header').remove()

    // Try to extract main content
    let mainContent = ''

    // Priority selectors for main content
    const contentSelectors = [
        '.content-area',
        '.main-content',
        '#content',
        'main',
        'article',
        '.entry-content',
        '.page-content',
        'body'
    ]

    for (const selector of contentSelectors) {
        const element = $(selector)
        if (element.length && element.text().trim().length > 200) {
            mainContent = element.text()
            break
        }
    }

    if (!mainContent) {
        mainContent = $('body').text()
    }

    mainContent = cleanText(mainContent)

    // Skip if content is too short or looks like a navigation page
    if (mainContent.length < 300) {
        return null
    }

    // Extract title
    const title = $('h1').first().text().trim() ||
        $('title').text().split('|')[0].trim() ||
        filename.replace('.html', '').replace(/_/g, ' ')

    // Derive URL from filename
    const baseUrl = 'https://www.harlingentx.gov'
    const urlPath = filename
        .replace('.html', '')
        .replace('.php', '')
        .replace(/﹖.+$/, '') // Remove query params in filename
        .replace(/_/g, '/')
    const url = `${baseUrl}/${urlPath}`

    // Derive category from path
    const pathParts = urlPath.split('/').filter(Boolean)
    const category = pathParts[0] || 'general'

    // Extract links (for reference, not critical)
    const links: string[] = []
    $('a[href]').each((_, el) => {
        const href = $(el).attr('href')
        if (href && href.includes('harlingentx.gov')) {
            links.push(href)
        }
    })

    return {
        url,
        urlHash: hashString(url),
        title: cleanText(title),
        content: mainContent,
        metadata: {
            category,
            tags: pathParts,
            language: detectLanguage(mainContent),
            scrapedAt: new Date().toISOString(),
        },
        links: links.slice(0, 10), // Limit stored links
    }
}

function shouldProcessFile(filename: string): boolean {
    // Skip files matching skip patterns
    for (const pattern of SKIP_PATTERNS) {
        if (pattern.test(filename)) {
            return false
        }
    }
    return filename.endsWith('.html')
}

function processDirectory(dirPath: string, documents: ScrapedDocument[], depth = 0): void {
    const maxDepth = 3
    if (depth > maxDepth) return

    try {
        const entries = readdirSync(dirPath)

        for (const entry of entries) {
            const fullPath = join(dirPath, entry)
            const stats = statSync(fullPath)

            if (stats.isDirectory() && !entry.startsWith('.') && entry !== '_assets_') {
                // Recurse into directories
                processDirectory(fullPath, documents, depth + 1)
            } else if (stats.isFile() && shouldProcessFile(entry)) {
                try {
                    const html = readFileSync(fullPath, 'utf-8')
                    const doc = extractContentFromHTML(html, entry)

                    if (doc) {
                        documents.push(doc)
                        console.log(`  ✓ ${entry.substring(0, 50)}...`)
                    }
                } catch (err) {
                    console.error(`  ✗ Error processing ${entry}:`, (err as Error).message)
                }
            }
        }
    } catch (err) {
        console.error(`Error reading directory ${dirPath}:`, err)
    }
}

async function main() {
    console.log('HarliBot HTML Content Extractor')
    console.log('================================\n')

    const sourceDir = join(PROJECT_ROOT, 'docs', 'HarlingenTX_site_download', 'www.harlingentx.gov')
    const outputDir = join(PROJECT_ROOT, 'data', 'raw')
    const outputPath = join(outputDir, 'documents.json')

    // Ensure output directory exists
    mkdirSync(outputDir, { recursive: true })

    const documents: ScrapedDocument[] = []

    // Process high-value directories first
    console.log('Processing high-value directories...\n')
    for (const dir of HIGH_VALUE_DIRECTORIES) {
        const dirPath = join(sourceDir, dir)
        try {
            console.log(`📁 ${dir}/`)
            processDirectory(dirPath, documents, 0)
        } catch (err) {
            console.log(`  Directory not found: ${dir}`)
        }
    }

    // Process root-level HTML files
    console.log('\n📁 Root level files')
    try {
        const rootEntries = readdirSync(sourceDir)
        for (const entry of rootEntries) {
            const fullPath = join(sourceDir, entry)
            const stats = statSync(fullPath)

            if (stats.isFile() && shouldProcessFile(entry)) {
                try {
                    const html = readFileSync(fullPath, 'utf-8')
                    const doc = extractContentFromHTML(html, entry)

                    if (doc) {
                        documents.push(doc)
                        console.log(`  ✓ ${entry.substring(0, 50)}...`)
                    }
                } catch (err) {
                    console.error(`  ✗ Error: ${entry}`)
                }
            }
        }
    } catch (err) {
        console.error('Error processing root directory')
    }

    // Deduplicate by URL hash
    const uniqueDocs = Array.from(
        new Map(documents.map(doc => [doc.urlHash, doc])).values()
    )

    console.log('\n================================')
    console.log(`Total documents extracted: ${uniqueDocs.length}`)
    console.log(`English: ${uniqueDocs.filter(d => d.metadata.language === 'en').length}`)
    console.log(`Spanish: ${uniqueDocs.filter(d => d.metadata.language === 'es').length}`)

    // Category breakdown
    const categories = uniqueDocs.reduce((acc, doc) => {
        acc[doc.metadata.category] = (acc[doc.metadata.category] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    console.log('\nBy category:')
    Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count}`)
        })

    // Save to JSON
    writeFileSync(outputPath, JSON.stringify(uniqueDocs, null, 2))
    console.log(`\nSaved to: ${outputPath}`)

    console.log('\n📋 Next Steps:')
    console.log('1. Run the processor: npx ts-node scripts/processor.ts')
    console.log('2. Run the embedder: npx ts-node scripts/embedder.ts')
    console.log('3. Translate: python scripts/translate_to_spanish.py')
    console.log('4. Verify: npx ts-node scripts/test-chroma.ts')
}

main().catch(console.error)
