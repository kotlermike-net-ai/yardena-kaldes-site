// Static page generator. No dependencies. Run: node build.mjs
// Reads content/*.json, writes index.html, privacy.html, accessibility.html, thanks.html,
// robots.txt, sitemap.xml. Generated files are committed so GitHub Pages works without a build.
import fs from 'node:fs';
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const site = read('content/site.json');
// Isolate Latin runs so mixed Hebrew/English text keeps a stable visual order.
const LATIN = /([A-Za-z][A-Za-z0-9.&'’-]*(?: [A-Za-z0-9.&'’-]+)*)/;
const txt = (s) => String(s).split(LATIN).map((part, i) => (i % 2 ? '<bdi dir="ltr">' + esc(part) + '</bdi>' : esc(part))).join('');
const ROBOTS = '<meta name="robots" content="noindex, nofollow">\n';

function head(c, { title, desc, canonicalPath, prefix, draft, forceNoindex }) {
  const url = site.siteUrl + canonicalPath;
  const noindex = site.noindex || forceNoindex;
  return `<!DOCTYPE html>
<html lang="${c.lang}" dir="${c.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? ROBOTS : ''}<link rel="canonical" href="${url}">
<meta name="google-site-verification" content="${site.googleSiteVerification}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${esc(c.meta.siteName)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${c.meta.ogLocale}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${prefix}favicon.ico" sizes="32x32 48x48">
<link rel="icon" href="${prefix}assets/favicon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="${prefix}assets/apple-touch-icon.png">
<link rel="preload" href="${prefix}fonts/heebo-hebrew-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${prefix}css/fonts.css">
<link rel="stylesheet" href="${prefix}css/style.css">
${draft ? '<!-- DRAFT: legal text pending review by a lawyer. Not shown on the live page. -->\n' : ''}</head>`;
}

function header(c, prefix, home) {
  const links = c.nav.map((n) => `<li><a href="${home ? '' : prefix + 'index.html'}${n.href}">${esc(n.label)}</a></li>`).join('');
  return `<a class="skip-link" href="#main">${esc(c.ui.skip)}</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${home ? '#home' : prefix + 'index.html'}">${esc(c.hero.name.split(',')[0])}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-open="${esc(c.ui.menuOpen)}" data-close="${esc(c.ui.menuClose)}"><span class="menu-bars" aria-hidden="true"></span><span class="visually-hidden">${esc(c.ui.menuOpen)}</span></button>
    <nav id="site-nav" class="site-nav" aria-label="${esc(c.ui.navLabel)}"><ul>${links}</ul></nav>
  </div>
</header>`;
}

function footer(c, prefix) {
  return `<footer class="site-footer"><div class="wrap">
  <nav aria-label="${esc(c.ui.footerLabel)}"><a href="${prefix}privacy.html">${esc(c.ui.footerPrivacy)}</a> <a href="${prefix}accessibility.html">${esc(c.ui.footerAccessibility)}</a></nav>
</div></footer>
<!-- Accessibility widget (third-party, supplements the accessible build and does not replace it). Licence account is currently the site builder's, to be moved to the client. -->
<script src="https://cdn.enable.co.il/licenses/enable-L7759c07xz526q-1017-84226/init.js"></script>
<script src="${prefix}js/main.js" defer></script>
</body>
</html>
`;
}

function homePage(c) {
  const p = '';
  const person = site.person;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Psychotherapist', name: person.name, jobTitle: person.jobTitle,
    telephone: person.telephone, email: person.email, url: site.siteUrl + '/',
    address: { '@type': 'PostalAddress', addressLocality: person.city, addressCountry: person.country }
  };
  const hero = c.hero;
  const contactDl = hero.contact.map((x) => `<div><dt>${esc(x.label)}</dt><dd>${x.href ? `<a href="${x.href}">${esc(x.value)}</a>` : esc(x.value)}</dd></div>`).join('');
  const t = c.intro, s = c.specialties, e = c.education, k = c.contact, f = k.form;
  const eduSections = e.sections.map((sec) => {
    const body = sec.paragraphs ? sec.paragraphs.map((x) => `<p>${txt(x)}</p>`).join('') : '';
    const list = sec.items ? `<ol class="timeline">${sec.items.map((i) => `<li><span class="when">${i.ltr ? `<bdi dir="ltr">${esc(i.when)}</bdi>` : esc(i.when)}</span><span class="what">${txt(i.text)}</span></li>`).join('')}</ol>` : '';
    return `<div class="edu-block reveal"><h3>${txt(sec.heading)}</h3>${body}${list}</div>`;
  }).join('\n      ');
  const headHtml = head(c, { title: c.meta.title, desc: c.meta.description, canonicalPath: '/', prefix: p })
    .replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n</head>`);
  return headHtml + `
