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
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
}

interface Retreat {
  id: string;
  slug: string;
  title: string;
}

async function fetchAllFacilitators(): Promise<Facilitator[]> {
  try {
    const { data, error } = await supabase
      .from('facilitators')
      .select('id, slug, name, city')
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
      .select('id, slug, title')
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
      .select('id, slug, title')
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

function generateHTMLPage(title: string, heading: string, description: string, url: string): string {
  const baseUrl = 'https://eprakt.onrender.com';
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${baseUrl}${url}">
  <meta property="og:type" content="website">
  <title>${title}</title>
  <link rel="canonical" href="${baseUrl}${url}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${title}",
    "description": "${description}",
    "url": "${baseUrl}${url}"
  }
  </script>
</head>
<body>
  <div id="root"></div>
  <h1>${heading}</h1>
  <noscript>
    <p>${description}</p>
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
      description: 'Найдите профессионального фасилитатора кундалини рядом с вами. Онлайн и офлайн сессии.'
    },
    {
      path: '/energopraktiki/index.html',
      title: 'Все энергопрактики | Фасилитаторы Кундалини',
      heading: 'Наши энергопрактики',
      description: 'Профессиональные фасилитаторы кундалини в различных городах.'
    },
    {
      path: '/retreats/index.html',
      title: 'Ретриты | Фасилитаторы Кундалини',
      heading: 'Ретриты и интенсивы',
      description: 'Многодневные ретриты и интенсивы для глубокого погружения в практику кундалини.'
    },
    {
      path: '/blog/index.html',
      title: 'Блог | Фасилитаторы Кундалини',
      heading: 'Блог',
      description: 'Статьи и гайды о практике кундалини, энергопрактиках и трансформации.'
    },
    {
      path: '/contacts/index.html',
      title: 'Контакты | Фасилитаторы Кундалини',
      heading: 'Контакты',
      description: 'Свяжитесь с нами по любым вопросам.'
    },
    {
      path: '/about/index.html',
      title: 'О нас | Фасилитаторы Кундалини',
      heading: 'О нас',
      description: 'Узнайте больше о нашей миссии и ценностях.'
    }
  ];

  // Generate static pages
  for (const page of staticPages) {
    const html = generateHTMLPage(page.title, page.heading, page.description, page.path.replace('/index.html', '') || '/');
    const filePath = path.join(distDir, page.path);
    ensureDirectory(filePath);
    fs.writeFileSync(filePath, html);
    pagesGenerated++;
  }

  // Generate dynamic pages for facilitators
  for (const facilitator of facilitators) {
    const slug = facilitator.slug || facilitator.id;
    const html = generateHTMLPage(
      `${facilitator.name} | Фасилитатор Кундалини`,
      facilitator.name,
      `${facilitator.name} - фасилитатор кундалини в городе ${facilitator.city}`,
      `/energopraktiki/${slug}`
    );
    const filePath = path.join(distDir, `energopraktiki/${slug}/index.html`);
    ensureDirectory(filePath);
    fs.writeFileSync(filePath, html);
    pagesGenerated++;
  }

  // Generate dynamic pages for blog posts
  for (const post of blogPosts) {
    const slug = post.slug || post.id;
    const html = generateHTMLPage(
      `${post.title} | Блог`,
      post.title,
      post.title,
      `/blog/${slug}`
    );
    const filePath = path.join(distDir, `blog/${slug}/index.html`);
    ensureDirectory(filePath);
    fs.writeFileSync(filePath, html);
    pagesGenerated++;
  }

  // Generate dynamic pages for retreats
  for (const retreat of retreats) {
    const slug = retreat.slug || retreat.id;
    const html = generateHTMLPage(
      `${retreat.title} | Ретриты`,
      retreat.title,
      retreat.title,
      `/retreats/${slug}`
    );
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
