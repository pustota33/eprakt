import { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { supabase } from '@/lib/supabase';

interface AboutSettings {
  id: string;
  intro_title: string;
  intro_text: string;
  mission_title: string;
  mission_text: string;
  what_you_find_title: string;
  what_you_find_items: Array<{ text: string }>;
  contact_title: string;
  contact_text: string;
}

export default function About() {
  const [about, setAbout] = useState<AboutSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAboutSettings();
  }, []);

  const loadAboutSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('about_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading about settings:', error);
      }

      setAbout(data || {
        id: 'main',
        intro_title: 'О проекте',
        intro_text: 'Kundalini Guide — это пространство о бережной практике кундалини: мы помогаем найти фасилитатора, подобрать формат сессий и выбрать подходящий ретрит.',
        mission_title: 'Наша миссия',
        mission_text: 'Дать каждому безопасный, понятный и экологичный доступ к практике кундалини. Мы собираем проверенную информацию, опытных фасилитаторов и события в одном месте.',
        what_you_find_title: 'Что вы найдёте у нас',
        what_you_find_items: [
          { text: 'Каталог фасилитаторов с фильтрами по городу и формату' },
          { text: 'Актуальные ретриты и ближайшие события' },
          { text: 'Материалы блога о практике, интеграции и безопасности' },
        ],
        contact_title: 'Как с нами связаться',
        contact_text: 'Задайте вопрос в мессенджере или на почту — мы обычно отвечаем в течение 1 рабочего дня. Контакты доступны на странице «Контакты».',
      });
    } catch (error) {
      console.error('Failed to load about settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="container py-10 sm:py-14">
        <p className="text-center text-muted-foreground">Загрузка...</p>
      </section>
    );
  }

  if (!about) {
    return (
      <section className="container py-10 sm:py-14">
        <p className="text-center text-muted-foreground">Не удалось загрузить страницу</p>
      </section>
    );
  }

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <SEO description="О проекте — активация кундалини: фасилитаторы, ретриты, статьи" />
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{about.intro_title}</h1>
      <p className="mt-3 max-w-prose text-muted-foreground">
        {about.intro_text}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">{about.mission_title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {about.mission_text}
          </p>
        </article>
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">{about.what_you_find_title}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {about.what_you_find_items.map((item, index) => (
              <li key={index}>{item.text}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">{about.contact_title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {about.contact_text}
        </p>
        <a href="/contacts" className="mt-3 inline-flex rounded-full border px-4 py-2 text-sm">Перейти к контактам</a>
      </div>
    </section>
  );
}