<body>
${header(c, p, true)}
<main id="main">
  <section id="home" class="hero" aria-labelledby="hero-title">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="wrap hero-inner">
      <div class="hero-card">
        <img class="hero-logo" src="assets/logo.webp" alt="${esc(c.ui.logoAlt)}" width="360" height="287">
        <h1 id="hero-title">${esc(hero.name)}</h1>
        <p class="hero-sub">${esc(hero.title)}</p>
        <dl class="contact-list">${contactDl}</dl>
      </div>
      <figure class="hero-portrait">
        <span class="portrait-disc" aria-hidden="true"></span>
        <span class="portrait-ring" aria-hidden="true"></span>
        <img class="hero-photo" src="assets/profile.webp" alt="${esc(c.ui.photoAlt)}" width="720" height="970" fetchpriority="high">
      </figure>
    </div>
  </section>

  <section id="about" class="intro" aria-labelledby="about-title">
    <div class="wrap narrow reveal">
      <h2 id="about-title">${esc(t.heading)}</h2>
      ${t.paragraphs.map((x) => `<p>${txt(x)}</p>`).join('\n      ')}
      <blockquote><p>${txt(t.quote)}</p></blockquote>
      <p class="approach-label">${esc(t.approachHeading)}</p>
      <ul class="approach">${t.approach.map((x) => `<li>${txt(x)}</li>`).join('')}</ul>
    </div>
  </section>

  <section id="specialties" class="specialties" aria-labelledby="spec-title">
    <div class="wrap">
      <h2 id="spec-title">${esc(s.heading)}</h2>
      <ul class="cards">${s.items.map((x) => `<li class="card reveal"><span class="card-mark" aria-hidden="true"></span><p>${x.html}</p></li>`).join('')}</ul>
    </div>
  </section>

  <section id="education" class="education" aria-labelledby="edu-title">
    <div class="wrap edu-layout">
      <div class="edu-head"><h2 id="edu-title">${esc(e.heading)}</h2></div>
      <div class="edu-body">
      ${eduSections}
      </div>
    </div>
  </section>

  <section id="contact" class="contact" aria-labelledby="contact-title">
    <div class="wrap contact-inner">
      <h2 id="contact-title">${esc(k.heading)}</h2>
      <div class="contact-grid">
        <form name="contact" method="POST" action="thanks.html" data-netlify="true" netlify-honeypot="bot-field" class="contact-form" data-success="${esc(f.success)}" data-error="${esc(f.error)}">
          <input type="hidden" name="form-name" value="contact">
          <p class="hp" aria-hidden="true"><label>Do not fill this out <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
          <div class="field"><label for="f-name">${esc(f.name)} <span aria-hidden="true">*</span></label><input id="f-name" name="name" type="text" autocomplete="given-name" required aria-required="true"></div>
          <div class="field"><label for="f-phone">${esc(f.phone)} <span aria-hidden="true">*</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" dir="ltr" required aria-required="true"></div>
          <div class="field"><label for="f-email">${esc(f.email)}</label><input id="f-email" name="email" type="email" autocomplete="email" dir="ltr"></div>
          <div class="field consent"><input id="f-consent" name="consent" type="checkbox" required aria-required="true"><label for="f-consent">${f.consent}</label></div>
          <button type="submit">${esc(f.submit)}</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
        <div class="contact-details">
          <p class="lead">${esc(k.lead)}</p>
          <dl class="contact-list">
            <div><dt>${esc(k.phoneLabel)}</dt><dd><a href="${hero.contact[0].href}">${esc(hero.contact[0].value)}</a></dd></div>
            <div><dt>${esc(k.emailLabel)}</dt><dd><a href="${hero.contact[1].href}">${esc(hero.contact[1].value)}</a></dd></div>
          </dl>
          <a class="btn-wa" href="${k.whatsapp.href}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.4.6.6-2.3-.2-.3A8 8 0 0 1 12 4Zm-3 3.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.2 2.4.9 2.9.7 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.7-.4l-1.8-.9c-.3-.1-.5-.1-.7.2l-.8 1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.1-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4Z"/></svg><span>${esc(k.whatsapp.label)}</span></a>
        </div>
      </div>
    </div>
  </section>
</main>
` + footer(c, p);
}

function textPage(c, d, file) {
  const headHtml = head(c, { title: `${d.title} | ${c.meta.siteName}`, desc: d.title, canonicalPath: '/' + file, prefix: '', draft: d.draft });
  return headHtml + `
<body>
${header(c, '', false)}
<main id="main" class="text-page"><div class="wrap narrow">
  <h1>${esc(d.title)}</h1>
  ${d.sections.map((s) => `<h2>${esc(s.heading)}</h2>${s.paragraphs.map((x) => `<p>${esc(x)}</p>`).join('')}`).join('\n  ')}
</div></main>
` + footer(c, '');
}

function thanksPage(c) {
  const headHtml = head(c, { title: `${c.contact.form.success} | ${c.meta.siteName}`, desc: c.contact.form.success, canonicalPath: '/thanks.html', prefix: '', forceNoindex: true });
  return headHtml + `
<body>
${header(c, '', false)}
<main id="main" class="text-page"><div class="wrap narrow"><h1>${esc(c.contact.form.success)}</h1><p><a href="index.html">${esc(c.nav[0].label)}</a></p></div></main>
` + footer(c, '');
}

const he = read('content/he.json');
fs.writeFileSync('index.html', homePage(he));
fs.writeFileSync('privacy.html', textPage(he, read('content/privacy.he.json'), 'privacy.html'));
fs.writeFileSync('accessibility.html', textPage(he, read('content/accessibility.he.json'), 'accessibility.html'));
fs.writeFileSync('thanks.html', thanksPage(he));
fs.writeFileSync('robots.txt', site.noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);
const urls = ['/', '/privacy.html', '/accessibility.html'];
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${site.siteUrl}${u}</loc><lastmod>${site.updated}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log('built');
