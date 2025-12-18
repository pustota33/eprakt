import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Send } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { loadSEOData, type SEOData } from "@/lib/seo-loader";
import { FACILITATORS } from "@/data/facilitators";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

export default function FacilitatorDetail() {
  const { facilitatorSlug } = useParams();
  const [facilitator, setFacilitator] = useState<any>(null);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFacilitator();
    loadSEO();
    loadFAQ();
  }, [facilitatorSlug]);

  const loadSEO = async () => {
    if (facilitatorSlug) {
      const data = await loadSEOData('facilitator_detail', facilitatorSlug);
      setSeoData(data);
    }
  };

  const loadFAQ = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Failed to load FAQ:', error);
      } else if (data) {
        setFaqItems(data);
      }
    } catch (error) {
      console.error('Failed to load FAQ:', error);
    }
  };

  const loadFacilitator = async () => {
    try {
      const { data, error } = await supabase
        .from('facilitators')
        .select('*')
        .eq('slug', facilitatorSlug)
        .maybeSingle();

      if (error) {
        // Fallback to local data if Supabase is not set up - try by id for backward compatibility
        const local = FACILITATORS.find((f) => f.id === facilitatorSlug);
        if (local) {
          setFacilitator({
            ...local,
            description: '',
            rating: 4.9,
            cost: 'от 5000 рублей',
            video_url: 'https://www.youtube.com/embed/g_tea8ZNk5A',
            title_prefix: 'Фасилитатор кундалини',
            cta_text: 'Записаться',
            cta_href: local.contacts?.email || '/contacts',
            reviews: [
              { id: '1', name: 'Мария', text: 'Тёплая поддержка и чуткость.', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop' },
              { id: '2', name: 'Дмитрий', text: 'Сессии помогли обрести спокойствие.', photo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=300&auto=format&fit=crop' },
              { id: '3', name: 'Ольга', text: 'Рекомендую для мягкого старта!', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop' },
            ],
            schedule: [],
          });
        }
      } else {
        setFacilitator(data);
      }
    } catch (error) {
      console.error('Failed to load facilitator:', error);
      const local = FACILITATORS.find((f) => f.id === facilitatorSlug);
      if (local) {
        setFacilitator({
          ...local,
          description: '',
          rating: 4.9,
          cost: 'от 5000 рублей',
          video_url: 'https://www.youtube.com/embed/g_tea8ZNk5A',
          title_prefix: 'Фасилитатор кундалини',
          cta_text: 'Записаться',
          cta_href: local.contacts?.email || '/contacts',
          reviews: [
            { id: '1', name: 'Мария', text: 'Тёплая поддержка и чуткость.', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop' },
            { id: '2', name: 'Дмитрий', text: 'Сессии помогли обрести спокойствие.', photo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=300&auto=format&fit=crop' },
            { id: '3', name: 'Ольга', text: 'Рекомендую для мягкого старта!', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop' },
          ],
          schedule: [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container py-10 text-center">Загрузка...</div>;
  }

  if (!facilitator) {
    return <div className="container py-10 text-center">Фасилитатор не найден</div>;
  }

  const scheduleData = facilitator.schedule || [];
  const testimonials = facilitator.reviews || [];
  const titlePrefix = facilitator.title_prefix || 'Фасилитатор кундалини';
  const ctaText = facilitator.cta_text || 'Записаться';
  const signupHref = facilitator.cta_href ?? facilitator.contacts?.email ?? facilitator.contacts?.telegram ?? "/contacts";

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // If already in embed format, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // Convert youtube.com/watch?v=ID to embed format
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }

    // If it's just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return `https://www.youtube.com/embed/${url}`;
    }

    // Return URL as is if we can't parse it
    return url;
  };

  const videoUrl = getEmbedUrl(facilitator.video_url || '');

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <SEO
        title={seoData?.metaTitle}
        description={seoData?.metaDescription || `Фасилитатор по активации кундалини — ${facilitator.name}, ${facilitator.city}`}
        image={seoData?.metaImage}
        type="profile"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: facilitator.name,
          image: facilitator.photo,
          description: facilitator.tagline,
          address: { '@type': 'PostalAddress', addressLocality: facilitator.city },
          sameAs: [facilitator.contacts.telegram, facilitator.contacts.whatsapp, facilitator.contacts.email].filter(Boolean),
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '32' },
        }}
      />
      {/* Имя */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{titlePrefix} — {facilitator.name}</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Сессии в {facilitator.city} и онлайн</h2>

      {/* Верхний блок: фото слева, содержание справа */}
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border shadow-sm">
            <div className="aspect-[3/4] w-full">
              <img src={facilitator.photo} alt={facilitator.name} className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
          <div className="sr-only"><a href="/retreats">Ближайшие ретриты по активации кундалини</a></div>
        </div>

        <div>
          <div className="text-sm">⭐ 4.9 / 5</div>

          {/* Инфо блок + расписание */}
          <div className="mt-6 grid gap-4 rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Город</p>
                <p className="font-medium">{facilitator.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Формат</p>
                <p className="font-medium">{facilitator.format.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Тип сессий</p>
                <p className="font-medium">{facilitator.sessions.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Стоимость</p>
                <p className="font-medium">от 5000 рублей</p>
              </div>
            </div>

            <div className="mt-2">
              <p className="font-medium mb-3">Ближайшие сессии</p>
              <div className="space-y-2">
                {scheduleData.length > 0 ? (
                  scheduleData.map((s) => (
                    <div key={s.id} className="border p-3">
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 lg:items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Город</p>
                          <p className="font-medium text-sm">{s.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Дата</p>
                          <p className="font-medium text-sm">{s.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Место</p>
                          <p className="text-sm">{s.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Время</p>
                          <p className="font-medium text-sm">{s.time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Стоимость</p>
                          <p className="font-medium text-sm">{s.cost}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Сессии не добавлены</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a href={signupHref} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
              {ctaText}
            </a>
            {/* Контакты: Telegram, WhatsApp, Email */}
            {facilitator.contacts.telegram && (
              <a aria-label="Telegram" href={facilitator.contacts.telegram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm">
                <Send className="h-4 w-4" /> Telegram
              </a>
            )}
            {facilitator.contacts.whatsapp ? (
              <a aria-label="WhatsApp" href={facilitator.contacts.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.94 11.94 0 0012.01 0C5.38 0 .01 5.37.01 12c0 2.11.55 4.17 1.6 6.01L0 24l6.13-1.6A11.97 11.97 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.95 9.95 0 01-5.1-1.42l-.37-.22-3.63.95.97-3.54-.24-.37A9.96 9.96 0 1122 12c0 5.52-4.48 10-10 10zm5.41-7.59c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.88-.78-1.47-1.74-1.65-2.04-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.45s1.06 2.84 1.21 3.04c.15.2 2.1 3.2 5.1 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.41-.08-.13-.27-.2-.57-.35z"/></svg>
                WhatsApp
              </a>
            ) : (
              <button aria-label="WhatsApp недоступен" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-accent/60 px-4 py-2 text-sm opacity-50">
                WhatsApp
              </button>
            )}
            {facilitator.contacts.email && (
              <a aria-label="Email" href={facilitator.contacts.email} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm">
                <Mail className="h-4 w-4" /> Email
              </a>
            )}
          </div>

          {/* Описание */}
          {facilitator.description && (
            <section className="mt-6">
              <h2 className="text-xl font-semibold tracking-tight">О фасилитаторе</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{facilitator.description}</p>
            </section>
          )}
        </div>
      </div>

      {/* Отзывы с фото и именем */}
      {testimonials.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">Отзывы</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={t.photo} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
                  <figcaption className="font-medium">{t.name}</figcaption>
                </div>
                <blockquote className="mt-3 text-sm text-muted-foreground">{t.text}</blockquote>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Видео + FAQ справа */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {videoUrl ? (
          <div className="overflow-hidden rounded-3xl border shadow-sm">
            <iframe
              title="Видео-презентация"
              className="aspect-video w-full"
              src={videoUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        ) : null}
        <aside className="rounded-3xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight">FAQ</h3>
          <Accordion type="single" collapsible className="mt-3">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {faqItems.length === 0 && (
            <p className="text-sm text-muted-foreground mt-3">FAQ не загружены</p>
          )}
        </aside>
      </div>

      {/* Назад к каталогу */}
      <div className="mt-8">
        <Link to="/energopraktiki" className="inline-flex items-center rounded-full border px-4 py-2 text-sm hover:bg-white">← Назад к каталогу</Link>
      </div>
    </section>
  );
}
