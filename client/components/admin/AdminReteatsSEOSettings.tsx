import AdminSEOEditor from './AdminSEOEditor';

export default function AdminReteatsSEOSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">SEO настройки страницы "Ретриты"</h2>
      <AdminSEOEditor pageType="retreats_list" />
    </div>
  );
}
