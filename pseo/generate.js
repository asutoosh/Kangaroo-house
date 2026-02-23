#!/usr/bin/env node
/**
 * Kangaroo House — Programmatic SEO Page Generator
 *
 * Reads structured data from pseo/data/ and generates
 * fully rendered static HTML pages to pages/seo/
 *
 * Usage:  node pseo/generate.js
 *         node pseo/generate.js --validate  (dry run)
 */

const fs = require('fs');
const path = require('path');
const { toSlug, buildUrl, buildFilePath } = require('./utils/slug');
const { validatePage, resetValidation, getStats } = require('./utils/validator');
const Linker = require('./utils/linker');
const { generateSitemap } = require('./utils/sitemap');

// --- Config ---
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_DIR = path.join(ROOT, 'pages', 'seo');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const DRY_RUN = process.argv.includes('--validate');

// --- Load Data ---
function loadJSON(name) {
  const filepath = path.join(DATA_DIR, name);
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

const locations = loadJSON('locations.json');
const personas = loadJSON('personas.json');
const glossary = loadJSON('glossary.json');
const comparisons = loadJSON('comparisons.json');
const curations = loadJSON('curations.json');
const colleges = loadJSON('colleges.json');
const amenities = loadJSON('amenities.json');

// --- Create linker ---
const linker = new Linker();

// --- Shared HTML ---
function baseHead(title, metaDesc, canonical) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-53TS9Z6V');</script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-GR0KJ734K7"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-GR0KJ734K7');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escHtml(metaDesc)}">
    <link rel="canonical" href="https://kangaroohousing.in${canonical}">
    <title>${escHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/pages/seo/seo-pages.css">
</head>`;
}

function headerNav() {
  return `
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-53TS9Z6V" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <header class="header" id="header">
    <div class="header-container">
      <div class="logo"><a href="/" style="display:flex;align-items:center;gap:.75rem;text-decoration:none;color:inherit;"><span class="logo-icon">🦘</span><span class="logo-text">KANGAROO HOUSE</span></a></div>
      <nav class="nav">
        <ul class="nav-menu">
          <li><a href="/">HOME</a></li>
          <li><a href="/pages/pg/PG.html">PG</a></li>
          <li><a href="/pages/blog/blog.html">BLOG</a></li>
          <li><a href="/#services">SERVICES</a></li>
          <li><a href="/pages/about/gallery.html">GALLERY</a></li>
          <li><a href="/#reviews">REVIEWS</a></li>
          <li><a href="/#contact">CONTACT</a></li>
        </ul>
      </nav>
      <button class="nav-toggle" id="navToggle"><span></span><span></span><span></span></button>
    </div>
  </header>`;
}

function footerHtml() {
  return `
  <footer class="seo-footer">
    <div class="footer-inner">
      <p>&copy; ${new Date().getFullYear()} Kangaroo House. All rights reserved.</p>
      <nav class="footer-links">
        <a href="/">Home</a>
        <a href="/pages/pg/PG.html">PG Listings</a>
        <a href="/pages/blog/blog.html">Blog</a>
        <a href="/pages/about/about.html">About Us</a>
      </nav>
    </div>
  </footer>
  <script>
    const nt=document.getElementById('navToggle'),nm=document.querySelector('.nav-menu');
    if(nt&&nm){nt.addEventListener('click',()=>{nm.classList.toggle('active');nt.classList.toggle('active');});}
  </script>
</body>
</html>`;
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function internalLinksHtml(links) {
  if (!links || links.length === 0) return '';
  return `
    <section class="related-pages">
      <h2>Related Pages You Might Like</h2>
      <div class="related-grid">
        ${links.map(l => `<a href="${l.url}" class="related-card">
          <span class="related-tag">${l.playbook || 'Guide'}</span>
          <span class="related-title">${escHtml(l.title)}</span>
        </a>`).join('\n        ')}
      </div>
    </section>`;
}

function ctaBlock() {
  return `
    <section class="cta-block">
      <h2>Ready to Find Your Perfect PG?</h2>
      <p>Browse fully furnished PG rooms near Ashok Nagar, Vasundhara Enclave &amp; Maharaja Agrasen College.</p>
      <a href="/pages/pg/PG.html" class="btn-primary">View All PGs →</a>
    </section>`;
}

function breadcrumbs(items) {
  const bc = items.map((item, i) => {
    if (i === items.length - 1) return `<span class="bc-current">${escHtml(item.name)}</span>`;
    return `<a href="${item.url}">${escHtml(item.name)}</a>`;
  }).join(' <span class="bc-sep">/</span> ');
  return `<nav class="breadcrumbs" aria-label="breadcrumb">${bc}</nav>`;
}

function schemaJSON(schema) {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}


// ===================================================================
// PLAYBOOK GENERATORS
// ===================================================================

function generateLocationPages() {
  const pages = [];
  for (const loc of locations) {
    const slug = `pg-near-${loc.id}`;
    const url = buildUrl('location', slug);
    const title = `PG near ${loc.name}, ${loc.city} | Kangaroo House`;
    const metaDesc = `Find the best PG accommodation near ${loc.name}, ${loc.city}. Fully furnished rooms with meals, WiFi, security. Starting ₹7,500/month. Visit Kangaroo House.`;
    const primaryKeyword = `PG near ${loc.name}`;

    const recommendedPgs = (loc.recommended_pgs || []).map(pid => {
      const pgMap = {
        'sanvi-girls-pg': { name: 'Sanvi Girls PG', gender: 'Girls', price: '₹16,899', url: '/pages/pg/sanvi-girls-pg.html' },
        'krishna-boys-pg': { name: 'Krishna Boys PG', gender: 'Boys', price: '₹16,299', url: '/pages/pg/krishna-boys-pg.html' },
        'swami-vivekanand-pg': { name: 'Swami Vivekanand PG', gender: 'Co-ed', price: '₹17,500', url: '/pages/pg/swami-vivekanand-pg.html' },
        'balaji-pg': { name: 'Balaji PG', gender: 'Boys', price: '₹15,999', url: '/pages/pg/balaji-pg.html' },
        'lakshmi-girls-pg': { name: 'Lakshmi Girls PG', gender: 'Girls', price: '₹16,499', url: '/pages/pg/lakshmi-girls-pg.html' }
      };
      return pgMap[pid] || null;
    }).filter(Boolean);

    const pgCards = recommendedPgs.map(pg => `
            <div class="pg-listing-card">
              <h3><a href="${pg.url}">${escHtml(pg.name)}</a></h3>
              <div class="pg-meta"><span class="tag">${pg.gender}</span> <span class="price">From ${pg.price}/mo</span></div>
              <p>Fully furnished rooms with 4 meals/day, WiFi, laundry, and 24/7 security near ${escHtml(loc.name)}.</p>
              <a href="${pg.url}" class="btn-sm">View Details →</a>
            </div>`).join('\n');

    const nearbyColleges = (loc.nearby_colleges || []).map(cid => {
      const c = colleges.find(col => col.id === cid);
      return c ? `<li><strong>${escHtml(c.name)}</strong> — ${escHtml(c.type)} (${escHtml(c.programs.slice(0,3).join(', '))})</li>` : '';
    }).filter(Boolean).join('\n                ');

    const transportList = (loc.transport || []).map(t => `<li>${escHtml(t)}</li>`).join('\n                ');
    const highlightsList = (loc.highlights || []).map(h => `<li>${escHtml(h)}</li>`).join('\n                ');

    const htmlContent = `${baseHead(title, metaDesc, url)}
${headerNav()}
  <main class="seo-container">
    ${breadcrumbs([{name:'Home',url:'/'},{name:'PG Listings',url:'/pages/pg/PG.html'},{name:`PG near ${loc.name}`,url}])}
    <article class="seo-article">
      <h1>Best PG Accommodation near ${escHtml(loc.name)}, ${escHtml(loc.city)}</h1>
      <div class="meta-bar">
        <span class="meta-item">📍 ${escHtml(loc.name)}, ${escHtml(loc.city)}</span>
        <span class="meta-item">💰 ${escHtml(loc.avg_rent_range)}</span>
        <span class="meta-item">🏠 ${recommendedPgs.length} PGs Available</span>
      </div>

      <section class="content-section">
        <h2>About ${escHtml(loc.name)}</h2>
        <p>${escHtml(loc.description)}</p>
        <h3>Why Choose ${escHtml(loc.name)} for PG?</h3>
        <ul>${highlightsList}</ul>
      </section>

      <section class="content-section">
        <h2>Best PGs near ${escHtml(loc.name)}</h2>
        <p>Here are the top-rated PG accommodations near ${escHtml(loc.name)}, handpicked based on room quality, meals, safety, and value for money.</p>
        <div class="pg-listings">${pgCards}</div>
      </section>

      ${nearbyColleges ? `<section class="content-section">
        <h2>Colleges & Institutions near ${escHtml(loc.name)}</h2>
        <p>Students attending these institutions frequently choose PGs in the ${escHtml(loc.name)} area:</p>
        <ul>${nearbyColleges}</ul>
      </section>` : ''}

      <section class="content-section">
        <h2>Transport & Connectivity</h2>
        <p><strong>Nearest Metro:</strong> ${escHtml(loc.nearby_metro)}</p>
        <ul>${transportList}</ul>
      </section>

      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          <div class="faq-item"><h3>How much does a PG cost near ${escHtml(loc.name)}?</h3><p>PG rents near ${escHtml(loc.name)} range from ${escHtml(loc.avg_rent_range)} per month depending on room type, amenities, and whether meals are included. Kangaroo House offers all-inclusive packages with meals, WiFi, and housekeeping.</p></div>
          <div class="faq-item"><h3>Is ${escHtml(loc.name)} safe for PG residents?</h3><p>Yes, ${escHtml(loc.name)} is a well-established residential area with good police presence and community safety. All Kangaroo House PGs add extra security with 24/7 CCTV surveillance and security guards.</p></div>
          <div class="faq-item"><h3>How to reach ${escHtml(loc.name)} by metro?</h3><p>The nearest metro station is ${escHtml(loc.nearby_metro)} on the Blue Line. The area is also well-connected by DTC buses and auto-rickshaws.</p></div>
          <div class="faq-item"><h3>Are there girls-only PGs near ${escHtml(loc.name)}?</h3><p>Yes, Kangaroo House operates dedicated girls-only PGs near ${escHtml(loc.name)} with female staff, strict visitor policies, and enhanced security measures. Check Sanvi Girls PG and Lakshmi Girls PG.</p></div>
        </div>
      </section>

      {{INTERNAL_LINKS}}
      ${ctaBlock()}
    </article>
  </main>

  ${schemaJSON({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {"@type":"Question","name":`How much does a PG cost near ${loc.name}?`,"acceptedAnswer":{"@type":"Answer","text":`PG rents near ${loc.name} range from ${loc.avg_rent_range} per month.`}},
      {"@type":"Question","name":`Is ${loc.name} safe for PG residents?`,"acceptedAnswer":{"@type":"Answer","text":`Yes, ${loc.name} is a well-established residential area with good safety.`}},
      {"@type":"Question","name":`How to reach ${loc.name} by metro?`,"acceptedAnswer":{"@type":"Answer","text":`Nearest metro: ${loc.nearby_metro} on the Blue Line.`}}
    ]
  })}
