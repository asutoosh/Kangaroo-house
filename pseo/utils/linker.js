/**
 * Internal linking engine for pSEO pages
 * Builds cross-playbook link suggestions
 */

class Linker {
  constructor() {
    this.pages = []; // {slug, title, playbook, url, keywords, location}
  }

  register(page) {
    this.pages.push({
      slug: page.slug,
      title: page.title,
      playbook: page.playbook,
      url: page.url,
      keywords: page.keywords || [],
      location: page.location || null,
      gender: page.gender || null,
      college: page.college || null
    });
  }

  /**
   * Find internal links for a given page
   * Rules:
   * - At least 2 sibling pages (same playbook)
   * - At least 2 cross-playbook pages
   * - Location affinity bonus
   * - Minimum 5 total links
   */
  getLinks(currentSlug, maxLinks = 8) {
    const current = this.pages.find(p => p.slug === currentSlug);
    if (!current) return [];

    const candidates = this.pages
      .filter(p => p.slug !== currentSlug)
      .map(p => {
        let score = 0;
        // Same playbook = sibling
        if (p.playbook === current.playbook) score += 2;
        // Same location affinity
        if (current.location && p.location === current.location) score += 3;
        // Same gender focus
        if (current.gender && p.gender === current.gender) score += 1;
        // Same college
        if (current.college && p.college === current.college) score += 2;
        // Cross-playbook bonus (ensures diversity)
        if (p.playbook !== current.playbook) score += 1;
        // Keyword overlap
        const overlap = p.keywords.filter(k =>
          current.keywords.some(ck => k.includes(ck) || ck.includes(k))
        ).length;
        score += overlap;
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score);

    // Ensure at least 2 siblings and 2 cross-playbook
    const siblings = candidates.filter(c => c.playbook === current.playbook).slice(0, 3);
    const crossPlaybook = candidates.filter(c => c.playbook !== current.playbook).slice(0, 3);
    const combined = [...siblings, ...crossPlaybook];

    // Fill remaining slots from top candidates
    const slugsUsed = new Set(combined.map(c => c.slug));
    for (const c of candidates) {
      if (combined.length >= maxLinks) break;
      if (!slugsUsed.has(c.slug)) {
        combined.push(c);
        slugsUsed.add(c.slug);
      }
    }

    return combined.slice(0, maxLinks).map(c => ({
      title: c.title,
      url: c.url,
      playbook: c.playbook
    }));
  }

  /** Static link to existing site pages */
  getStaticLinks() {
    return [
      { title: 'View All PG Listings', url: '/pages/pg/PG.html' },
      { title: 'About Kangaroo House', url: '/pages/about/about.html' },
      { title: 'Photo Gallery', url: '/pages/about/gallery.html' },
      { title: 'Read Our Blog', url: '/pages/blog/blog.html' },
      { title: 'Sanvi Girls PG', url: '/pages/pg/sanvi-girls-pg.html' },
      { title: 'Krishna Boys PG', url: '/pages/pg/krishna-boys-pg.html' },
      { title: 'Swami Vivekanand PG', url: '/pages/pg/swami-vivekanand-pg.html' },
      { title: 'Balaji PG', url: '/pages/pg/balaji-pg.html' },
      { title: 'Lakshmi Girls PG', url: '/pages/pg/lakshmi-girls-pg.html' }
    ];
  }
}

module.exports = Linker;
