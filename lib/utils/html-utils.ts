/**
 * HTML Content Utilities
 * 
 * Utility functions for cleaning and processing HTML content
 * from legacy Drupal systems that may contain escaped characters.
 */

/**
 * Cleans HTML content by removing literal escape sequences
 * that may be present in content from legacy systems.
 * 
 * @param html - The HTML string to clean
 * @returns Cleaned HTML string
 * 
 * @example
 * ```ts
 * const cleaned = cleanHtmlContent('Some text\\nwith\\tescapes')
 * // Returns: 'Some text\nwith escapes'
 * ```
 */
export function cleanHtmlContent(html: string): string {
  if (!html) return ''
  
  // Remove literal \r\n escape sequences
  let cleaned = html.replace(/\\r\\n/g, '\n')
  // Remove literal \n escape sequences
  cleaned = cleaned.replace(/\\n/g, '\n')
  // Remove literal \r escape sequences
  cleaned = cleaned.replace(/\\r/g, '')
  // Remove literal \t escape sequences
  cleaned = cleaned.replace(/\\t/g, ' ')
  // Remove literal backslashes before quotes
  cleaned = cleaned.replace(/\\"/g, '"')
  cleaned = cleaned.replace(/\\'/g, "'")
  
  return cleaned
}

/**
 * Sanitizes HTML content for safe rendering.
 * This is a basic sanitization - consider using a library like DOMPurify
 * for production use with untrusted content.
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  // First clean escape sequences
  let sanitized = cleanHtmlContent(html)
  
  // Additional sanitization can be added here
  // For now, we rely on React's built-in XSS protection via dangerouslySetInnerHTML
  
  return sanitized
}

/**
 * Strips legacy Drupal wrapper markup from article/activity/blog HTML.
 *
 * The Drupal CMS stored full page chrome inside the body field:
 * duplicate <h1>, social-share buttons, sidebar features, testimonial
 * blocks, calls-to-action, inline <script> tags, etc.
 *
 * This function extracts ONLY the article prose — the content that lives
 * inside `div.body > div.full` (preferred) or `div.body > div.teaser`.
 * If neither wrapper exists it falls back to regex-stripping known
 * legacy containers so the output is always clean paragraphs + images.
 */
export function stripLegacyHtml(html: string): string {
  if (!html) return ''

  let cleaned = cleanHtmlContent(html)

  // --- Strategy 1: extract the article content from Drupal wrappers ---
  // Prefer div.full (complete text) over div.teaser (truncated).
  const fullMatch = cleaned.match(/<div\s+class="full"[^>]*>([\s\S]*?)<\/div>\s*(?:<div\s+class="read-more|$)/i)
  if (fullMatch) {
    cleaned = fullMatch[1].trim()
  } else {
    const teaserMatch = cleaned.match(/<div\s+class="teaser"[^>]*>([\s\S]*?)<\/div>\s*(?:<div\s+class="full"|<\/div>\s*<\/div>\s*<\/div>)/i)
    if (teaserMatch) {
      cleaned = teaserMatch[1].trim()
    }
  }

  // --- Strategy 2: regex-strip any remaining legacy containers ---
  // Remove inline <script> tags entirely
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '')

  // Remove specific legacy wrapper divs and their content
  const stripPatterns = [
    /<h1\s+class="title"[^>]*>[\s\S]*?<\/h1>/gi,
    /<div\s+class="activity-type"[^>]*>[\s\S]*?<\/div>/gi,
    /<div\s+class="bed-bath"[^>]*>[\s\S]*?<\/div>/gi,
    /<div\s+class="amenities"[^>]*>[\s\S]*?<\/div>/gi,
    /<div\s+class="social-share[^"]*"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/gi,
    /<div\s+class="social-share[^"]*"[\s\S]*?<\/div>/gi,
    /<div\s+class="map-info[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi,
    /<div\s+class="favorites-form-wrapper[^"]*"[\s\S]*?<\/div>/gi,
    /<div\s+class="flag-wrapper[^"]*"[\s\S]*?<\/div>/gi,
    /<div\s+class="service-links[^"]*"[\s\S]*?<\/div>/gi,
    /<div\s+class="view\s+view-testimonials[^"]*"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
    /<div\s+class="view\s+view-calls-to-action[^"]*"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
    /<div\s+class="view\s+view-the-memories[^"]*"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
    /<div\s+class="view\s+view-specials[^"]*"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
    /<div\s+class="read-more-body[^"]*"[\s\S]*?<\/div>/gi,
    /<div\s+class="read-more"[^>]*>[\s\S]*?<\/div>/gi,
  ]

  for (const pattern of stripPatterns) {
    cleaned = cleaned.replace(pattern, '')
  }

  // Strip remaining Drupal structural wrappers (keep inner content)
  const unwrapPatterns = [
    /<div\s+class="cabin-bottom-left"[^>]*>/gi,
    /<div\s+class="cabin-content"[^>]*>/gi,
    /<div\s+class="body"[^>]*>/gi,
    /<div\s+class="teaser"[^>]*>/gi,
    /<div\s+class="full"[^>]*>/gi,
  ]

  for (const pattern of unwrapPatterns) {
    cleaned = cleaned.replace(pattern, '')
  }

  // Remove cabin-bottom-right (sidebar) and its content entirely
  cleaned = cleaned.replace(/<div\s+class="cabin-bottom-right"[\s\S]*?(?:<\/div>\s*){3,}/gi, '')
  // Remove cabin-bottom wrapper
  cleaned = cleaned.replace(/<div\s+class="cabin-bottom"[^>]*>/gi, '')
  // Remove column sidebar td
  cleaned = cleaned.replace(/<td\s+class="column sidebar"[\s\S]*?<\/td>/gi, '')

  // Clean up orphaned closing divs and empty tags
  cleaned = cleaned.replace(/<div\s+class="clearfix"[^>]*>\s*<\/div>/gi, '')
  cleaned = cleaned.replace(/<div\s+class="element-invisible"[^>]*>[\s\S]*?<\/div>/gi, '')

  // Remove legacy domain references
  cleaned = cleaned.replace(/https?:\/\/www\.cabin-rentals-of-georgia\.com/g, '')

  // Collapse excessive whitespace and empty lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()

  return cleaned
}

/**
 * Strips HTML tags from content, returning plain text.
 * Works in both browser and Node.js environments.
 * Handles named entities, numeric entities, and hex entities.
 * 
 * @param html - The HTML string to strip
 * @returns Plain text content with all HTML tags removed and entities decoded
 * 
 * @example
 * ```ts
 * const text = stripHtmlTags('<p>Hello &amp; welcome</p>')
 * // Returns: 'Hello & welcome'
 * ```
 */
export function stripHtmlTags(html: string): string {
  if (!html) return ''
  
  // Remove HTML tags first
  let text = html.replace(/<[^>]*>/g, '')
  
  // Decode common HTML entities
  const entityMap: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
  }
  
  // Replace named entities
  for (const [entity, char] of Object.entries(entityMap)) {
    text = text.replace(new RegExp(entity, 'gi'), char)
  }
  
  // Replace numeric entities (&#39;, &#8217;, etc.)
  text = text.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10))
  })
  
  // Replace hex entities (&#x27;, &#x2019;, etc.)
  text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}

