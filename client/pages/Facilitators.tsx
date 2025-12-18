import { useMemo, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { loadSEOData, type SEOData } from "@/lib/seo-loader";
import { FACILITATORS as localFacilitators } from "@/data/facilitators";

interface FacilitatorPlacementCTA {
  id: string;
  facilitators_banner_heading: string;
  facilitators_banner_description: string;
  facilitators_banner_button_text: string;
  contacts_section_heading: string;
  contacts_section_description: string;
  contacts_section_button_text: string;
  footer_button_text: string;
}

interface Facilitator {
  id: string;
  name: string;
  city: string;
  cities: string;
  tagline: string;
  slug?: string;
  sessions: string[];
  format: string[];
  photo: string;
  service_types: string[];
  contacts: { telegram?: string; whatsapp?: string; email?: string };
  rating?: number;
  sort_method?: string;
  sort_order?: number;
  featured?: boolean;
  created_at?: string;
}

interface ServiceType {
  id: string;
  name: string;
}

const allSessions = ["Индивидуальные", "Групповые"] as const;
const allFormats = ["Онлайн", "Оффлайн"] as const;

function Card({ f }: { f: Facilitator }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link to={`/energopraktiki/${f.slug || f.id}`} aria-label={`Открыть страницу ${f.name}`}>
          <img src={f.photo} alt={f.name} className="h-full w-full object-cover transition hover:opacity-95" loading="lazy" />
        </Link>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="space-y-3 flex-1">
          <div>
            <Link to={`/energopraktiki/${f.slug || f.id}`} className="font-semibold tracking-tight hover:underline">
            {f.name}
          </Link>
            <div className="mt-1 text-xs" aria-label="Рейтинг ��асилитатора">⭐⭐⭐⭐⭐ 4.9 / 5</div>
            <p className="text-sm text-muted-foreground">{f.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1">{f.city}</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">{f.sessions.join(", ")}</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">{f.format.join(", ")}</span>
          </div>
        </div>
        <Link to={`/energopraktiki/${f.slug || f.id}`} className="mt-4 block w-full rounded-full bg-primary px-4 py-3 text-center text-xs font-medium text-primary-foreground hover:bg-primary/90 transition">
          Подробнее
        </Link>
      </div>
    </article>
  );
}

export default function Facilitators() {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [placementCTA, setPlacementCTA] = useState<FacilitatorPlacementCTA | null>(null);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Все города");
  const [sessions, setSessions] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [serviceType, setServiceType] = useState<string>("Все услуги");
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [sortMethod, setSortMethod] = useState<string>("random");

  useEffect(() => {
    loadFacilitators();
    loadPlacementCTA();
    loadSEO();
    loadServiceTypes();
  }, []);

  const loadSEO = async () => {
    const data = await loadSEOData('facilitators_list');
    setSeoData(data);
  };

  const loadFacilitators = async () => {
    try {
      const { data, error } = await supabase
        .from('facilitators')
        .select('id, slug, name, city, cities, tagline, sessions, format, photo, service_types, contacts, rating, sort_method, sort_order, featured, created_at')
        .eq('is_active', true);

      if (error) {
        console.log('Supabase error, using local data:', error);
        setFacilitators(localFacilitators as Facilitator[]);
      } else if (data) {
        console.log('Loaded facilitators:', data);
        setFacilitators(data as Facilitator[]);
      }

      // Load global sort settings
      const { data: sortSettings } = await supabase
        .from('facilitators_sort_settings')
        .select('sort_method')
        .eq('id', 'main')
        .single();

      if (sortSettings) {
        console.log('Sort settings:', sortSettings);
        setSortMethod(sortSettings.sort_method);
      }
    } catch (error) {
      console.error('Failed to load facilitators:', error);
      setFacilitators(localFacilitators as Facilitator[]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlacementCTA = async () => {
    try {
      const { data, error } = await supabase
        .from('facilitator_placement_cta')
        .select('*')
        .maybeSingle();

      if (!error && data) {
        setPlacementCTA(data as FacilitatorPlacementCTA);
      }
    } catch (error) {
      console.error('Failed to load placement CTA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Failed to load service types:', error);
      } else if (data) {
        setServiceTypes(data as ServiceType[]);
      }
    } catch (error) {
      console.error('Failed to load service types:', error);
    }
  };

  const allCities = useMemo(() =>
    ["Все города", ...Array.from(new Set(facilitators.map((f) => f.city)))],
    [facilitators]
  );

  const sortFacilitators = (list: Facilitator[]): Facilitator[] => {
    const featured = list.filter(f => f.featured);
    const regular = list.filter(f => !f.featured);

    let sorted: Facilitator[];

    if (sortMethod === 'random') {
      // Shuffle regular items
      const shuffled = [...regular].sort(() => Math.random() - 0.5);
      sorted = [...featured, ...shuffled];
    } else if (sortMethod === 'rating') {
      sorted = [...featured, ...regular.sort((a, b) => (b.rating || 0) - (a.rating || 0))];
    } else if (sortMethod === 'created_at_desc') {
      sorted = [...featured, ...regular.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      })];
    } else if (sortMethod === 'created_at_asc') {
      sorted = [...featured, ...regular.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateA - dateB;
      })];
    } else if (sortMethod === 'custom_order') {
      sorted = [...featured.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)), ...regular.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))];
    } else {
      sorted = list;
    }

    return sorted;
  };

  const filtered = useMemo(() => {
    const filtered = facilitators.filter((f) => {
      // Закреплённые фасилитаторы всегда показываются
      if (f.featured) return true;

      const q = query.trim().toLowerCase();
      const okQuery = !q || f.name.toLowerCase().includes(q) || f.tagline.toLowerCase().includes(q) || f.city.toLowerCase().includes(q);
      const okCity = city === "Все города" || f.city === city;
      const okSessions = sessions.length === 0 || sessions.some((s) => f.sessions.includes(s));
      const okFormats = formats.length === 0 || formats.some((s) => f.format.includes(s));
      const okServiceType = serviceType === "Все услуги" || (f.service_types && f.service_types.includes(serviceType));
      return okQuery && okCity && okSessions && okFormats && okServiceType;
    });

    return sortFacilitators(filtered);
  }, [facilitators, query, city, sessions, formats, serviceType, sortMethod]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  if (isLoading) {
    return (
      <section className="container py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Энергопрактики</h1>
        <div className="mt-8 text-center text-muted-foreground">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <SEO
        title={seoData?.metaTitle}
        description={seoData?.metaDescription || "Активация кундалини — фасилитаторы в городах и онлайн"}
        image={seoData?.metaImage}
        type="website"
      />
      <div className="mb-6 flex flex-col gap-6 md:mb-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Энергопрактики</h1>
          {placementCTA && (
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-6 flex flex-col md:flex-row md:items-start gap-4 md:gap-4">
              <div className="flex-1">
                <h2 className="font-semibold tracking-tight">{placementCTA.facilitators_banner_heading}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{placementCTA.facilitators_banner_description}</p>
              </div>
              <Link to="/facilitator-apply" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition md:whitespace-nowrap">
                {placementCTA.facilitators_banner_button_text} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
        <div className="grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur md:grid-cols-5 md:gap-4">
          <div className="md:col-span-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по имени или фразе"
              className="w-full rounded-full border bg-white/80 px-4 py-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-full border bg-white/80 px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-ring"
            >
              {allCities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full rounded-full border bg-white/80 px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-ring"
            >
              <option value="Все услуги">Все услуги</option>
              {serviceTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {allSessions.map((s) => (
              <button
                key={s}
                onClick={() => toggle(sessions, setSessions, s)}
                className={
                  "rounded-full px-3 py-1.5 text-xs border " +
                  (sessions.includes(s) ? "bg-primary text-primary-foreground" : "bg-white/80")
                }
              >
                {s}
              </button>
            ))}
            {allFormats.map((s) => (
              <button
                key={s}
                onClick={() => toggle(formats, setFormats, s)}
                className={
                  "rounded-full px-3 py-1.5 text-xs border " +
                  (formats.includes(s) ? "bg-primary text-primary-foreground" : "bg-white/80")
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Найдено: {filtered.length}</p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border bg-white/70 p-6 text-center text-muted-foreground">Ничего не найдено. Измените фильтры.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
          {filtered.map((f) => (
            <Card key={f.id} f={f} />
          ))}
        </div>
      )}
    </section>
  );
}
