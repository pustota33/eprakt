import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import AdminFacilitatorsManager from '@/components/admin/AdminFacilitatorsManager';
import AdminRetreatsManager from '@/components/admin/AdminRetreatsManager';
import AdminBlogManager from '@/components/admin/AdminBlogManager';
import AdminContactsManager from '@/components/admin/AdminContactsManager';
import AdminHeroSettings from '@/components/admin/AdminHeroSettings';
import AdminFooterSettings from '@/components/admin/AdminFooterSettings';
import AdminSiteSettings from '@/components/admin/AdminSiteSettings';
import AdminTestimonialsManager from '@/components/admin/AdminTestimonialsManager';
import AdminAccountSettings from '@/components/admin/AdminAccountSettings';
import AdminHomepageSettings from '@/components/admin/AdminHomepageSettings';
import AdminNewsletterManager from '@/components/admin/AdminNewsletterManager';
import AdminTermsOfOfferSettings from '@/components/admin/AdminTermsOfOfferSettings';
import AdminFacilitatorApplySettings from '@/components/admin/AdminFacilitatorApplySettings';
import AdminFacilitatorPlacementSettings from '@/components/admin/AdminFacilitatorPlacementSettings';
import AdminFacilitatorsSEOSettings from '@/components/admin/AdminFacilitatorsSEOSettings';
import AdminReteatsSEOSettings from '@/components/admin/AdminReteatsSEOSettings';
import AdminBlogSEOSettings from '@/components/admin/AdminBlogSEOSettings';
import AdminContactsSEOSettings from '@/components/admin/AdminContactsSEOSettings';
import AdminServiceTypesManager from '@/components/admin/AdminServiceTypesManager';
import AdminFacilitatorsSortSettings from '@/components/admin/AdminFacilitatorsSortSettings';
import AdminFAQManager from '@/components/admin/AdminFAQManager';
import AdminAboutSettings from '@/components/admin/AdminAboutSettings';

export default function AdminDashboard() {
  const { logout, email } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('homepage');

  const tabs = [
    { id: 'homepage', label: 'Главная страница' },
    { id: 'about', label: 'О проекте' },
    { id: 'facilitators', label: 'Фасилитаторы' },
    { id: 'facilitators-sort', label: 'Сортировка фасилитаторов' },
    { id: 'service-types', label: 'Типы услуг' },
    { id: 'faq', label: 'FAQ' },
    { id: 'retreats', label: 'Ретриты' },
    { id: 'blog', label: 'Блог' },
    { id: 'contacts', label: 'Контакты' },
    { id: 'hero', label: 'Шапка сайта' },
    { id: 'testimonials', label: 'Отзывы' },
    { id: 'newsletter', label: 'Рассылка' },
    { id: 'footer', label: 'Футер' },
    { id: 'terms-of-offer', label: 'Договор оферты' },
    { id: 'facilitator-apply', label: 'Заявка фасилитатора' },
    { id: 'facilitator-placement', label: 'Размещение анкеты' },
    { id: 'settings', label: 'Настройки' },
    { id: 'account', label: 'Аккаунт' },
  ];

  return (
    <section className="min-h-screen bg-gray-50 flex">
      <SEO description="Админ-панель управления сайтом" />

      {/* Левое меню */}
      <div className="w-64 border-r bg-white shadow-sm flex flex-col">
        <div className="border-b p-6">
          <h1 className="text-2xl font-bold tracking-tight">Админ-панель</h1>
          <p className="text-xs text-muted-foreground mt-2">{email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="border-t p-4">
          <Button variant="outline" onClick={logout} className="w-full">
            Выйти
          </Button>
        </div>
      </div>

      {/* Основное содержимое */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-8 px-8 max-w-6xl">
          {activeTab === 'homepage' && <AdminHomepageSettings />}
          {activeTab === 'about' && <AdminAboutSettings />}
          {activeTab === 'facilitators' && <AdminFacilitatorsManager />}
          {activeTab === 'facilitators-sort' && <AdminFacilitatorsSortSettings />}
          {activeTab === 'service-types' && <AdminServiceTypesManager />}
          {activeTab === 'faq' && <AdminFAQManager />}
          {activeTab === 'retreats' && <AdminRetreatsManager />}
          {activeTab === 'blog' && <AdminBlogManager />}
          {activeTab === 'contacts' && <AdminContactsManager />}
          {activeTab === 'hero' && <AdminHeroSettings />}
          {activeTab === 'testimonials' && <AdminTestimonialsManager />}
          {activeTab === 'newsletter' && <AdminNewsletterManager />}
          {activeTab === 'footer' && <AdminFooterSettings />}
          {activeTab === 'terms-of-offer' && <AdminTermsOfOfferSettings />}
          {activeTab === 'facilitator-apply' && <AdminFacilitatorApplySettings />}
          {activeTab === 'facilitator-placement' && <AdminFacilitatorPlacementSettings />}
          {activeTab === 'settings' && <AdminSiteSettings />}
          {activeTab === 'account' && <AdminAccountSettings />}
        </div>
      </div>
    </section>
  );
}