${footerHtml()}`;

    pages.push({
      slug, url, title, metaDescription: metaDesc, h1: `Best PG near ${loc.name}`,
      primaryKeyword, playbook: 'location', location: loc.id,
      keywords: [`PG near ${loc.name}`, `hostel ${loc.name}`, `PG ${loc.city}`],
      htmlContent, filePath: buildFilePath('location', slug)
    });
  }
  return pages;
}


function generatePersonaPages() {
  const pages = [];
  for (const p of personas) {
    const slug = p.slug;
    const url = buildUrl('persona', slug);
    const metaDesc = `${p.title} — ${p.description.slice(0, 130)}...`;

    const painHtml = p.pain_points.map(pp => `<li>${escHtml(pp)}</li>`).join('\n                ');
    const solHtml = p.solutions.map(s => `<li>${escHtml(s)}</li>`).join('\n                ');
    const benHtml = p.benefits.map(b => `<li>${escHtml(b)}</li>`).join('\n                ');

    const htmlContent = `${baseHead(`${p.title} | Kangaroo House`, metaDesc, url)}
${headerNav()}
  <main class="seo-container">
    ${breadcrumbs([{name:'Home',url:'/'},{name:'PG Listings',url:'/pages/pg/PG.html'},{name:p.name,url}])}
    <article class="seo-article">
      <h1>${escHtml(p.title)}</h1>
      <div class="meta-bar"><span class="meta-item">👤 For: ${escHtml(p.name)}</span>${p.gender!=='all'?`<span class="meta-item">🏷️ ${p.gender==='female'?'Girls Only':'Boys Only'}</span>`:''}</div>

      <section class="content-section">
        <h2>Why ${escHtml(p.name)} Need the Right PG</h2>
        <p>${escHtml(p.description)}</p>
      </section>

      <section class="content-section">
        <h2>Common Challenges for ${escHtml(p.name)}</h2>
        <ul class="icon-list challenge-list">${painHtml}</ul>
      </section>

      <section class="content-section">
        <h2>How Kangaroo House Solves These Problems</h2>
        <ul class="icon-list solution-list">${solHtml}</ul>
      </section>

      <section class="content-section">
        <h2>Benefits of Choosing Kangaroo House</h2>
        <ul class="icon-list benefit-list">${benHtml}</ul>
      </section>

      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          <div class="faq-item"><h3>What is the best PG for ${escHtml(p.name.toLowerCase())} in Delhi?</h3><p>Kangaroo House offers some of the best PG options for ${escHtml(p.name.toLowerCase())} near Ashok Nagar and Vasundhara Enclave, Delhi. Our PGs include furnished rooms, 4 meals/day, WiFi, and 24/7 security.</p></div>
          <div class="faq-item"><h3>How much does a PG cost for ${escHtml(p.name.toLowerCase())}?</h3><p>PG prices for ${escHtml(p.name.toLowerCase())} at Kangaroo House start from ₹7,500/month for sharing rooms and go up to ₹25,000/month for single AC rooms, all inclusive of meals and services.</p></div>
          <div class="faq-item"><h3>Is Kangaroo House PG safe for ${escHtml(p.name.toLowerCase())}?</h3><p>Absolutely. All our PGs feature 24/7 CCTV surveillance, security guards, fire safety equipment, and verified management. We also have dedicated girls-only PGs with female staff.</p></div>
        </div>
      </section>

      {{INTERNAL_LINKS}}
      ${ctaBlock()}
    </article>
  </main>
