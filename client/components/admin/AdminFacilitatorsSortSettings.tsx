import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SortSettings {
  id: string;
  sort_method: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminFacilitatorsSortSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SortSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState('random');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('facilitators_sort_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
        setSortMethod(data.sort_method);
      }
    } catch (error) {
      console.error('Failed to load sort settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить настройки сортировки',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const { error } = await supabase
        .from('facilitators_sort_settings')
        .update({
          sort_method: sortMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'main');

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, sort_method: sortMethod } : null);

      toast({
        title: 'Успешно',
        description: 'Способ сортировки обновлен',
      });
    } catch (error) {
      console.error('Failed to save sort settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки сортировки',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Сортировка фасилитаторов</h2>
        <p className="text-muted-foreground mb-4">
          Выберите способ, по которому будут отображаться фасилитаторы на главной странице
        </p>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="text-sm font-medium">Способ сортировки</label>
          <select
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
            className="w-full mt-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring"
          >
            <option value="random">В случайном порядке (меняется при обновлении)</option>
            <option value="rating">По рейтингу (выше оценка первой)</option>
            <option value="created_at_desc">По дате добавления (новые сверху)</option>
            <option value="created_at_asc">По дате добавления (старые сверху)</option>
            <option value="custom_order">Пользовательский порядок</option>
          </select>
          <p className="text-xs text-muted-foreground mt-2">
            {sortMethod === 'random' && 'Фасилитаторы будут отображаться в случайном порядке, который меняется при каждом обновлении страницы'}
            {sortMethod === 'rating' && 'Фасилитаторы с более высоким рейтингом будут отображаться первыми'}
            {sortMethod === 'created_at_desc' && 'Новые фасилитаторы будут отображаться первыми'}
            {sortMethod === 'created_at_asc' && 'Давние фасилитаторы будут отображаться первыми'}
            {sortMethod === 'custom_order' && 'Фасилитаторы будут отображаться в порядке, установленном в индивидуальных настройках каждого'}
          </p>
        </div>

        <div className="rounded-lg border bg-blue-50 p-3">
          <p className="text-sm">
            <strong>Примечание:</strong> Фасилитаторы, у которых отмечен флаг "Закрепить на главной", всегда будут отображаться в начале списка, независимо от выбранного способа сортировки.
          </p>
        </div>

        <Button onClick={saveSettings} className="w-full">
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
}
