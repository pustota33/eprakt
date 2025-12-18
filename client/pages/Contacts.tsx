import { useEffect, useState } from "react";
import { Mail, Phone, Send, Instagram, Youtube, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { loadSEOData, type SEOData } from "@/lib/seo-loader";

interface ContactsData {
  id: string;
  phone: string;
  email: string;
  telegram: string;
  whatsapp: string;
  vk_link: string;
  instagram_link: string;
  youtube_link: string;
  rutube_link: string;
  response_time: string;
  working_hours: string;
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

const DEFAULT_CONTACTS: ContactsData = {
  id: 'main',
  phone: '+7 999 000-00-00',
  email: 'hello@kundaliniguide.ru',
  telegram: 'https://t.me/',
  whatsapp: '+79990000000',
  vk_link: 'https://vk.com/',
  instagram_link: 'https://instagram.com/',
  youtube_link: 'https://youtube.com/',
  rutube_link: 'https://rutube.ru/',
  response_time: 'Обычно в течение 1 рабочего дня. В мессенджерах чаще — в тот же день.',
  working_hours: 'Ежедневно с 10:00 до 20:00 по Москве. Если не ответили сразу — обязательно вернёмся к вам.',
};

export default function Contacts() {
  const [contacts, setContacts] = useState<ContactsData>(DEFAULT_CONTACTS);
  const [placementCTA, setPlacementCTA] = useState<FacilitatorPlacementCTA | null>(null);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
    loadPlacementCTA();
    loadSEO();
  }, []);

  const loadSEO = async () => {
    const data = await loadSEOData('contacts');
    setSeoData(data);
  };

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('site_contacts')
        .select('*')
        .maybeSingle();

      if (!error && data) {
        setContacts(data);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
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

  if (isLoading) {
    return (
      <section className="container py-10 sm:py-14 animate-fade-in-up">
        <div className="text-center">Загрузка контактов...</div>
      </section>
    );
  }

  const getPhoneForTel = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const getPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <SEO
        title={seoData?.metaTitle}
        description={seoData?.metaDescription || "Контакты — записаться на активацию кундалини"}
        image={seoData?.metaImage}
        type="website"
      />
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Вы можете связаться с нами по любому удобному каналу. Мы открыты к вопросам о ретритах, фасилитаторах и сессиях.</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight">Основные контакты</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {contacts.phone && (
                <div className="flex items-start gap-3 rounded-xl border bg-white/60 p-4">
                  <Phone className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Телефон / WhatsApp</div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                      <a href={`tel:+${getPhoneForTel(contacts.phone)}`} className="rounded-full border px-3 py-1.5">{contacts.phone}</a>
                      {contacts.whatsapp && (
                        <a href={`https://wa.me/${getPhoneForWhatsApp(contacts.whatsapp)}`} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1.5">Написать в WhatsApp</a>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {contacts.telegram && (
                <div className="flex items-start gap-3 rounded-xl border bg-white/60 p-4">
                  <Send className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Telegram</div>
                    <div className="mt-1 text-sm">
                      <a href={contacts.telegram} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1.5">Написать в Telegram</a>
                    </div>
                  </div>
                </div>
              )}
              {contacts.email && (
                <div className="flex items-start gap-3 rounded-xl border bg-white/60 p-4">
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="mt-1 text-sm">
                      <a href={`mailto:${contacts.email}`} className="rounded-full border px-3 py-1.5">{contacts.email}</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight">Соцсети</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {contacts.vk_link && (
                <a aria-label="VK" href={contacts.vk_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">VK</a>
              )}
              {contacts.instagram_link && (
                <a aria-label="Instagram" href={contacts.instagram_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><Instagram className="h-4 w-4" /> Instagram</a>
              )}
              {contacts.youtube_link && (
                <a aria-label="YouTube" href={contacts.youtube_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><Youtube className="h-4 w-4" /> YouTube</a>
              )}
              {contacts.rutube_link && (
                <a aria-label="Rutube" href={contacts.rutube_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">Rutube</a>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          {contacts.response_time && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold tracking-tight">Как быстро отвечаем</h3>
              <p className="mt-2 text-sm text-muted-foreground">{contacts.response_time}</p>
            </div>
          )}
          {contacts.working_hours && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold tracking-tight">Когда лучше писать</h3>
              <p className="mt-2 text-sm text-muted-foreground">{contacts.working_hours}</p>
            </div>
          )}
        </aside>
      </div>

      {placementCTA && (
        <div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold tracking-tight">{placementCTA.contacts_section_heading}</h2>
            <p className="mt-3 text-muted-foreground">{placementCTA.contacts_section_description}</p>
            <Link to="/facilitator-apply" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition">
              {placementCTA.contacts_section_button_text} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