${footerHtml()}`;

    pages.push({
      slug, url, title: `${p.title} | Kangaroo House`, metaDescription: metaDesc,
      h1: p.title, primaryKeyword: p.keywords[0], playbook: 'persona',
      gender: p.gender, keywords: p.keywords,
      htmlContent, filePath: buildFilePath('persona', slug)
    });
  }
  return pages;
}


function generateGlossaryPages() {
  const pages = [];
  for (const g of glossary) {
    const slug = g.slug;
    const url = buildUrl('glossary', slug);
    const title = `${g.term}: Meaning & Complete Guide | Kangaroo House`;
    const metaDesc = g.short_definition.slice(0, 155);

    const keyPointsHtml = g.key_points.map(k => `<li>${escHtml(k)}</li>`).join('\n                ');
    const faqHtml = g.faq.map(f => `
          <div class="faq-item"><h3>${escHtml(f.q)}</h3><p>${escHtml(f.a)}</p></div>`).join('');

    const relatedHtml = g.related_terms.map(rt => {
      const related = glossary.find(x => x.id === rt);
      if (!related) return '';
      return `<a href="/pages/seo/glossary/${related.slug}.html" class="related-term-chip">${escHtml(related.term)}</a>`;
    }).filter(Boolean).join('\n            ');

    const htmlContent = `${baseHead(title, metaDesc, url)}
