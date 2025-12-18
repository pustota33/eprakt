import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BLOG_POSTS, getRelatedPosts } from "@/data/blog";
import SEO from "@/components/SEO";
import { loadSEOData, type SEOData } from "@/lib/seo-loader";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BlogPostDetail() {
  const { postSlug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    const loadPost = async () => {
      if (!postSlug) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, image, category, date_text, reading_time, content, related_ids, is_active, slug')
          .eq('slug', postSlug)
          .maybeSingle();

        if (error || !data) {
          setPost(null);
          setRelatedPosts([]);
        } else {
          setPost({
            id: data.id,
            title: data.title,
            excerpt: data.excerpt,
            image: data.image,
            category: data.category,
            date: data.date_text,
            readingTime: data.reading_time,
            content: data.content,
            relatedIds: data.related_ids,
          });

          // Load related posts
          if (data.related_ids && Array.isArray(data.related_ids)) {
            const { data: relatedData } = await supabase
              .from('blog_posts')
              .select('id, slug, title, excerpt, image, category, date_text, reading_time')
              .in('id', data.related_ids)
              .eq('is_active', true);

            if (relatedData) {
              setRelatedPosts(relatedData.map((p: any) => ({
                id: p.id,
                slug: p.slug,
                title: p.title,
                excerpt: p.excerpt,
                image: p.image,
                category: p.category,
                date: p.date_text,
                readingTime: p.reading_time,
              })));
            }
          }
        }
      } catch (error) {
        console.error('Failed to load post:', error);
        // Fall back to local data
        const localPost = BLOG_POSTS.find((p) => p.id === postSlug || p.slug === postSlug);
        setPost(localPost);
        if (localPost) {
          setRelatedPosts(getRelatedPosts(localPost.id || ''));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
    loadSEO();
  }, [postSlug]);

  const loadSEO = async () => {
    if (postSlug) {
      const data = await loadSEOData('blog_post_detail', postSlug);
      setSeoData(data);
    }
  };

  if (isLoading) {
    return (
      <section className="container py-10 sm:py-14 animate-fade-in-up">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-center text-muted-foreground">Загрузка...</p>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="container py-10 sm:py-14 animate-fade-in-up">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Статья не найдена</h1>
          <p className="mt-2 text-sm text-muted-foreground">Проверьте ссылку или вернитесь в раздел блога.</p>
          <div className="mt-5">
            <Link to="/blog" className="inline-flex rounded-full border px-4 py-2 text-sm">Вернуться к блогу</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <SEO
        title={seoData?.metaTitle}
        description={seoData?.metaDescription || (post.excerpt || "Активация кундалини — опыт и ответы").slice(0, 155)}
        image={seoData?.metaImage || post.image}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          image: post.image,
          author: { '@type': 'Organization', name: 'Активация Кундалини' },
          datePublished: post.date,
          description: post.excerpt || undefined,
        }}
      />
      <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border bg-white shadow-sm">
        <img src={post.image} alt={post.title} className="h-72 w-full object-cover sm:h-96" loading="lazy" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-0.5">{post.category}</span>
            <span>{formatDate(post.date)}</span>
            <span>· {post.readingTime}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{post.title}</h1>
          <div className="prose prose-sm mt-4 max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
            {post.content ?? post.excerpt}
            <div className="sr-only">
              <a href="/facilitators">Фасилитаторы по активации кундалини</a>
              <a href="/retreats">Ретриты по активации кундалини</a>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link to="/blog" className="inline-flex rounded-full border px-4 py-2 text-sm">Назад к статьям</Link>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="section-title mb-8 text-2xl font-bold tracking-tight">Рекомендуемые статьи</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {relatedPosts.map((p) => (
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
                    <Link to={`/blog/${p.slug || p.id}`} className="inline-flex rounded-full border px-4 py-2 text-xs hover:bg-accent">Читать</Link>
                  </div>
                </div>
                <Link to={`/blog/${p.slug || p.id}`} className="absolute inset-0 z-10" aria-label={`Открыть статью: ${p.title}`} />
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
