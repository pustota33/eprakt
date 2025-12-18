import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SiteSettings {
  id: string;
  logo_url: string;
  site_name: string;
  newsletter_button_text: string;
  newsletter_button_link: string;
  main_facilitators_count: number;
}

export default function AdminSiteSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setSettings(data || {
        id: 'main',
        logo_url: '',
        site_name: 'Kundalini Guide',
        newsletter_button_text: 'Подписаться',
        newsletter_button_link: '#newsletter',
        main_facilitators_count: 4,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
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
        .from('site_settings')
        .upsert(settings);

      if (error) throw error;
      
      toast({
        title: 'Успешно',
        description: 'Настройки сайта сохранены',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
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
      <h2 className="text-xl font-bold">Общие настройки сайта</h2>

      <div className="grid gap-6 max-w-2xl">
        <div>
          <label className="text-sm font-medium">Логотип (URL)</label>
          <Input
            value={settings.logo_url}
            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            className="mt-1"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Название сайта</label>
          <Input
            value={settings.site_name}
            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Текст кнопки "Подписаться"</label>
          <Input
            value={settings.newsletter_button_text}
            onChange={(e) => setSettings({ ...settings, newsletter_button_text: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ссылка кнопки "Подписаться"</label>
          <Input
            value={settings.newsletter_button_link}
            onChange={(e) => setSettings({ ...settings, newsletter_button_link: e.target.value })}
            className="mt-1"
            placeholder="#newsletter"
          />
          <p className="mt-1 text-xs text-muted-foreground">Можно использовать якоря (#section) или полные URL</p>
        </div>

        <div>
          <label className="text-sm font-medium">Количество фасилитаторов на главной</label>
          <Input
            type="number"
            min="1"
            max="20"
            value={settings.main_facilitators_count}
            onChange={(e) => setSettings({ ...settings, main_facilitators_count: parseInt(e.target.value) })}
            className="mt-1"
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </div>
  );
}