${headerNav()}
  <main class="seo-container">
    ${breadcrumbs([{name:'Home',url:'/'},{name:'Glossary',url:'/pages/seo/glossary/what-is-a-paying-guest.html'},{name:g.term,url}])}
    <article class="seo-article glossary-article">
      <h1>${escHtml(g.term)}</h1>
      <div class="glossary-short-def"><p><strong>Definition:</strong> ${escHtml(g.short_definition)}</p></div>

      <section class="content-section">
        <h2>Detailed Explanation</h2>
        <p>${escHtml(g.detailed_explanation)}</p>
      </section>

      <section class="content-section">
        <h2>Key Points to Know</h2>
        <ul class="icon-list">${keyPointsHtml}</ul>
      </section>

      <section class="content-section">
        <h2>Related Terms</h2>
        <div class="related-terms-bar">${relatedHtml}</div>
      </section>

      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">${faqHtml}</div>
      </section>

      {{INTERNAL_LINKS}}
      ${ctaBlock()}
    </article>
  </main>

  ${schemaJSON({
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": g.term,
    "description": g.short_definition,
    "inDefinedTermSet": "https://kangaroohousing.in/pages/seo/glossary/what-is-a-paying-guest.html"
  })}
${footerHtml()}`;

    pages.push({
      slug, url, title, metaDescription: metaDesc, h1: g.term,
      primaryKeyword: `what is ${g.term.toLowerCase()}`, playbook: 'glossary',
      keywords: [g.term.toLowerCase(), `${g.term.toLowerCase()} meaning`, `${g.term.toLowerCase()} in PG`],
      htmlContent, filePath: buildFilePath('glossary', slug)
    });
  }
  return pages;
}


function generateComparisonPages() {
  const pages = [];
  for (const c of comparisons) {
    const slug = c.slug;
    const url = buildUrl('comparison', slug);
    const title = `${c.title} | Kangaroo House`;
    const metaDesc = `${c.introduction.slice(0, 150)}...`;

    const featureRows = c.features.map(f => {
      const winClass = f.winner === 'a' ? 'winner-a' : f.winner === 'b' ? 'winner-b' : '';
      return `<tr class="${winClass}"><td>${escHtml(f.feature)}</td><td>${escHtml(f.a)}</td><td>${escHtml(f.b)}</td></tr>`;
    }).join('\n              ');

    const htmlContent = `${baseHead(title, metaDesc, url)}
