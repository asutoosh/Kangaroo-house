/**
 * Slug & URL utilities for pSEO generator
 */
function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildUrl(playbook, slug) {
  const base = '/pages/seo';
  const map = {
    location: `${base}/${slug}.html`,
    persona: `${base}/${slug}.html`,
    curation: `${base}/${slug}.html`,
    comparison: `${base}/${slug}.html`,
    glossary: `${base}/glossary/${slug}.html`,
    directory: `${base}/directory/${slug}.html`
  };
  return map[playbook] || `${base}/${slug}.html`;
}

function buildFilePath(playbook, slug) {
  const map = {
    glossary: `glossary/${slug}.html`,
    directory: `directory/${slug}.html`
  };
  return map[playbook] || `${slug}.html`;
}

module.exports = { toSlug, buildUrl, buildFilePath };
