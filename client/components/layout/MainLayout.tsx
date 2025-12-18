import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Instagram, Send, Youtube, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

interface FooterSettings {
  id: string;
  description: string;
  logo_url: string;
  site_name: string;
  telegram_link: string;
  instagram_link: string;
  youtube_link: string;
  rutube_link: string;
  vk_link: string;
  copyright_text: string;
  quote: string;
}

const DEFAULT_FOOTER: FooterSettings = {
  id: 'main',
  description: 'Практики, ретриты и знания о кундалини — всё в одном месте.',
  logo_url: '',
  site_name: 'Kundalini Guide',
  telegram_link: 'https://t.me/',
  instagram_link: 'https://instagram.com/',
  youtube_link: 'https://youtube.com/',
  rutube_link: 'https://rutube.ru/',
  vk_link: 'https://vk.com/',
  copyright_text: '© {year} Kundalini Guide. Все права защищены.',
  quote: '«Энергия Кундалини — это не то, что нужно понять. Это то, что нужно почувствовать.»',
};

const nav = [
  { href: "/", label: "Главная" },
  { href: "/energopraktiki", label: "Энергопрактики" },
  { href: "/retreats", label: "Ретриты" },
  { href: "/blog", label: "Блог" },
  { href: "/contacts", label: "Контакты" },
];

interface SiteSettings {
  id: string;
  logo_url: string;
  site_name: string;
  newsletter_button_text: string;
  newsletter_button_link: string;
  main_facilitators_count: number;
}

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

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'main',
  logo_url: '',
  site_name: 'Kundalini Guide',
  newsletter_button_text: 'Подписаться',
  newsletter_button_link: '#newsletter',
  main_facilitators_count: 4,
};