${headerNav()}
  <main class="seo-container">
    ${breadcrumbs([{name:'Home',url:'/'},{name:'Comparisons',url:'#'},{name:c.title,url}])}
    <article class="seo-article">
      <h1>${escHtml(c.title)}</h1>

      <section class="content-section">
        <p>${escHtml(c.introduction)}</p>
      </section>

      <section class="content-section">
        <h2>Feature Comparison: ${escHtml(c.entity_a.name)} vs ${escHtml(c.entity_b.name)}</h2>
        <div class="comparison-table-wrapper">
          <table class="comparison-table">
            <thead><tr><th>Feature</th><th>${escHtml(c.entity_a.name)}</th><th>${escHtml(c.entity_b.name)}</th></tr></thead>
            <tbody>${featureRows}</tbody>
          </table>
        </div>
      </section>

      <section class="content-section verdict-section">
        <h2>Our Verdict</h2>
        <p>${escHtml(c.verdict)}</p>
        <div class="verdict-cards">
          <div class="verdict-card"><h3>Best For — ${escHtml(c.entity_a.name)}</h3><p>${escHtml(c.best_for_a)}</p></div>
          <div class="verdict-card"><h3>Best For — ${escHtml(c.entity_b.name)}</h3><p>${escHtml(c.best_for_b)}</p></div>
        </div>
      </section>

      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          <div class="faq-item"><h3>Which is better for students — ${escHtml(c.entity_a.name)} or ${escHtml(c.entity_b.name)}?</h3><p>${escHtml(c.verdict)}</p></div>
          <div class="faq-item"><h3>Which is cheaper — ${escHtml(c.entity_a.name)} or ${escHtml(c.entity_b.name)}?</h3><p>It depends on what's included. While ${escHtml(c.entity_b.name)} may have lower base rent, ${escHtml(c.entity_a.name)} often includes meals, WiFi, and services, making the total cost comparable or even lower.</p></div>
          <div class="faq-item"><h3>What does Kangaroo House recommend?</h3><p>Kangaroo House PGs combine the best of both worlds — the comfort and personal touch of a home-like PG with professional management and modern amenities.</p></div>
        </div>
      </section>

      {{INTERNAL_LINKS}}
      ${ctaBlock()}
    </article>
  </main>
