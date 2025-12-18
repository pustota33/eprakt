import AdminSEOEditor from './AdminSEOEditor';

export default function AdminContactsSEOSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">SEO настройки страницы "Контакты"</h2>
      <AdminSEOEditor pageType="contacts" />
    </div>
  );
}
