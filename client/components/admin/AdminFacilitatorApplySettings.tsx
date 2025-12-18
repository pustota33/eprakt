import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AdminSEOEditor from './AdminSEOEditor';

interface FacilitatorApplySettings {
  id: string;
  title: string;
  intro_text: string;
  prepare_title: string;
  prepare_items: string[];
  send_title: string;
  send_text: string;
  send_email: string;
  send_telegram: string;
  moderation_title: string;
  moderation_text: string;
}

const DEFAULT_SETTINGS: FacilitatorApplySettings = {
  id: 'main',
  title: 'Размещение анкеты фасилитатора',
  intro_text:
    'Если вы проводите сессии кундалини и хотите появиться в каталоге, отправьте нам заявку — мы оперативно свяжемся и подскажем дальнейшие шаги.',
  prepare_title: 'Что подготовить',
  prepare_items: [
    'ФИО и город',
    'Форматы работы (онлайн/оффлайн), типы сессий',
    'Короткое описание (1–2 предложения) и фото',
    'Контакты: Telegram, WhatsApp, Email',
    'Ссылки на соцсети (по желанию)',
  ],
  send_title: 'Куда отправлять',
  send_text: 'Отправьте данные любым удобным способом:',
  send_email: 'hello@kundaliniguide.ru',
  send_telegram: 'https://t.me/',
  moderation_title: 'Модерация и сроки',
  moderation_text:
    'Мы проверяем анкеты на корректность данных и соответствие подходу бережной практики. Обычно публикация занимает 1–3 рабочих дня.',
};

export default function AdminFacilitatorApplySettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<FacilitatorApplySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from('facilitator_apply').select('*').single();

      if (error && error.code !== 'PGRST116') throw error;

      setSettings(data || DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Failed to load facilitator apply settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки страницы',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase.from('facilitator_apply').upsert(settings);

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Настройки страницы сохранены',
      });
    } catch (error) {
      console.error('Failed to save facilitator apply settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrepareItemChange = (index: number, value: string) => {
    const newItems = [...settings.prepare_items];
    newItems[index] = value;
    setSettings({ ...settings, prepare_items: newItems });
  };

  const addPrepareItem = () => {
    setSettings({
      ...settings,
      prepare_items: [...settings.prepare_items, ''],
    });
  };

  const removePrepareItem = (index: number) => {
    setSettings({
      ...settings,
      prepare_items: settings.prepare_items.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Редактирование страницы "Размещение анкеты фасилитатора"</h2>

      <div className="grid gap-6 max-w-3xl">
        {/* Основная информация */}
        <div>
          <label className="text-sm font-medium">Заголовок страницы</label>
          <Input
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            className="mt-1"
            placeholder="Размещение анкеты фасилитатора"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Вводный текст</label>
          <Textarea
            value={settings.intro_text}
            onChange={(e) => setSettings({ ...settings, intro_text: e.target.value })}
            className="mt-1"
            placeholder="Введите вводный текст..."
            rows={3}
          />
        </div>

        {/* Раздел "Что подготовить" */}
        <div className="border-t pt-6">
          <div className="mb-4">
            <label className="text-sm font-medium">Заголовок раздела "Что подготовить"</label>
            <Input
              value={settings.prepare_title}
              onChange={(e) => setSettings({ ...settings, prepare_title: e.target.value })}
              className="mt-1"
              placeholder="Что подготовить"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Пункты подготовки</label>
            <div className="space-y-2 mt-2">
              {settings.prepare_items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handlePrepareItemChange(index, e.target.value)}
                    placeholder={`Пункт ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrepareItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    Удалить
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addPrepareItem} className="mt-2">
              + Добавить пункт
            </Button>
          </div>
        </div>

        {/* Раздел "Куда отправлять" */}
        <div className="border-t pt-6">
          <div className="mb-4">
            <label className="text-sm font-medium">Заголовок раздела "Куда отправлять"</label>
            <Input
              value={settings.send_title}
              onChange={(e) => setSettings({ ...settings, send_title: e.target.value })}
              className="mt-1"
              placeholder="Куда отправлять"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium">Текст перед контактами</label>
            <Input
              value={settings.send_text}
              onChange={(e) => setSettings({ ...settings, send_text: e.target.value })}
              className="mt-1"
              placeholder="Отправьте данные любым удобным способом:"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium">Email для контакта</label>
            <Input
              value={settings.send_email}
              onChange={(e) => setSettings({ ...settings, send_email: e.target.value })}
              className="mt-1"
              placeholder="hello@kundaliniguide.ru"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Ссылка на Telegram</label>
            <Input
              value={settings.send_telegram}
              onChange={(e) => setSettings({ ...settings, send_telegram: e.target.value })}
              className="mt-1"
              placeholder="https://t.me/"
            />
          </div>
        </div>

        {/* Раздел "Модерация и сроки" */}
        <div className="border-t pt-6">
          <div className="mb-4">
            <label className="text-sm font-medium">Заголовок раздела "Модерация и сроки"</label>
            <Input
              value={settings.moderation_title}
              onChange={(e) => setSettings({ ...settings, moderation_title: e.target.value })}
              className="mt-1"
              placeholder="Модерация и сроки"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Текст раздела</label>
            <Textarea
              value={settings.moderation_text}
              onChange={(e) => setSettings({ ...settings, moderation_text: e.target.value })}
              className="mt-1"
              placeholder="Введите текст о модерации..."
              rows={4}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>

      <AdminSEOEditor pageType="facilitator_apply" />
    </div>
  );
}
