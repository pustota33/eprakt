import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TermsOfOffer {
  id: string;
  title: string;
  content: string;
}

export default function AdminTermsOfOfferSettings() {
  const { toast } = useToast();
  const [terms, setTerms] = useState<TermsOfOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('terms_of_offer')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setTerms(data || {
        id: 'main',
        title: 'Договор оферты',
        content: '',
      });
    } catch (error) {
      console.error('Failed to load terms:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить договор оферты',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!terms) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('terms_of_offer')
        .upsert(terms);

      if (error) throw error;
      
      toast({
        title: 'Успешно',
        description: 'Договор оферты сохранён',
      });
    } catch (error) {
      console.error('Failed to save terms:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить договор оферты',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !terms) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Редактирование договора оферты</h2>

      <div className="grid gap-6 max-w-3xl">
        <div>
          <label className="text-sm font-medium">Заголовок страницы</label>
          <Input
            value={terms.title}
            onChange={(e) => setTerms({ ...terms, title: e.target.value })}
            className="mt-1"
            placeholder="Договор оферты"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Содержание договора</label>
          <Textarea
            value={terms.content}
            onChange={(e) => setTerms({ ...terms, content: e.target.value })}
            className="mt-1"
            placeholder="Введите текст договора оферты..."
            rows={20}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Используйте переносы строк для форматирования. HTML-теги не поддерживаются.
          </p>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </div>
  );
}
