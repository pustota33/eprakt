import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/lib/supabase";

interface Retreat {
  id: string;
  title: string;
  city: string;
  date_text: string;
  image: string;
  description: string;
  link?: string;
  slug?: string;
}

const FALLBACK_RETREAT: Retreat = {
  id: 'fallback',
  title: 'Пробуждение и тишина',
  city: 'Сочи',
  date_text: '12–15 Окт 2025',
  image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1974&auto=format&fit=crop',
  description: 'Четыре дня мягких телесных и дыхательных практик, проводимость энергии кундалини, медитации и интеграционные круги.',
  link: '#signup',
};

export default function RetreatBlock() {
  const [retreat, setRetreat] = useState<Retreat>(FALLBACK_RETREAT);
  const [allRetreats, setAllRetreats] = useState<Retreat[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    const loadRetreats = async () => {
      try {
        const { data, error } = await supabase
          .from('retreats')
          .select('id, title, city, date_text, image, description, link, slug')
          .eq('show_on_home', true)
          .eq('is_active', true)
          .order('display_order');

        if (error) {
          console.error('Error loading retreats:', error);
          return;
        }

        if (data && data.length > 0) {
          const retreats = data.map((r: any) => ({
            id: r.id,
            title: r.title,
            city: r.city,
            date_text: r.date_text,
            image: r.image,
            description: r.description,
            link: r.link || undefined,
            slug: r.slug,
          }));
          setAllRetreats(retreats);
          setRetreat(retreats[0]);
        }
      } catch (error) {
        console.error('Exception loading retreats:', error);
      }
    };

    loadRetreats();
  }, []);

  // Rotation effect
  useEffect(() => {
    if (allRetreats.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % allRetreats.length;
        setRetreat(allRetreats[nextIndex]);
        return nextIndex;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [allRetreats]);

  return (
    <section id="retreat" className="bg-gradient-to-b from-white to-brand-cream/40 py-20" data-reveal>
      <div className="container">
        {/* Desktop Layout */}
        <div className="hidden lg:grid gap-8 items-center lg:grid-cols-2">
          {/* Left: Image */}
          <div
            className="order-1"
            data-reveal
            style={{ ["--reveal-delay" as any]: "0ms" }}
          >
            <Link
              to={`/retreats/${retreat.slug || retreat.id}`}
              className="relative overflow-hidden rounded-3xl border shadow-sm block group"
            >
              <img
                src={retreat.image}
                alt={retreat.title}
                className="h-96 w-full object-cover shadow-[0_0_0_8px_rgba(234,174,92,0.10)] transition-all duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-rose/20 to-brand-gold/10" />
            </Link>
          </div>

          {/* Right: Content */}
          <div
            className="order-2"
            data-reveal
            style={{ ["--reveal-delay" as any]: "120ms" }}
          >
            <h2 className="section-title text-2xl font-bold tracking-tight sm:text-3xl">Ближайший ретрит</h2>

            <div className="mt-2 text-xs text-muted-foreground">
              {retreat.city} • {retreat.date_text}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-foreground">{retreat.title}</h3>
            <div className="mt-4 space-y-3 text-muted-foreground">
              <p>{retreat.description}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={retreat.link || '/retreats'}
                target={retreat.link && retreat.link.includes('t.me') ? '_blank' : undefined}
                rel={retreat.link && retreat.link.includes('t.me') ? 'noopener noreferrer' : undefined}
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_30px_rgba(244,179,107,0.35)]"
              >
                Записаться
              </a>
              <Link
                to={`/retreats/${retreat.slug || retreat.id}`}
                className="rounded-full border bg-white/70 px-6 py-3 text-sm font-medium shadow-sm backdrop-blur transition hover:bg-white"
              >
                Подробнее о ретрите
              </Link>
            </div>
            {allRetreats.length > 1 && (
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => {
                    const prevIndex = currentIndex === 0 ? allRetreats.length - 1 : currentIndex - 1;
                    setCurrentIndex(prevIndex);
                    setRetreat(allRetreats[prevIndex]);
                  }}
                  className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Предыдущий ретрит"
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    const nextIndex = (currentIndex + 1) % allRetreats.length;
                    setCurrentIndex(nextIndex);
                    setRetreat(allRetreats[nextIndex]);
                  }}
                  className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Следующий ретрит"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Carousel Layout */}
        {allRetreats.length > 0 && (
          <div className="lg:hidden">
            <h2 className="section-title text-2xl font-bold tracking-tight sm:text-3xl mb-6">Ближайший ретрит</h2>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {allRetreats.map((r, i) => (
                  <article
                    key={r.id}
                    className="min-w-0 shrink-0 basis-full rounded-3xl border bg-white shadow-sm overflow-hidden"
                  >
                    <Link
                      to={`/retreats/${r.slug || r.id}`}
                      className="block overflow-hidden relative group"
                    >
                      <img
                        src={r.image}
                        alt={r.title}
                        className="h-72 w-full object-cover shadow-[0_0_0_8px_rgba(234,174,92,0.10)] transition-all duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-rose/20 to-brand-gold/10" />
                    </Link>

                    <div className="p-5">
                      <div className="text-xs text-muted-foreground">
                        {r.city} • {r.date_text}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-foreground">{r.title}</h3>
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p>{r.description}</p>
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <a
                          href={r.link || '/retreats'}
                          target={r.link && r.link.includes('t.me') ? '_blank' : undefined}
                          rel={r.link && r.link.includes('t.me') ? 'noopener noreferrer' : undefined}
                          className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition text-center hover:bg-primary/90"
                        >
                          Записаться
                        </a>
                        <Link
                          to={`/retreats/${r.slug || r.id}`}
                          className="rounded-full border bg-white/70 px-4 py-2 text-xs font-medium shadow-sm backdrop-blur transition text-center hover:bg-white"
                        >
                          Подробнее о ретрите
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {allRetreats.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button onClick={scrollPrev} className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white">
                  ←
                </button>
                <button onClick={scrollNext} className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white">
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
