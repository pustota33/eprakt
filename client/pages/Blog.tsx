import { useMemo, useState, useEffect } from "react";
import { BLOG_POSTS, type BlogPost } from "@/data/blog";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { loadSEOData, type SEOData } from "@/lib/seo-loader";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

function Featured({ p }: { p: BlogPost }) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <img src={p.image} alt={p.title} className="h-80 w-full object-cover sm:h-96" loading="lazy" />
        <div className="p-6 sm:p-8">
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs">{p.category} · {formatDate(p.date)} · {p.readingTime}</span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{p.title}</h1>
          <p className="mt-3 text-muted-foreground max-w-prose">{p.excerpt}</p>
          <div className="relative z-20 mt-5 flex gap-3">
            <Link to={`/blog/${p.slug || p.id}`} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Читать</Link>
          </div>
        </div>
      </div>
      <Link to={`/blog/${p.slug || p.id}`} className="absolute inset-0 z-10" aria-label={`Открыть статью: ${p.title}`} />
    </section>
  );
}

export default function Blog() {
  const [postsData, setPostsData] = useState<BlogPost[]>([]);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Все");

  useEffect(() => {
    loadPosts();
    loadSEO();
  }, []);

  const loadSEO = async () => {
    const data = await loadSEOData('blog_list');
    setSeoData(data);
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, image, category, date_text, reading_time, content')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      const posts = data?.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        image: p.image,
        category: p.category,
        date: p.date_text,
        readingTime: p.reading_time,
        content: p.content,
      })) || [];
      setPostsData(posts);
    } catch (error) {
      console.log('Using local data:', error);
      setPostsData(BLOG_POSTS);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(
    () => ["Все", ...Array.from(new Set(postsData.map((p) => p.category)))],
    [postsData]
  );

  const featured = postsData[0] || BLOG_POSTS[0];

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return postsData.filter((p) =>
      (cat === "Все" || p.category === cat) &&
      (!query || p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query))
    );
  }, [postsData, q, cat]);

  const others = useMemo(() =>
    filtered.filter((p) => p.id !== featured.id),
    [filtered, featured.id]
  );

  if (isLoading || !featured) {
    return (
      <section className="container py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Блог</h1>
        <div className="mt-8 text-center text-muted-foreground">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <SEO
        title={seoData?.metaTitle}
        description={seoData?.metaDescription || "Активация кундалини — опыт, статьи и ответы на вопросы"}
        image={seoData?.metaImage}
        type="website"
      />
      <Featured p={featured} />

      <div className="mb-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur md:grid-cols-3 md:gap-4">
        <div className="md:col-span-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по блогу" className="w-full rounded-full border bg-white/80 px-4 py-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full rounded-xl border-2 px-4 py-2">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {others.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <article key={p.id} className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
              <img src={p.image} alt={p.title} className="h-48 w-full object-cover" loading="lazy" />
              <div className="space-y-2 p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-0.5">{p.category}</span>
                  <span>{formatDate(p.date)}</span>
                  <span>· {p.readingTime}</span>
                </div>
                <h3 className="font-semibold tracking-tight">{p.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                <div className="relative z-20 pt-2">
                  <Link to={`/blog/${p.slug || p.id}`} className="inline-flex rounded-full border px-4 py-2 text-xs">Читать</Link>
                </div>
              </div>
              <Link to={`/blog/${p.slug || p.id}`} className="absolute inset-0 z-10" aria-label={`Открыть статью: ${p.title}`} />
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white/70 p-8 text-center">
          <p className="text-muted-foreground">Статей не найдено</p>
        </div>
      )}
    </section>
  );
}
