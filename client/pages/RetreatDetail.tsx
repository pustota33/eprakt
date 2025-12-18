import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RETREATS } from "@/data/retreats";
import SEO from "@/components/SEO";
import { loadSEOData, type SEOData } from "@/lib/seo-loader";

export default function RetreatDetail() {
  const { retreatSlug } = useParams();
  const [r, setR] = useState<any>(null);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRetreat = async () => {
      if (!retreatSlug) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('retreats')
          .select('id, title, city, date_text, image, description, content, format, price_from, link, is_active, slug')
          .eq('slug', retreatSlug)
          .maybeSingle();

        if (error || !data) {
          setR(null);
        } else {
          setR({
            id: data.id,
            title: data.title,
            city: data.city,
            date: data.date_text,
            image: data.image,
            description: data.description,
            content: data.content,
            format: data.format || [],
            priceFrom: data.price_from,
            link: data.link,
          });
        }
      } catch (error) {
        console.error('Failed to load retreat:', error);
        // Fall back to local data
        const localRetreat = RETREATS.find((x) => x.id === retreatSlug || x.slug === retreatSlug);
        setR(localRetreat);
      } finally {
        setIsLoading(false);
      }
    };

    loadRetreat();
    loadSEO();
  }, [retreatSlug]);

  const loadSEO = async () => {
    if (retreatSlug) {
      const data = await loadSEOData('retreat_detail', retreatSlug);
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

  if (!r) {
    return (
      <section className="container py-10 sm:py-14 animate-fade-in-up">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Ретрит не найден</h1>
          <p className="mt-2 text-sm text-muted-foreground">Проверьте ссылку или вернитесь к списку ретритов.</p>
          <div className="mt-5">
            <Link to="/retreats" className="inline-flex rounded-full border px-4 py-2 text-sm">Вернуться к ретритам</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <SEO
        title={seoData?.metaTitle}
        description={seoData?.metaDescription || (r.description + ' — ретрит по активации кундалини').slice(0, 155)}
        image={seoData?.metaImage || r.image}
        type="event"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: 'Ретрит по активации Кундалини',
          startDate: r.date,
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: { '@type': 'Place', name: r.city },
          image: r.image,
          description: r.description,
          offers: { '@type': 'Offer', price: r.priceFrom, priceCurrency: 'RUB' },
        }}
      />
      <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border bg-white shadow-sm">
        <img src={r.image} alt={r.title} className="h-72 w-full object-cover sm:h-96" loading="lazy" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-0.5">{r.city}</span>
            <span>{r.date}</span>
            <span>· от {r.priceFrom.toLocaleString("ru-RU")} ₽</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{r.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">{r.description}</p>
          {r.content && (
            <div className="prose prose-sm mt-6 max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
              {r.content}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {r.link && (
              <a href={r.link} className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Записаться</a>
            )}
            <Link to="/retreats" className="inline-flex rounded-full border px-4 py-2 text-sm">Назад к ретритам</Link>
          </div>
        </div>
      </article>
    </section>
  );
}