${footerHtml()}`;

    pages.push({
      slug, url, title, metaDescription: metaDesc,
      h1: c.title, primaryKeyword: c.keywords[0], playbook: 'comparison',
      keywords: c.keywords,
      htmlContent, filePath: buildFilePath('comparison', slug)
    });
  }
  return pages;
}


function generateCurationPages() {
  const pages = [];
  for (const cur of curations) {
    const slug = cur.slug;
    const url = buildUrl('curation', slug);
    const title = `${cur.title} | Kangaroo House`;
    const loc = cur.location ? locations.find(l => l.id === cur.location) : null;
    const metaDesc = `Discover the ${cur.title.toLowerCase()}. Ranked by ${cur.ranking_factors.slice(0,3).join(', ')}. Verified listings with photos and reviews.`;

    const rankingHtml = cur.ranking_factors.map((r, i) => `<li><strong>${i+1}.</strong> ${escHtml(r)}</li>`).join('\n                ');

    const pgMap = {
      'sanvi-girls-pg': {name:'Sanvi Girls PG',gender:'Girls',price:'₹16,899',url:'/pages/pg/sanvi-girls-pg.html',amenities:['AC','WiFi','Meals','CCTV','Laundry']},
      'krishna-boys-pg': {name:'Krishna Boys PG',gender:'Boys',price:'₹16,299',url:'/pages/pg/krishna-boys-pg.html',amenities:['AC','WiFi','Meals','CCTV','Parking']},
      'swami-vivekanand-pg': {name:'Swami Vivekanand PG',gender:'Co-ed',price:'₹17,500',url:'/pages/pg/swami-vivekanand-pg.html',amenities:['AC','WiFi','Meals','CCTV','Smart TV']},
      'balaji-pg': {name:'Balaji PG',gender:'Boys',price:'₹15,999',url:'/pages/pg/balaji-pg.html',amenities:['AC','WiFi','Meals','CCTV','Study Desk']},
      'lakshmi-girls-pg': {name:'Lakshmi Girls PG',gender:'Girls',price:'₹16,499',url:'/pages/pg/lakshmi-girls-pg.html',amenities:['AC','WiFi','Meals','CCTV','Laundry']}
    };

    const listingsHtml = (cur.pgs || []).map((pid, idx) => {
      const pg = pgMap[pid];
      if (!pg) return '';
      return `
            <div class="curation-card">
              <div class="curation-rank">#${idx+1}</div>
              <h3><a href="${pg.url}">${escHtml(pg.name)}</a></h3>
              <div class="pg-meta"><span class="tag">${pg.gender}</span> <span class="price">From ${pg.price}/mo</span></div>
              <div class="amenity-tags">${pg.amenities.map(a=>`<span class="amenity-tag">${escHtml(a)}</span>`).join(' ')}</div>
              <a href="${pg.url}" class="btn-sm">View Details →</a>
            </div>`;
    }).filter(Boolean).join('\n');

    const htmlContent = `${baseHead(title, metaDesc, url)}
