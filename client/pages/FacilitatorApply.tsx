import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';
import { loadSEOData, type SEOData } from '@/lib/seo-loader';

interface FacilitatorApplySettings {
  id: string;
  title: string;
  intro_text: string;
  prepare_title: string;
  prepare_items: string[];
  send_title: string;
  send_text: string;
  send_email: string;
  send_telegram: string;
  moderation_title: string;
  moderation_text: string;
}

const DEFAULT_SETTINGS: FacilitatorApplySettings = {
  id: 'main',
  title: 'Размещение анкеты фасилитатора',
  intro_text:
    'Если вы проводите сессии кундалини и хотите появиться в каталоге, отправьте нам заявку — мы оперативно свяжемся и подскажем дальнейшие шаги.',
  prepare_title: 'Что подготовить',
  prepare_items: [
    'ФИО и город',
    'Форматы работы (онлайн/оффлайн), типы сессий',
    'Короткое описание (1–2 предложения) и фото',
    'Контакты: Telegram, WhatsApp, Email',
    'Ссылки на соцсети (по желанию)',
  ],
  send_title: 'Куда отправлять',
  send_text: 'Отправьте данные любым удобным способом:',
  send_email: 'hello@kundaliniguide.ru',
  send_telegram: 'https://t.me/',
  moderation_title: 'Модерация и сроки',
  moderation_text:
    'Мы проверяем анкеты на корректность данных и соответствие подходу бережной практики. Обычно публикация занимает 1–3 рабочих дня.',
};

export default function FacilitatorApply() {
  const [settings, setSettings] = useState<FacilitatorApplySettings>(DEFAULT_SETTINGS);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadSEO();
  }, []);

  const loadSEO = async () => {
    const data = await loadSEOData('facilitator_apply');
    setSeoData(data);
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from('facilitator_apply').select('*').maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setSettings(data || DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Failed to load facilitator apply settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="container py-10 sm:py-14 animate-fade-in-up">
        <div className="text-center text-muted-foreground">Загрузка...</div>
      </section>
    );
  }

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <SEO
        title={seoData?.metaTitle}
        description={seoData?.metaDescription || "Размещение анкеты фасилитатора — активация кундалини"}
        image={seoData?.metaImage}
      />
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{settings.title}</h1>
      <p className="mt-3 max-w-prose text-muted-foreground">{settings.intro_text}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">{settings.prepare_title}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {settings.prepare_items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">{settings.send_title}</h2>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>{settings.send_text}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a href={`mailto:${settings.send_email}`} className="rounded-full border px-4 py-2">
                Email: {settings.send_email}
              </a>
              <a href={settings.send_telegram} target="_blank" rel="noreferrer" className="rounded-full border px-4 py-2">
                Telegram
              </a>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">{settings.moderation_title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{settings.moderation_text}</p>
      </div>
    </section>
  );
}
