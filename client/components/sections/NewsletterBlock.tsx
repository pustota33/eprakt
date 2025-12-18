import { FormEvent, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
  facilitators_title: 'Наши фасилитаторы Кундалини',
  facilitators_subtitle: 'Выберите город, чтобы увидеть доступных фасилитаторов рядом с вами.',
  facilitators_button_text: 'Смотреть всех фасилитаторов',
  newsletter_title: 'Получайте новости о ретритах и новых фасилитаторах в вашем городе',
  newsletter_subtitle: 'Подпишитесь на рассылку и будьте в курсе новых событий и статей.',
  newsletter_footer_text: 'Мы не спамим. Только новости о ретритах и практиках.',
};

export default function NewsletterBlock() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [homepage, setHomepage] = useState<HomepageSettings>(DEFAULT_HOMEPAGE);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [siteRes, homepageRes] = await Promise.all([
          supabase.from('site_settings').select('*').single(),
          supabase.from('homepage_settings').select('*').single(),
        ]);

        if (!siteRes.error && siteRes.data) {
          setSettings(siteRes.data);
        }
        if (!homepageRes.error && homepageRes.data) {
          setHomepage(homepageRes.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите корректный email',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.message.includes('duplicate')) {
          toast({
            title: 'Уже подписаны',
            description: 'Этот email уже зарегистрирован в рассылке',
          });
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        setEmail('');
        toast({
          title: 'Успешно!',
          description: 'Спасибо за подписку на рассылку!',
        });

        // Hide success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить подписку. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="newsletter" className="bg-gradient-to-b from-brand-cream/60 to-white py-20" data-reveal>
      <div className="container grid items-center gap-6 rounded-3xl border bg-white/70 p-6 shadow-sm backdrop-blur lg:grid-cols-2 lg:p-10">
        <div>
          <h2 className="section-title text-2xl font-bold tracking-tight sm:text-3xl">
            {homepage.newsletter_title}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {homepage.newsletter_subtitle}
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ваш e-mail"
            disabled={isLoading}
            className="flex-1 rounded-full border bg-white/80 px-5 py-3 text-sm shadow-sm outline-none backdrop-blur placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_30px_rgba(244,179,107,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Подписка...' : settings.newsletter_button_text}
          </button>
        </form>
        {submitted && (
          <p className="col-span-full text-sm text-green-700">
            ✓ Спасибо за подписку! Вы будете получать новости о ретритах и новых фасилитаторах.
          </p>
        )}
        <p className="col-span-full text-xs text-muted-foreground">{homepage.newsletter_footer_text}</p>
      </div>
    </section>
  );
}
