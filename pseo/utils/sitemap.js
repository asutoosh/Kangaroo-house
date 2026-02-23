/**
 * Sitemap generator for pSEO pages
 * Generates sitemap.xml including all existing + generated pages
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://kangaroohousing.in';

function generateSitemap(generatedPages, outputPath) {
  // Existing site pages (hardcoded)
  const existingPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/pages/pg/PG.html', priority: '0.9', changefreq: 'weekly' },
    { url: '/pages/pg/sanvi-girls-pg.html', priority: '0.9', changefreq: 'weekly' },
    { url: '/pages/pg/krishna-boys-pg.html', priority: '0.9', changefreq: 'weekly' },
    { url: '/pages/pg/swami-vivekanand-pg.html', priority: '0.85', changefreq: 'weekly' },
    { url: '/pages/pg/balaji-pg.html', priority: '0.85', changefreq: 'weekly' },
    { url: '/pages/pg/lakshmi-girls-pg.html', priority: '0.85', changefreq: 'weekly' },
    { url: '/pages/blog/blog.html', priority: '0.7', changefreq: 'weekly' },
    { url: '/pages/blog/our-facilities.html', priority: '0.7', changefreq: 'monthly' },
    { url: '/pages/about/about.html', priority: '0.6', changefreq: 'monthly' },
    { url: '/pages/about/gallery.html', priority: '0.5', changefreq: 'monthly' }
  ];

  // Priority mapping for pSEO playbooks
  const priorityMap = {
    location: '0.8',
    persona: '0.75',
    curation: '0.8',
    comparison: '0.7',
    glossary: '0.6',
    directory: '0.7'
  };

  const allPages = [
    ...existingPages,
    ...generatedPages.map(p => ({
      url: p.url,
      priority: priorityMap[p.playbook] || '0.6',
      changefreq: 'monthly'
    }))
  ];

  const today = new Date().toISOString().split('T')[0];
  const urls = allPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  fs.writeFileSync(outputPath, xml, 'utf-8');
  console.log(`✅ Sitemap generated: ${allPages.length} URLs → ${outputPath}`);
  return allPages.length;
}

module.exports = { generateSitemap };
