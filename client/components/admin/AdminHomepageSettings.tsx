import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AdminSEOEditor from './AdminSEOEditor';

interface HomepageSettings {
  id: string;
  facilitators_title: string;
  facilitators_subtitle: string;
  facilitators_button_text: string;
  newsletter_title: string;
  newsletter_subtitle: string;
  newsletter_footer_text: string;
}

export default function AdminHomepageSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setSettings(data || {
        id: 'main',
        facilitators_title: 'Наши фасилитаторы Кундалини',
        facilitators_subtitle: 'Выберите город, чтобы увидеть доступных фасилитаторов рядом с вами.',
        facilitators_button_text: 'Смотреть всех фасилитаторов',
        newsletter_title: 'Получайте новости о ретритах и новых фасилитаторах в вашем городе',
        newsletter_subtitle: 'Подпишитесь на рассылку и будьте в курсе новых событий и статей.',
        newsletter_footer_text: 'Мы не спамим. Только новости о ретритах и практиках.',
      });
    } catch (error) {
      console.error('Failed to load homepage settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('homepage_settings')
        .upsert(settings);

      if (error) throw error;
      
      toast({
        title: 'Успешно',
        description: 'Настройки главной страницы сохранены',
      });
    } catch (error) {
      console.error('Failed to save homepage settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Редактирование главной страницы</h2>

      <div className="space-y-8">
        {/* Facilitators Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Раздел "Фасилитаторы"</h3>
          
          <div className="grid gap-6 max-w-2xl">
            <div>
              <label className="text-sm font-medium">Заголовок раздела</label>
              <Input
                value={settings.facilitators_title}
                onChange={(e) => setSettings({ ...settings, facilitators_title: e.target.value })}
                className="mt-1"
                placeholder="Наши фасилитаторы Кундалини"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Подзаголовок раздела</label>
              <Textarea
                value={settings.facilitators_subtitle}
                onChange={(e) => setSettings({ ...settings, facilitators_subtitle: e.target.value })}
                className="mt-1"
                placeholder="Выберите город, чтобы увидеть доступных фасилитаторов рядом с вами."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Текст кнопки "Смотреть всех фасилитаторов"</label>
              <Input
                value={settings.facilitators_button_text}
                onChange={(e) => setSettings({ ...settings, facilitators_button_text: e.target.value })}
                className="mt-1"
                placeholder="Смотреть всех фасилитаторов"
              />
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Раздел "Подписка"</h3>
          
          <div className="grid gap-6 max-w-2xl">
            <div>
              <label className="text-sm font-medium">Заголовок блока подписки</label>
              <Textarea
                value={settings.newsletter_title}
                onChange={(e) => setSettings({ ...settings, newsletter_title: e.target.value })}
                className="mt-1"
                placeholder="Получайте новости о ретритах и новых фасилитаторах в вашем городе"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Описание блока подписки</label>
              <Textarea
                value={settings.newsletter_subtitle}
                onChange={(e) => setSettings({ ...settings, newsletter_subtitle: e.target.value })}
                className="mt-1"
                placeholder="Подпишитесь на рассылку и будьте в курсе новых событий и статей."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Текст под формой подписки</label>
              <Textarea
                value={settings.newsletter_footer_text}
                onChange={(e) => setSettings({ ...settings, newsletter_footer_text: e.target.value })}
                className="mt-1"
                placeholder="Мы не спамим. Только новости о ретритах и практиках."
                rows={2}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="mt-6">
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </div>

      {/* SEO Settings Section */}
      <AdminSEOEditor pageType="homepage" />
    </div>
  );
}