${headerNav()}
  <main class="seo-container">
    ${breadcrumbs([{name:'Home',url:'/'},{name:'Best PGs',url:'/pages/pg/PG.html'},{name:cur.title,url}])}
    <article class="seo-article">
      <h1>${escHtml(cur.title)}</h1>
      ${loc?`<div class="meta-bar"><span class="meta-item">📍 ${escHtml(loc.name)}, ${escHtml(loc.city)}</span></div>`:``}

      <section class="content-section">
        <h2>How We Ranked These PGs</h2>
        <p>Our rankings are based on real resident feedback, facility inspections, and the following criteria:</p>
        <ol class="ranking-criteria">${rankingHtml}</ol>
      </section>

      <section class="content-section">
        <h2>Top PG Picks</h2>
        <div class="curation-listings">${listingsHtml}</div>
      </section>

      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          <div class="faq-item"><h3>How were these PGs selected?</h3><p>Each PG was evaluated based on ${cur.ranking_factors.slice(0,3).join(', ')}, and verified through physical inspections and resident reviews.</p></div>
          <div class="faq-item"><h3>Are these PGs verified?</h3><p>Yes, all PGs listed here are operated by Kangaroo House and are physically verified with documented amenities and transparent pricing.</p></div>
          <div class="faq-item"><h3>Can I visit before booking?</h3><p>Absolutely! We encourage visiting our PGs before making a decision. Schedule a visit through our website or call us directly.</p></div>
        </div>
      </section>

      {{INTERNAL_LINKS}}
      ${ctaBlock()}
    </article>
  </main>
${footerHtml()}`;

    pages.push({
      slug, url, title, metaDescription: metaDesc,
      h1: cur.title, primaryKeyword: cur.title.toLowerCase(), playbook: 'curation',
      location: cur.location, keywords: [cur.title.toLowerCase()],
      htmlContent, filePath: buildFilePath('curation', slug)
    });
  }
  return pages;
}


// ===================================================================
// MAIN GENERATOR
// ===================================================================
function main() {
  console.log('🦘 Kangaroo House pSEO Generator\n');
  resetValidation();

  // Generate all pages
  const allPages = [
    ...generateLocationPages(),
    ...generatePersonaPages(),
    ...generateGlossaryPages(),
    ...generateComparisonPages(),
    ...generateCurationPages()
  ];

  console.log(`📄 Generated ${allPages.length} pages total\n`);

  // Register all pages with linker
  allPages.forEach(p => linker.register(p));

  // Resolve internal links
  allPages.forEach(p => {
    p.internalLinks = linker.getLinks(p.slug);
    const linksHtml = internalLinksHtml(p.internalLinks);
    p.htmlContent = p.htmlContent.replace('{{INTERNAL_LINKS}}', linksHtml);
  });

  // Validate all pages
  let validCount = 0;
  let invalidCount = 0;
  const errors = [];

  for (const page of allPages) {
    const result = validatePage(page);
    if (result.valid) {
      validCount++;
    } else {
      invalidCount++;
      errors.push({ slug: result.slug, errors: result.errors });
      console.warn(`⚠️  Validation warning: ${result.slug} → ${result.errors.join(', ')}`);
    }
  }

  console.log(`\n✅ Valid: ${validCount}  ⚠️ Warnings: ${invalidCount}`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN — no files written.');
    console.log(getStats());
    if (errors.length) {
      console.log('\nValidation Issues:');
      errors.forEach(e => console.log(`  ${e.slug}: ${e.errors.join(', ')}`));
    }
    return;
  }

  // Write files
  // Ensure output directories exist
  const dirs = [
    OUTPUT_DIR,
    path.join(OUTPUT_DIR, 'glossary'),
    path.join(OUTPUT_DIR, 'directory')
  ];
  dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  let written = 0;
  for (const page of allPages) {
    const outPath = path.join(OUTPUT_DIR, page.filePath);
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, page.htmlContent, 'utf-8');
    written++;
  }
  console.log(`\n📝 Written ${written} HTML files to ${OUTPUT_DIR}`);

  // Generate sitemap
  const sitemapCount = generateSitemap(allPages, SITEMAP_PATH);
  console.log(`\n🗺️  Sitemap updated with ${sitemapCount} total URLs`);

  // Summary JSON output
  const summary = allPages.map(p => ({
    url: p.url,
    playbook: p.playbook,
    title: p.title,
    primaryKeyword: p.primaryKeyword,
    internalLinks: (p.internalLinks || []).length
  }));
  fs.writeFileSync(
    path.join(__dirname, 'generated-pages-manifest.json'),
    JSON.stringify(summary, null, 2), 'utf-8'
  );
  console.log('📋 Manifest saved to pseo/generated-pages-manifest.json');

  console.log('\n✨ pSEO generation complete!');
}

main();
