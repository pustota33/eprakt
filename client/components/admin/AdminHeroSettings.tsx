import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface HeroSettings {
  id: string;
  title: string;
  subtitle: string;
  background_image: string;
  button_text: string;
  button_link: string;
}

export default function AdminHeroSettings() {
  const { toast } = useToast();
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadHeroSettings();
  }, []);

  const loadHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setHero(data || {
        id: 'main',
        title: 'Фасилитаторы Кундалини рядом с тобой',
        subtitle: 'Активируй свою энергию вместе с опытными фасилитаторами',
        background_image: '',
        button_text: 'Найти фасилитатора',
        button_link: '#facilitators',
      });
    } catch (error) {
      console.error('Failed to load hero settings:', error);
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
    if (!hero) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('hero_settings')
        .upsert(hero);

      if (error) throw error;
      
      toast({
        title: 'Успешно',
        description: 'Настройки шапки сохранены',
      });
    } catch (error) {
      console.error('Failed to save hero settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !hero) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Редактирование шапки сайта</h2>

      <div className="grid gap-6 max-w-2xl">
        <div>
          <label className="text-sm font-medium">Заголовок</label>
          <Input
            value={hero.title}
            onChange={(e) => setHero({ ...hero, title: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Подзаголовок</label>
          <Textarea
            value={hero.subtitle}
            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Фоновая картинка (URL)</label>
          <Input
            value={hero.background_image}
            onChange={(e) => setHero({ ...hero, background_image: e.target.value })}
            className="mt-1"
            placeholder="https://..."
          />
          {hero.background_image && (
            <img src={hero.background_image} alt="Preview" className="mt-2 h-40 w-full object-cover" />
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Текст кнопки</label>
          <Input
            value={hero.button_text}
            onChange={(e) => setHero({ ...hero, button_text: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ссылка кнопки</label>
          <Input
            value={hero.button_link}
            onChange={(e) => setHero({ ...hero, button_link: e.target.value })}
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
