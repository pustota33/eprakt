import { useMemo, useState, useEffect } from "react";
import { RETREATS, type Retreat } from "@/data/retreats";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { loadSEOData, type SEOData } from "@/lib/seo-loader";

const allFormats = ["Онлайн", "Оффлайн"] as const;

function Featured({ r }: { r: Retreat }) {
  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div className="relative">
          <img src={r.image} alt={r.title} className="h-80 w-full object-cover sm:h-96" loading="lazy" />
        </div>
        <div className="p-6 sm:p-8">
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs">{r.city} · {r.date}</span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{r.title}</h1>
          <p className="mt-3 text-muted-foreground max-w-prose">{r.description}</p>
          <div className="relative z-20 mt-5 flex flex-wrap gap-3">
            <a href={r.link ?? "#"} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Записаться</a>
            <Link to={`/retreats/${r.slug || r.id}`} className="rounded-full border px-6 py-3 text-sm">Подробнее</Link>
          </div>
        </div>
      </div>
      <Link to={`/retreats/${r.slug || r.id}`} className="absolute inset-0 z-10" aria-label={`Открыть ретрит: ${r.title}`} />
    </section>
  );
}

export default function Retreats() {
  const [retreatsData, setRetreatsData] = useState<Retreat[]>([]);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState<string>("Все");
  const [formats, setFormats] = useState<string[]>([]);

  useEffect(() => {
    loadRetreats();
    loadSEO();
  }, []);

  const loadSEO = async () => {
    const data = await loadSEOData('retreats_list');
    setSeoData(data);
  };

  const loadRetreats = async () => {
    try {
      const { data, error } = await supabase
        .from('retreats')
        .select('id, slug, title, city, date_text, image, description, format, price_from, link')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      const retreats = data?.map((r: any) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        city: r.city,
        date: r.date_text,
        image: r.image,
        description: r.description,
        format: r.format || [],
        priceFrom: r.price_from,
        link: r.link,
      })) || [];
      setRetreatsData(retreats);
    } catch (error) {
      console.log('Using local data:', error);
      setRetreatsData(RETREATS);
    } finally {
      setIsLoading(false);
    }
  };

  const allCities = useMemo(
    () => ["Все", ...Array.from(new Set(retreatsData.map((r) => r.city)))],
    [retreatsData]
  );

  const featured = retreatsData[0] || RETREATS[0];

  const list = useMemo(() => {
    return retreatsData.filter((r) => (city === "Все" || r.city === city) && (formats.length === 0 || formats.some((f) => r.format.includes(f as any))));
  }, [retreatsData, city, formats]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  if (isLoading || !featured) {
    return (
      <section className="container py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ретриты</h1>
        <div className="mt-8 text-center text-muted-foreground">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <SEO
        title={seoData?.metaTitle}
        description={seoData?.metaDescription || "Ретриты по активации кундалини — расписание и цены"}
        image={seoData?.metaImage}
        type="website"
      />
      <Featured r={featured} />

      <div className="mb-6 grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur md:grid-cols-4 md:gap-4">
        <div>
          <label htmlFor="city" className="text-sm text-muted-foreground">Город</label>
          <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-xl border-2 px-4 py-2">
            {allCities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3 flex flex-wrap items-end gap-2">
          <span className="text-sm text-muted-foreground">Формат:</span>
          {allFormats.map((f) => (
            <button key={f} onClick={() => toggle(formats, setFormats, f)} className={"rounded-full border px-3 py-1.5 text-xs " + (formats.includes(f) ? "bg-primary text-primary-foreground" : "bg-white")}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <article key={r.id} className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
            <img src={r.image} alt={r.title} className="h-48 w-full object-cover" loading="lazy" />
            <div className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-secondary px-2 py-0.5">{r.city}</span>
                <span>{r.date}</span>
              </div>
              <h3 className="font-semibold tracking-tight">{r.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
              <div className="relative z-20 flex items-center gap-3 pt-2">
                <a href={r.link ?? "#"} className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Записаться</a>
                <Link to={`/retreats/${r.slug || r.id}`} className="rounded-full border px-4 py-2 text-xs">Подробнее</Link>
              </div>
            </div>
            <Link to={`/retreats/${r.slug || r.id}`} className="absolute inset-0 z-10" aria-label={`Открыть ретрит: ${r.title}`} />
          </article>
        ))}
      </div>
    </section>
  );
}
