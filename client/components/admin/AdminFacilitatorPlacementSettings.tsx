import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface FacilitatorPlacementCTA {
  id: string;
  facilitators_banner_heading: string;
  facilitators_banner_description: string;
  facilitators_banner_button_text: string;
  contacts_section_heading: string;
  contacts_section_description: string;
  contacts_section_button_text: string;
  footer_button_text: string;
}

const DEFAULT_CTA: FacilitatorPlacementCTA = {
  id: 'main',
  facilitators_banner_heading: 'Хотите стать фасилитатором?',
  facilitators_banner_description: 'Отправьте нам заявку и присоединяйтесь к нашему сообществу практиков',
  facilitators_banner_button_text: 'Оставить заявку',
  contacts_section_heading: 'Хотите стать фасилитатором?',
  contacts_section_description:
    'Присоединяйтесь к нашему сообществу и делитесь практиками кундалини с людьми по всему миру. Мы заботимся о каждом фасилитаторе и предоставляем всю необходимую поддержку.',
  contacts_section_button_text: 'Оставить заявку',
  footer_button_text: 'Разместить анкету фасилитатора',
};

export default function AdminFacilitatorPlacementSettings() {
  const { toast } = useToast();
  const [cta, setCTA] = useState<FacilitatorPlacementCTA>(DEFAULT_CTA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCTA();
  }, []);

  const loadCTA = async () => {
    try {
      const { data, error } = await supabase.from('facilitator_placement_cta').select('*').single();

      if (error && error.code !== 'PGRST116') throw error;

      setCTA(data || DEFAULT_CTA);
    } catch (error) {
      console.error('Failed to load facilitator placement CTA:', error);
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
    try {
      setIsSaving(true);
      const { error } = await supabase.from('facilitator_placement_cta').upsert(cta);

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Настройки сохранены',
      });
    } catch (error) {
      console.error('Failed to save facilitator placement CTA:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Редактирование элементов размещения анкеты фасилитатора</h2>

      {/* Баннер на странице Фасилитаторы */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Баннер на странице "Фасилитаторы"</h3>
        <div className="grid gap-6 max-w-3xl">
          <div>
            <label className="text-sm font-medium">Заголовок баннера</label>
            <Input
              value={cta.facilitators_banner_heading}
              onChange={(e) => setCTA({ ...cta, facilitators_banner_heading: e.target.value })}
              className="mt-1"
              placeholder="Хотите стать фасилитатором?"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Описание баннера</label>
            <Textarea
              value={cta.facilitators_banner_description}
              onChange={(e) => setCTA({ ...cta, facilitators_banner_description: e.target.value })}
              className="mt-1"
              placeholder="Отправьте нам заявку и присоединяйтесь к нашему сообществу практиков"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Текст кнопки баннера</label>
            <Input
              value={cta.facilitators_banner_button_text}
              onChange={(e) => setCTA({ ...cta, facilitators_banner_button_text: e.target.value })}
              className="mt-1"
              placeholder="Оставить заявку"
            />
          </div>
        </div>
      </div>

      {/* Секция на странице Контакты */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Секция на странице "Контакты"</h3>
        <div className="grid gap-6 max-w-3xl">
          <div>
            <label className="text-sm font-medium">Заголовок секции</label>
            <Input
              value={cta.contacts_section_heading}
              onChange={(e) => setCTA({ ...cta, contacts_section_heading: e.target.value })}
              className="mt-1"
              placeholder="Хотите стать фасилитатором?"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Описание секции</label>
            <Textarea
              value={cta.contacts_section_description}
              onChange={(e) => setCTA({ ...cta, contacts_section_description: e.target.value })}
              className="mt-1"
              placeholder="Присоединяйтесь к нашему сообществу..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Текст кнопки в секции</label>
            <Input
              value={cta.contacts_section_button_text}
              onChange={(e) => setCTA({ ...cta, contacts_section_button_text: e.target.value })}
              className="mt-1"
              placeholder="Оставить заявку"
            />
          </div>
        </div>
      </div>

      {/* Кнопка в футере */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Кнопка в футере</h3>
        <div className="grid gap-6 max-w-3xl">
          <div>
            <label className="text-sm font-medium">Текст кнопки в футере</label>
            <Input
              value={cta.footer_button_text}
              onChange={(e) => setCTA({ ...cta, footer_button_text: e.target.value })}
              className="mt-1"
              placeholder="Разместить анкету фасилитатора"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Эта кнопка отображается в футере под иконками соцсетей
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
        {isSaving ? 'Сохранение...' : 'Сохранить всё'}
      </Button>
    </div>
  );
}
