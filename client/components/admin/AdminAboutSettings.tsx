import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';

interface AboutSettings {
  id: string;
  intro_title: string;
  intro_text: string;
  mission_title: string;
  mission_text: string;
  what_you_find_title: string;
  what_you_find_items: Array<{ text: string }>;
  contact_title: string;
  contact_text: string;
}

export default function AdminAboutSettings() {
  const { toast } = useToast();
  const [about, setAbout] = useState<AboutSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAboutSettings();
  }, []);

  const loadAboutSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('about_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setAbout(data || {
        id: 'main',
        intro_title: 'О проекте',
        intro_text: '',
        mission_title: 'Наша миссия',
        mission_text: '',
        what_you_find_title: 'Что вы найдёте у нас',
        what_you_find_items: [],
        contact_title: 'Как с нами связаться',
        contact_text: '',
      });
    } catch (error) {
      console.error('Failed to load about settings:', error);
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
    if (!about) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('about_settings')
        .upsert(about);

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Страница "О проекте" сохранена',
      });
    } catch (error) {
      console.error('Failed to save about settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addListItem = () => {
    if (!about) return;
    setAbout({
      ...about,
      what_you_find_items: [...about.what_you_find_items, { text: '' }],
    });
  };

  const updateListItem = (index: number, text: string) => {
    if (!about) return;
    const items = [...about.what_you_find_items];
    items[index].text = text;
    setAbout({ ...about, what_you_find_items: items });
  };

  const removeListItem = (index: number) => {
    if (!about) return;
    setAbout({
      ...about,
      what_you_find_items: about.what_you_find_items.filter((_, i) => i !== index),
    });
  };

  if (isLoading || !about) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Редактирование страницы "О проекте"</h2>

      <div className="grid gap-6 max-w-2xl">
        {/* Intro Section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Вводный раздел</h3>

          <div>
            <label className="text-sm font-medium">Заголовок</label>
            <Input
              value={about.intro_title}
              onChange={(e) => setAbout({ ...about, intro_title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Описание</label>
            <Textarea
              value={about.intro_text}
              onChange={(e) => setAbout({ ...about, intro_text: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Mission Section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Раздел миссии</h3>

          <div>
            <label className="text-sm font-medium">Заголовок</label>
            <Input
              value={about.mission_title}
              onChange={(e) => setAbout({ ...about, mission_title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Описание</label>
            <Textarea
              value={about.mission_text}
              onChange={(e) => setAbout({ ...about, mission_text: e.target.value })}
              className="mt-1"
              rows={4}
            />
          </div>
        </div>

        {/* What You Find Section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Что вы найдёте у нас</h3>

          <div>
            <label className="text-sm font-medium">Заголовок</label>
            <Input
              value={about.what_you_find_title}
              onChange={(e) => setAbout({ ...about, what_you_find_title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Список пунктов</label>
            <div className="space-y-2">
              {about.what_you_find_items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item.text}
                    onChange={(e) => updateListItem(index, e.target.value)}
                    placeholder="Введите пункт списка"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem(index)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addListItem}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" /> Добавить пункт
            </Button>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Раздел контактов</h3>

          <div>
            <label className="text-sm font-medium">Заголовок</label>
            <Input
              value={about.contact_title}
              onChange={(e) => setAbout({ ...about, contact_title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Описание</label>
            <Textarea
              value={about.contact_text}
              onChange={(e) => setAbout({ ...about, contact_text: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
