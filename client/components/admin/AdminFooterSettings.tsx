import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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

export default function AdminFooterSettings() {
  const { toast } = useToast();
  const [footer, setFooter] = useState<FooterSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadFooterSettings();
  }, []);

  const loadFooterSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setFooter(data || {
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
      });
    } catch (error) {
      console.error('Failed to load footer settings:', error);
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
    if (!footer) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('footer_settings')
        .upsert(footer);

      if (error) throw error;
      
      toast({
        title: 'Успешно',
        description: 'Настройки футера сохранены',
      });
    } catch (error) {
      console.error('Failed to save footer settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !footer) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Редактирование футера</h2>

      <div className="grid gap-6 max-w-2xl">
        <div>
          <label className="text-sm font-medium">Название сайта</label>
          <Input
            value={footer.site_name}
            onChange={(e) => setFooter({ ...footer, site_name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Описание</label>
          <Textarea
            value={footer.description}
            onChange={(e) => setFooter({ ...footer, description: e.target.value })}
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Логотип (URL)</label>
          <Input
            value={footer.logo_url}
            onChange={(e) => setFooter({ ...footer, logo_url: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Telegram</label>
          <Input
            value={footer.telegram_link}
            onChange={(e) => setFooter({ ...footer, telegram_link: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Instagram</label>
          <Input
            value={footer.instagram_link}
            onChange={(e) => setFooter({ ...footer, instagram_link: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">YouTube</label>
          <Input
            value={footer.youtube_link}
            onChange={(e) => setFooter({ ...footer, youtube_link: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">RuTube</label>
          <Input
            value={footer.rutube_link}
            onChange={(e) => setFooter({ ...footer, rutube_link: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">VK (Вконтакте)</label>
          <Input
            value={footer.vk_link}
            onChange={(e) => setFooter({ ...footer, vk_link: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Авторское право</label>
          <Input
            value={footer.copyright_text}
            onChange={(e) => setFooter({ ...footer, copyright_text: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Цитата</label>
          <Textarea
            value={footer.quote}
            onChange={(e) => setFooter({ ...footer, quote: e.target.value })}
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
