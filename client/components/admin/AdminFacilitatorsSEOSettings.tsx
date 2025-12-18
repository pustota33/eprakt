import AdminSEOEditor from './AdminSEOEditor';

export default function AdminFacilitatorsSEOSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">SEO настройки страницы "Фасилитаторы"</h2>
      <AdminSEOEditor pageType="facilitators_list" />
    </div>
  );
}