export default function MainLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(DEFAULT_FOOTER);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [placementCTA, setPlacementCTA] = useState<FacilitatorPlacementCTA | null>(null);
  const location = useLocation();
  const onHomeTop = !scrolled && location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!document.getElementById("jsonld-org")) {
      const s = document.createElement("script");
      s.id = "jsonld-org";
      s.type = "application/ld+json";
      s.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Активация Кундалини',
        url: window.location.origin,
        sameAs: ['https://vk.com/','https://instagram.com/','https://youtube.com/']
      });
      document.head.appendChild(s);
    }
  }, []);

  // Load footer and site settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [footerRes, siteRes, placementRes] = await Promise.all([
          supabase.from('footer_settings').select('*').single(),
          supabase.from('site_settings').select('*').single(),
          supabase.from('facilitator_placement_cta').select('*').single(),
        ]);

        if (!footerRes.error && footerRes.data) {
          setFooterSettings(footerRes.data);
        }
        if (!siteRes.error && siteRes.data) {
          setSiteSettings(siteRes.data);
        }
        if (!placementRes.error && placementRes.data) {
          setPlacementCTA(placementRes.data as FacilitatorPlacementCTA);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Reveal-on-scroll for elements with [data-reveal]
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;

    // Fallback for older iOS/Android browsers
    if (typeof (window as any).IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('reveal-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [location.pathname]);

  return (
    <div className="min-h-dvh bg-background text-foreground overflow-x-hidden">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all",
          onHomeTop
            ? "bg-primary/90 backdrop-blur-sm border-b border-primary/50"
            : "bg-white/95 backdrop-blur border-b border-primary/30",
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className={cn("inline-flex items-center gap-2 font-extrabold tracking-tight", onHomeTop ? "text-white" : undefined)}>
            <span className="text-lg">{siteSettings.site_name}</span>
            {siteSettings.logo_url ? (
              <img src={siteSettings.logo_url} alt="Logo" className="h-8 w-8" />
            ) : (
              <span className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-brand-rose to-brand-gold" />
            )}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {nav.map((n) => (
              <NavLink
                key={n.href}
                to={n.href}
                className={({ isActive }) =>
                  cn(
                    "text-sm transition-colors hover:text-primary",
                    onHomeTop ? "text-white/90 hover:text-white" : isActive ? "text-primary" : "text-muted-foreground",
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={siteSettings.newsletter_button_link}
              className={cn(
                "hidden sm:inline-flex rounded-full px-4 py-2 shadow-sm transition hover:shadow-md",
                onHomeTop ? "bg-white/20 text-white backdrop-blur hover:bg-white/30" : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {siteSettings.newsletter_button_text}
            </a>
            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
              <DialogTrigger asChild>
                <button aria-label="Открыть меню" className="inline-flex items-center justify-center gap-1.5 rounded-full md:hidden bg-primary text-primary-foreground hover:shadow transition-colors shadow-lg px-2.5 py-2 whitespace-nowrap">
                  <Menu className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-wide">Меню</span>
                </button>
              </DialogTrigger>
              <DialogTitle className="sr-only">Меню</DialogTitle>
              <DialogContent className="md:hidden">
                <nav className="grid gap-2">
                  {nav.map((n) => (
                    <NavLink key={n.href} to={n.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-base hover:bg-accent">
                      {n.label}
                    </NavLink>
                  ))}
                  <a href="#newsletter" onClick={() => setMenuOpen(false)} className="rounded-full bg-primary px-4 py-2 text-center text-primary-foreground">{siteSettings.newsletter_button_text}</a>
                </nav>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <Outlet />
      </main>

      <footer className="border-t bg-white">
        <div className="container py-10">
          <div className="grid gap-8 sm:gap-12 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-3 lg:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2 font-extrabold tracking-tight">
                <span className="text-lg">{footerSettings.site_name}</span>
                {footerSettings.logo_url ? (
                  <img src={footerSettings.logo_url} alt="Logo" className="h-8 w-8" />
                ) : (
                  <span className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-brand-rose to-brand-gold" />
                )}
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                {footerSettings.description}
              </p>
            </div>
            <nav className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:col-span-1">
              {nav.map((n) => (
                <NavLink key={n.href} to={n.href} className="text-sm text-muted-foreground hover:text-primary">
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <nav className="grid gap-4 lg:col-span-1">
              <NavLink to="/about" className="text-sm text-muted-foreground hover:text-primary">О проекте</NavLink>
              <NavLink to="/terms-of-offer" className="text-sm text-muted-foreground hover:text-primary">Договор оферты</NavLink>
            </nav>
            <div className="space-y-4 sm:col-span-1 md:col-span-2 lg:col-span-2">
              <p className="text-sm font-medium">Мы в соцсетях</p>
              <div className="flex flex-wrap items-center gap-3">
                {footerSettings.telegram_link && (
                  <a aria-label="Telegram" href={footerSettings.telegram_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', width: '36px', height: '36px', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#f3f4f6', color: '#000' }}>
                    <Send size={16} />
                  </a>
                )}
                {footerSettings.instagram_link && (
                  <a aria-label="Instagram" href={footerSettings.instagram_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', width: '36px', height: '36px', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#f3f4f6', color: '#000' }}>
                    <Instagram size={16} />
                  </a>
                )}
                {footerSettings.vk_link && (
                  <a aria-label="VK" href={footerSettings.vk_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', width: '36px', height: '36px', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#f3f4f6', color: '#000', fontSize: '12px', fontWeight: 'bold' }}>
                    VK
                  </a>
                )}
                {footerSettings.youtube_link && (
                  <a aria-label="YouTube" href={footerSettings.youtube_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', width: '36px', height: '36px', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#f3f4f6', color: '#000' }}>
                    <Youtube size={16} />
                  </a>
                )}
                {footerSettings.rutube_link && (
                  <a aria-label="RuTube" href={footerSettings.rutube_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', borderRadius: '9999px', backgroundColor: '#f3f4f6', color: '#000', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    RuTube
                  </a>
                )}
              </div>
              {placementCTA && (
                <Link to="/facilitator-apply" className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition">
                  {placementCTA.footer_button_text}
                </Link>
              )}
            </div>
          </div>
          {footerSettings.quote && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              {footerSettings.quote}
            </div>
          )}
          <div className="mt-6 border-t pt-6 text-xs text-muted-foreground">
            {footerSettings.copyright_text.replace('{year}', new Date().getFullYear().toString())}
          </div>
        </div>
      </footer>
    </div>
  );
}
