import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env files
const envPath = path.join(__dirname, '../.env');
const envLocalPath = path.join(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_KEY;

// Try reading from .env directly as fallback (for local development)
if (!supabaseUrl || !supabaseKey) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/);
    const keyMatch = envContent.match(/VITE_SUPABASE_KEY="?([^"\n]+)"?/);

    if (urlMatch) supabaseUrl = urlMatch[1];
    if (keyMatch) supabaseKey = keyMatch[1];
  } catch (error) {
    // Ignore file read errors
  }
}

// If still missing, try without quotes
if (!supabaseUrl || !supabaseKey) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = line.replace('VITE_SUPABASE_URL=', '').replace(/^["']|["']$/g, '').trim();
      }
      if (line.startsWith('VITE_SUPABASE_KEY=')) {
        supabaseKey = line.replace('VITE_SUPABASE_KEY=', '').replace(/^["']|["']$/g, '').trim();
      }
    }
  } catch (error) {
    // Ignore file read errors
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  WARNING: Supabase credentials not found in environment');
  console.warn('⚠️  Pre-rendering will be skipped');
  console.warn('📋 To fix: Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in your build environment');
  console.warn('');
  console.warn('For Render: Go to Dashboard → Service → Environment → Add variables:');
  console.warn('  - VITE_SUPABASE_URL');
  console.warn('  - VITE_SUPABASE_KEY');
  console.warn('');
  process.exit(0); // Exit gracefully without pre-rendering
}

const supabase = createClient(supabaseUrl, supabaseKey);
const distDir = path.join(__dirname, '../dist/static');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

interface Facilitator {
  id: string;
  slug: string;
  name: string;
  city: string;
  tagline?: string;
  description?: string;
  rating?: number;
  sessions?: string[];
  format?: string[];
  cost?: string;
  contacts?: Record<string, string>;
  seo_meta_title?: string;
  seo_meta_description?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  date_text?: string;
  reading_time?: string;
}

interface Retreat {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  city?: string;
  date_text?: string;
  format?: string[];
  price_from?: number;
}

async function fetchAllFacilitators(): Promise<Facilitator[]> {
  try {
    const { data, error } = await supabase
      .from('facilitators')
      .select('id, slug, name, city, tagline, description, rating, sessions, format, cost, contacts, seo_meta_title, seo_meta_description')
      .eq('is_active', true);

    if (error) {
      console.warn('Warning: Failed to fetch facilitators:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.warn('Warning: Exception fetching facilitators:', error);
    return [];
  }
}

async function fetchAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, content, category, date_text, reading_time')
      .eq('is_active', true);

    if (error) {
      console.warn('Warning: Failed to fetch blog posts:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.warn('Warning: Exception fetching blog posts:', error);
    return [];
  }
}

async function fetchAllRetreats(): Promise<Retreat[]> {
  try {
    const { data, error } = await supabase
      .from('retreats')
      .select('id, slug, title, description, content, city, date_text, format, price_from')
      .eq('is_active', true);

    if (error) {
      console.warn('Warning: Failed to fetch retreats:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.warn('Warning: Exception fetching retreats:', error);
    return [];
  }
}

function ensureDirectory(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateStaticPageHTML(title: string, heading: string, description: string, url: string, content: string = ''): string {
  const baseUrl = 'https://eprakt.onrender.com';
  const cleanDescription = stripHtml(description).slice(0, 160);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(cleanDescription)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(cleanDescription)}">
  <meta property="og:url" content="${baseUrl}${url}">
  <meta property="og:type" content="website">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${baseUrl}${url}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${escapeHtml(title)}",
    "description": "${escapeHtml(cleanDescription)}",
    "url": "${baseUrl}${url}"
  }
  </script>
</head>
<body>
  <div id="root"></div>
  <noscript>
    <div>
      <h1>${escapeHtml(heading)}</h1>
      <p>${escapeHtml(description)}</p>
      ${content ? `<div>${content}</div>` : ''}
    </div>
  </noscript>
  <script type="module" src="/assets/index-*.js"></script>
</body>
</html>`;
}

function generateFacilitatorHTML(facilitator: Facilitator): string {
  const slug = facilitator.slug || facilitator.id;
  const baseUrl = 'https://eprakt.onrender.com';
  const url = `/energopraktiki/${slug}`;

  const title = facilitator.seo_meta_title || `${facilitator.name} | Фасилитатор Кундалини`;
  const description = facilitator.seo_meta_description || facilitator.description || facilitator.tagline || `${facilitator.name} - фасилитатор кундалини в городе ${facilitator.city}`;

  let contentHtml = '';
  contentHtml += `<h1>${escapeHtml(facilitator.name)}</h1>`;
  if (facilitator.tagline) contentHtml += `<p><strong>${escapeHtml(facilitator.tagline)}</strong></p>`;
  if (facilitator.city) contentHtml += `<p>Город: ${escapeHtml(facilitator.city)}</p>`;
  if (facilitator.rating) contentHtml += `<p>Рейтинг: ${facilitator.rating}/5</p>`;
  if (facilitator.description) contentHtml += `<p>${escapeHtml(facilitator.description)}</p>`;
  if (facilitator.sessions && facilitator.sessions.length > 0) {
    contentHtml += `<h2>Типы сессий</h2><ul><li>${facilitator.sessions.map(s => escapeHtml(s)).join('</li><li>')}</li></ul>`;
  }
  if (facilitator.format && facilitator.format.length > 0) {
    contentHtml += `<h2>Форматы</h2><ul><li>${facilitator.format.map(f => escapeHtml(f)).join('</li><li>')}</li></ul>`;
  }
  if (facilitator.cost) contentHtml += `<h2>Стоимость</h2><p>${escapeHtml(facilitator.cost)}</p>`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(stripHtml(description).slice(0, 160))}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(stripHtml(description).slice(0, 160))}">
  <meta property="og:url" content="${baseUrl}${url}">
  <meta property="og:type" content="profile">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${baseUrl}${url}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "${escapeHtml(facilitator.name)}",
    "jobTitle": "Фасилитатор Кундалини",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "${escapeHtml(facilitator.city)}"
    },
    "url": "${baseUrl}${url}",
    "description": "${escapeHtml(stripHtml(description).slice(0, 160))}"
  }
  </script>
</head>
<body>
  <div id="root"></div>
  <noscript>
    <div>${contentHtml}</div>
  </noscript>
  <script type="module" src="/assets/index-*.js"></script>
</body>
</html>`;
}

function generateBlogPostHTML(post: BlogPost): string {
  const slug = post.slug || post.id;
  const baseUrl = 'https://eprakt.onrender.com';
  const url = `/blog/${slug}`;

  const title = post.title;
  const description = post.excerpt || stripHtml(post.content).slice(0, 160) || post.title;

  let contentHtml = '';
  contentHtml += `<h1>${escapeHtml(post.title)}</h1>`;
  if (post.category) contentHtml += `<p>Категория: ${escapeHtml(post.category)}</p>`;
  if (post.date_text) contentHtml += `<p>Дата: ${escapeHtml(post.date_text)}</p>`;
  if (post.reading_time) contentHtml += `<p>Время чтения: ${escapeHtml(post.reading_time)}</p>`;
  if (post.excerpt) contentHtml += `<h2>Краткое содержание</h2><p>${escapeHtml(post.excerpt)}</p>`;
  if (post.content) contentHtml += `<h2>Статья</h2><div>${post.content}</div>`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(stripHtml(description).slice(0, 160))}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(stripHtml(description).slice(0, 160))}">
  <meta property="og:url" content="${baseUrl}${url}">
  <meta property="og:type" content="article">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${baseUrl}${url}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${escapeHtml(title)}",
    "description": "${escapeHtml(stripHtml(description).slice(0, 160))}",
    "url": "${baseUrl}${url}",
    "articleBody": "${escapeHtml(stripHtml(post.content || '').slice(0, 500))}"
  }
  </script>
</head>
<body>
  <div id="root"></div>
  <noscript>
    <div>${contentHtml}</div>
  </noscript>
  <script type="module" src="/assets/index-*.js"></script>
</body>
</html>`;
}

function generateRetreatHTML(retreat: Retreat): string {
  const slug = retreat.slug || retreat.id;
  const baseUrl = 'https://eprakt.onrender.com';
  const url = `/retreats/${slug}`;

  const title = retreat.title;
  const description = retreat.description || stripHtml(retreat.content).slice(0, 160) || retreat.title;

  let contentHtml = '';
  contentHtml += `<h1>${escapeHtml(retreat.title)}</h1>`;
  if (retreat.city) contentHtml += `<p>Город: ${escapeHtml(retreat.city)}</p>`;
  if (retreat.date_text) contentHtml += `<p>Дата: ${escapeHtml(retreat.date_text)}</p>`;
  if (retreat.format && retreat.format.length > 0) {
    contentHtml += `<h2>Форматы</h2><ul><li>${retreat.format.map(f => escapeHtml(f)).join('</li><li>')}</li></ul>`;
  }
  if (retreat.price_from) contentHtml += `<h2>Стоимость</h2><p>От ${retreat.price_from} рублей</p>`;
  if (retreat.description) contentHtml += `<h2>Описание</h2><p>${escapeHtml(retreat.description)}</p>`;
  if (retreat.content) contentHtml += `<h2>Детали</h2><div>${retreat.content}</div>`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(stripHtml(description).slice(0, 160))}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(stripHtml(description).slice(0, 160))}">
  <meta property="og:url" content="${baseUrl}${url}">
  <meta property="og:type" content="event">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${baseUrl}${url}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "${escapeHtml(title)}",
    "description": "${escapeHtml(stripHtml(description).slice(0, 160))}",
    "url": "${baseUrl}${url}",
    "location": {
      "@type": "Place",
      "name": "${escapeHtml(retreat.city || '')}"
    }
  }
  </script>
</head>
<body>
  <div id="root"></div>
  <noscript>
    <div>${contentHtml}</div>
  </noscript>
  <script type="module" src="/assets/index-*.js"></script>
</body>
</html>`;
}

async function generateSitemap(
  facilitators: Facilitator[],
  blogPosts: BlogPost[],
  retreats: Retreat[]
) {
  const baseUrl = 'https://eprakt.onrender.com';

  const urls = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/energopraktiki', changefreq: 'daily', priority: 0.9 },
    { url: '/retreats', changefreq: 'weekly', priority: 0.9 },
    { url: '/blog', changefreq: 'weekly', priority: 0.8 },
    { url: '/contacts', changefreq: 'monthly', priority: 0.7 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
    ...facilitators.map(f => ({
      url: `/energopraktiki/${f.slug || f.id}`,
      changefreq: 'weekly' as const,
      priority: 0.8
    })),
    ...blogPosts.map(b => ({
      url: `/blog/${b.slug || b.id}`,
      changefreq: 'never' as const,
      priority: 0.7
    })),
    ...retreats.map(r => ({
      url: `/retreats/${r.slug || r.id}`,
      changefreq: 'weekly' as const,
      priority: 0.8
    }))
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(item => `  <url>
    <loc>${baseUrl}${item.url}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const sitemapPath = path.join(distDir, 'sitemap.xml');
  ensureDirectory(sitemapPath);
  fs.writeFileSync(sitemapPath, sitemapXml);
  console.log('✓ Generated sitemap.xml');
}

async function generateStaticPages(
  facilitators: Facilitator[],
  blogPosts: BlogPost[],
  retreats: Retreat[]
) {
  let pagesGenerated = 0;

  // Static pages that don't depend on dynamic data
  const staticPages = [
    {
      path: '/index.html',
      title: 'Фасилитаторы Кундалини рядом с тобой',
      heading: 'Фасилитаторы Кундалини рядом с тобой',
      description: 'Найдите профессионального фасилитатора кундалини рядом с вами. Онлайн и офлайн сессии.',
      content: facilitators.map(f => `<div><h3>${escapeHtml(f.name)}</h3><p>${escapeHtml(f.description || f.tagline || 'Фасилитатор кундалини')}</p></div>`).join('')
    },
    {
      path: '/energopraktiki/index.html',
      title: 'Все энергопрактики | Фасилитаторы Кундалини',
      heading: 'Наши энергопрактики',
      description: 'Профессиональные фасилитаторы кундалини в различных городах.',
      content: facilitators.map(f => `<div><h3>${escapeHtml(f.name)}</h3><p>Город: ${escapeHtml(f.city)}</p><p>${escapeHtml(f.description || f.tagline || '')}</p></div>`).join('')
    },
    {
      path: '/retreats/index.html',
      title: 'Ретриты | Фасилитаторы Кундалини',
      heading: 'Ретриты и интенсивы',
      description: 'Многодневные ретриты и интенсивы для глубокого погружения в практику кундалини.',
      content: retreats.map(r => `<div><h3>${escapeHtml(r.title)}</h3><p>Город: ${escapeHtml(r.city || '')}</p><p>Дата: ${escapeHtml(r.date_text || '')}</p><p>${escapeHtml(r.description || '')}</p></div>`).join('')
    },
    {
      path: '/blog/index.html',
      title: 'Блог | Фасилитаторы Кундалини',
      heading: 'Блог',
      description: 'Статьи и гайды о практике кундалини, энергопрактиках и трансформации.',
      content: blogPosts.map(p => `<div><h3>${escapeHtml(p.title)}</h3><p>Категория: ${escapeHtml(p.category || '')}</p><p>${escapeHtml(p.excerpt || '')}</p></div>`).join('')
    },
    {
      path: '/contacts/index.html',
      title: 'Контакты | Фасилитаторы Кундалини',
      heading: 'Контакты',
      description: 'Свяжитесь с нами по любым вопросам.',
      content: ''
    },
    {
      path: '/about/index.html',
      title: 'О нас | Фасилитаторы Кундалини',
      heading: 'О нас',
      description: 'Узнайте больше о нашей миссии и ценностях.',
      content: ''
    }
  ];

  // Generate static pages
  for (const page of staticPages) {
    const html = generateStaticPageHTML(page.title, page.heading, page.description, page.path.replace('/index.html', '') || '/', page.content);
    const filePath = path.join(distDir, page.path);
    ensureDirectory(filePath);
    fs.writeFileSync(filePath, html);
    pagesGenerated++;
  }

  // Generate dynamic pages for facilitators
  for (const facilitator of facilitators) {
    const html = generateFacilitatorHTML(facilitator);
    const slug = facilitator.slug || facilitator.id;
    const filePath = path.join(distDir, `energopraktiki/${slug}/index.html`);
    ensureDirectory(filePath);
    fs.writeFileSync(filePath, html);
    pagesGenerated++;
  }

  // Generate dynamic pages for blog posts
  for (const post of blogPosts) {
    const html = generateBlogPostHTML(post);
    const slug = post.slug || post.id;
    const filePath = path.join(distDir, `blog/${slug}/index.html`);
    ensureDirectory(filePath);
    fs.writeFileSync(filePath, html);
    pagesGenerated++;
  }

  // Generate dynamic pages for retreats
  for (const retreat of retreats) {
    const html = generateRetreatHTML(retreat);
    const slug = retreat.slug || retreat.id;
    const filePath = path.join(distDir, `retreats/${slug}/index.html`);
    ensureDirectory(filePath);
    fs.writeFileSync(filePath, html);
    pagesGenerated++;
  }

  console.log(`✓ Generated ${pagesGenerated} HTML pages`);
}

async function main() {
  try {
    console.log('🚀 Starting pre-rendering...');

    console.log('📥 Fetching data from Supabase...');
    const [facilitators, blogPosts, retreats] = await Promise.all([
      fetchAllFacilitators(),
      fetchAllBlogPosts(),
      fetchAllRetreats()
    ]);

    console.log(`📊 Found: ${facilitators.length} facilitators, ${blogPosts.length} blog posts, ${retreats.length} retreats`);

    // Generate static HTML pages
    await generateStaticPages(facilitators, blogPosts, retreats);

    // Generate sitemap
    await generateSitemap(facilitators, blogPosts, retreats);

    // Save data as JSON for server to use
    const dataPath = path.join(distDir, 'prerender-data.json');
    ensureDirectory(dataPath);
    fs.writeFileSync(dataPath, JSON.stringify({
      facilitators,
      blogPosts,
      retreats,
      generatedAt: new Date().toISOString()
    }, null, 2));
    console.log('✓ Saved prerender data');

    console.log('✨ Pre-rendering completed successfully!');
  } catch (error) {
    console.error('❌ Pre-rendering failed:', error);
    process.exit(1);
  }
}

main();
