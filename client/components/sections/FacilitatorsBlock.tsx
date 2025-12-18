import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { FACILITATORS as localData } from "@/data/facilitators";

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

interface SiteSettings {
  id: string;
  logo_url: string;
  site_name: string;
  newsletter_button_text: string;
  main_facilitators_count: number;
}

interface HomepageSettings {
  id: string;
  facilitators_title: string;
  facilitators_subtitle: string;
  facilitators_button_text: string;
  newsletter_title: string;
  newsletter_subtitle: string;
  newsletter_footer_text: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'main',
  logo_url: '',
  site_name: 'Kundalini Guide',
  newsletter_button_text: 'Подписаться',
  main_facilitators_count: 4,
};

const DEFAULT_HOMEPAGE: HomepageSettings = {
  id: 'main',
  facilitators_title: 'Наши энергопрактики',
  facilitators_subtitle: 'Выберите город, чтобы увидеть доступных фасилитаторов рядом с вами.',
  facilitators_button_text: 'Смотреть всех энергопрактик',
  newsletter_title: 'Получайте новости о ретритах и новых энергопрактиках в вашем городе',
  newsletter_subtitle: 'Подпишитесь на рассылку и будьте в курсе новых событий и статей.',
  newsletter_footer_text: 'Мы не спамим. Только новости о ретритах и практиках.',
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function FacilitatorsBlock() {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState<string>("Все города");
  const [serviceType, setServiceType] = useState<string>("Все услуги");
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [homepage, setHomepage] = useState<HomepageSettings>(DEFAULT_HOMEPAGE);
  const [sortMethod, setSortMethod] = useState<string>("random");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [siteRes, homepageRes, serviceTypesRes] = await Promise.all([
          supabase.from('site_settings').select('*').single(),
          supabase.from('homepage_settings').select('*').single(),
          supabase.from('service_types').select('*').order('name'),
        ]);

        if (!siteRes.error && siteRes.data) {
          setSettings(siteRes.data);
        }
        if (!homepageRes.error && homepageRes.data) {
          setHomepage(homepageRes.data);
        }
        if (serviceTypesRes.error) {
          console.error('Failed to load service types:', serviceTypesRes.error);
        } else if (serviceTypesRes.data) {
          console.log('Loaded service types:', serviceTypesRes.data);
          setServiceTypes(serviceTypesRes.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
    loadFacilitators();
  }, []);

  const loadFacilitators = async () => {
    try {
      const { data, error } = await supabase
        .from('facilitators')
        .select('id, slug, name, city, cities, tagline, sessions, format, photo, service_types, contacts, rating, sort_method, sort_order, featured, created_at')
        .eq('is_active', true);

      if (error) {
        console.log('Supabase error, using local data:', error);
        setFacilitators(localData as Facilitator[]);
      } else if (data) {
        setFacilitators(data as Facilitator[]);
      }

      // Load global sort settings
      const { data: sortSettings } = await supabase
        .from('facilitators_sort_settings')
        .select('sort_method')
        .eq('id', 'main')
        .single();

      if (sortSettings) {
        setSortMethod(sortSettings.sort_method);
      }
    } catch (error) {
      console.error('Failed to load facilitators:', error);
      setFacilitators(localData as Facilitator[]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const cities = useMemo(() => {
    const allCities = new Set<string>();
    facilitators.forEach((f) => {
      if (f.city) allCities.add(f.city);
      if (f.cities) {
        f.cities.split(',').forEach((c) => allCities.add(c.trim()));
      }
    });
    return ["Все города", ...Array.from(allCities)];
  }, [facilitators]);

  const list = useMemo(() => {
    const filtered = facilitators.filter((f) => {
      // Закреплённые фасилитаторы всегда показываются
      if (f.featured) return true;

      // Filter regular facilitators by city
      let okCity = true;
      if (city !== "Все города") {
        okCity = f.city === city || (f.cities && f.cities.split(',').map((c) => c.trim()).includes(city));
      }

      // Filter by service type
      let okServiceType = true;
      if (serviceType !== "Все услуги") {
        okServiceType = f.service_types && f.service_types.includes(serviceType);
      }

      return okCity && okServiceType;
    });

    return sortFacilitators(filtered);
  }, [facilitators, city, serviceType, sortMethod]);

  if (isLoading || facilitators.length === 0) {
    return (
      <section id="facilitators" className="container py-20" data-reveal>
        <h2 className="section-title text-2xl font-bold tracking-tight sm:text-3xl">
          {homepage.facilitators_title}
        </h2>
        <div className="mt-8 text-center text-muted-foreground">Загрузка...</div>
      </section>
    );
  }

  return (
    <section id="facilitators" className="container py-20" data-reveal>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
        <div>
          <h2 className="section-title text-2xl font-bold tracking-tight sm:text-3xl">
            {homepage.facilitators_title}
          </h2>
          <p className="subheading-decor mt-2 max-w-prose text-muted-foreground">
            {homepage.facilitators_subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-auto">
            <label className="sr-only" htmlFor="city">Город</label>
            <select
              id="city"
              aria-label="Город"
              className="w-full rounded-xl border-2 border-border bg-white px-5 py-2.5 pr-10 text-base shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
          </div>
          <div className="relative w-full sm:w-auto">
            <label className="sr-only" htmlFor="service-type">Тип услуги</label>
            <select
              id="service-type"
              aria-label="Тип услуги"
              className="w-full rounded-xl border-2 border-border bg-white px-5 py-2.5 pr-10 text-base shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            >
              <option value="Все услуги">Все услуги</option>
              {serviceTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
        {list.slice(0, settings.main_facilitators_count).map((f, i) => (
          <article
            key={f.id}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(234,174,92,0.25)]"
          >
            <div className="relative overflow-hidden aspect-[3/4]">
              <Link to={`/energopraktiki/${f.slug || f.id}`} aria-label={`Открыть страницу ${f.name}`}>
                <img src={f.photo} alt={f.name} className="h-full w-full origin-center transform rounded-t-2xl object-cover shadow-[0_0_0_6px_rgba(234,174,92,0.12)] transition duration-500 group-hover:scale-105" loading="lazy" />
              </Link>
            </div>
            <div className="flex flex-col flex-1 p-4">
              <div className="space-y-3 flex-1">
                <div>
                  <Link to={`/energopraktiki/${f.slug || f.id}`} className="font-semibold tracking-tight hover:underline">{f.name}</Link>
                  <div className="mt-1 text-xs" aria-label="Рейтинг фасилитатора">⭐⭐⭐⭐⭐ 4.9 / 5</div>
                  <p className="text-sm text-muted-foreground">{f.tagline}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-secondary px-2.5 py-1">{f.city}</span>
                  <span className="rounded-full bg-secondary px-2.5 py-1">
                    {f.sessions.join(", ")}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1">{f.format.join(", ")}</span>
                </div>
              </div>
              <Link
                to={`/energopraktiki/${f.slug || f.id}`}
                className="mt-4 block w-full rounded-full bg-primary px-4 py-3 text-center text-xs font-medium text-primary-foreground transition will-change-transform hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_12px_30px_rgba(244,179,107,0.35)]"
              >
                Подробнее
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          to="/energopraktiki"
          className="rounded-full bg-primary px-7 py-3 text-base font-medium text-primary-foreground text-center shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_30px_rgba(244,179,107,0.35)]"
        >
          {homepage.facilitators_button_text}
        </Link>
      </div>
    </section>
  );
}
