/**
 * Page validation utilities for pSEO generator
 * Ensures no thin, duplicate, or broken pages are generated
 */

const seenSlugs = new Set();
const seenTitles = new Set();
const seenKeywords = new Set();

function resetValidation() {
  seenSlugs.clear();
  seenTitles.clear();
  seenKeywords.clear();
}

function validatePage(page) {
  const errors = [];

  // 1. Unique slug
  if (seenSlugs.has(page.slug)) {
    errors.push(`Duplicate slug: ${page.slug}`);
  }
  seenSlugs.add(page.slug);

  // 2. Unique title
  if (seenTitles.has(page.title)) {
    errors.push(`Duplicate title: ${page.title}`);
  }
  seenTitles.add(page.title);

  // 3. Unique primary keyword
  if (page.primaryKeyword && seenKeywords.has(page.primaryKeyword)) {
    errors.push(`Duplicate primary keyword: ${page.primaryKeyword}`);
  }
  if (page.primaryKeyword) seenKeywords.add(page.primaryKeyword);

  // 4. Content length check
  const contentLength = (page.htmlContent || '').length;
  const minLength = page.playbook === 'glossary' ? 3000 : 5000;
  if (contentLength < minLength) {
    errors.push(`Content too short: ${contentLength} chars (min ${minLength})`);
  }

  // 5. Required fields
  if (!page.title) errors.push('Missing title');
  if (!page.metaDescription) errors.push('Missing meta description');
  if (!page.h1) errors.push('Missing H1');
  if (!page.slug) errors.push('Missing slug');

  // 6. Internal links minimum
  if (!page.internalLinks || page.internalLinks.length < 3) {
    errors.push(`Insufficient internal links: ${(page.internalLinks || []).length} (min 3)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    slug: page.slug
  };
}

function getStats() {
  return {
    totalSlugs: seenSlugs.size,
    totalTitles: seenTitles.size,
    totalKeywords: seenKeywords.size
  };
}

module.exports = { validatePage, resetValidation, getStats };
