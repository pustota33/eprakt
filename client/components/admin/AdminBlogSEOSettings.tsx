import AdminSEOEditor from './AdminSEOEditor';

export default function AdminBlogSEOSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">SEO настройки страницы "Блог"</h2>
      <AdminSEOEditor pageType="blog_list" />
    </div>
  );
}
