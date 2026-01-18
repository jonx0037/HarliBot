import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import * as cheerio from 'cheerio'

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

const documents: ScrapedDocument[] = []

// URL filtering patterns
const includePatterns = [
  /harlingentx\.gov\/government\/.*/,
  /harlingentx\.gov\/services\/.*/,
  /harlingentx\.gov\/residents\/.*/,
  /harlingentx\.gov\/business\/.*/,
  /harlingentx\.gov\/news-events\/.*/,
]

const excludePatterns = [
  /\/login/i,
  /\/admin/i,
  /\/wp-admin/i,
  /\/print\//i,
  /\.(pdf|doc|docx|xls|xlsx|zip)$/i,
  /calendar\//i,
]

function shouldCrawl(url: string): boolean {
  if (excludePatterns.some(pattern => pattern.test(url))) {
    return false
  }
  // If no include patterns match, crawl if it's a harlingentx.gov URL
  return includePatterns.some(pattern => pattern.test(url)) || 
         url.includes('harlingentx.gov')
}

function extractContent(html: string, url: string): ScrapedDocument | null {
  const $ = cheerio.load(html)

  // Remove non-content elements
  $('nav, header, footer, script, style, iframe, .advertisement').remove()

  // Extract main content
  const mainContent = 
    $('main').text() ||
    $('article').text() ||
    $('#content').text() ||
    $('.main-content').text() ||
    $('body').text()

  if (!mainContent || mainContent.trim().length < 100) {
    console.log(`Skipping ${url} - insufficient content`)
    return null
  }

  // Extract metadata
  const title = $('h1').first().text() || $('title').text() || 'Untitled'
  const description = $('meta[name="description"]').attr('content') || ''

  // Extract links
  const links = $('a[href^="http"]')
    .map((i, el) => $(el).attr('href'))
    .get()
    .filter(href => href?.includes('harlingentx.gov'))
    .filter((href): href is string => typeof href === 'string')

  // Derive category from URL
  const pathParts = new URL(url).pathname.split('/').filter(Boolean)
  const category = pathParts[0] || 'general'
  
  // Simple language detection
  const language = detectLanguage(mainContent)

  return {
    url,
    urlHash: hashString(url),
    title: cleanText(title),
    content: cleanText(mainContent),
    metadata: {
      category,
      tags: [category, ...pathParts.slice(1)].filter(Boolean),
      language,
      scrapedAt: new Date().toISOString(),
    },
    links,
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
}

function detectLanguage(text: string): 'en' | 'es' {
  const spanishIndicators = ['el', 'la', 'los', 'las', 'de', 'del', 'y', 'para', 'con']
  const words = text.toLowerCase().split(/\s+/).slice(0, 100)
  
  const spanishScore = words.filter(w => spanishIndicators.includes(w)).length
  return spanishScore > 10 ? 'es' : 'en'
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// Create crawler
const crawler = new PlaywrightCrawler({
  // Respect robots.txt
  respectRobotsTxt: true,
  
  // Rate limiting
  maxRequestsPerMinute: 30,
  maxConcurrency: 3,
  
  // Max crawl depth
  maxRequestsPerCrawl: 500,
  
  // Request timeout
  requestHandlerTimeoutSecs: 60,
  
  // Retry settings
  maxRequestRetries: 3,

  // Request handler
  async requestHandler({ request, page, enqueueLinks, log }) {
    log.info(`Processing ${request.url}`)

    // Wait for content to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      log.warning(`Network idle timeout for ${request.url}`)
    })

    // Get HTML content
    const html = await page.content()

    // Extract and save document
    const doc = extractContent(html, request.url)
    if (doc) {
      documents.push(doc)
      log.info(`Scraped ${request.url} - ${doc.title}`)
    }

    // Find and enqueue links
    await enqueueLinks({
      // Filter URLs
      strategy: 'all',
      transformRequestFunction: (req) => {
        if (!shouldCrawl(req.url)) {
          return false
        }
        return req
      },
    })
  },

  // Error handler
  failedRequestHandler({ request, log }, error) {
    log.error(`Request ${request.url} failed: ${error.message}`)
  },
})

// Run crawler
async function main() {
  console.log('Starting Harlingen website scraper...')
  console.log('Target: https://www.harlingentx.gov/')
  
  await crawler.run(['https://www.harlingentx.gov/'])

  console.log(`\nScraping complete!`)
  console.log(`Total documents scraped: ${documents.length}`)

  // Create output directory
  const outputDir = join(process.cwd(), 'data', 'raw')
  mkdirSync(outputDir, { recursive: true })

  // Save to JSON
  const outputPath = join(outputDir, 'documents.json')
  writeFileSync(outputPath, JSON.stringify(documents, null, 2))
  console.log(`Saved to: ${outputPath}`)

  // Print summary statistics
  console.log('\nSummary:')
  console.log(`- Total documents: ${documents.length}`)
  console.log(`- English documents: ${documents.filter(d => d.metadata.language === 'en').length}`)
  console.log(`- Spanish documents: ${documents.filter(d => d.metadata.language === 'es').length}`)
  
  const categories = documents.reduce((acc, doc) => {
    acc[doc.metadata.category] = (acc[doc.metadata.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log('\nBy category:')
  Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`)
    })
}

main().catch(console.error)
