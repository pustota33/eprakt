import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FormData {
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

export default function AdminFAQManager() {
  const { toast } = useToast();
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    question: '',
    answer: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadFAQItems();
  }, []);

  const loadFAQItems = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setFaqItems(data || []);
    } catch (error) {
      console.error('Failed to load FAQ items:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить FAQ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      display_order: 0,
      is_active: true,
    });
    setEditingId(null);
  };

  const openAddDialog = () => {
    resetForm();
    const nextOrder = faqItems.length > 0 ? Math.max(...faqItems.map(f => f.display_order)) + 1 : 1;
    setFormData(prev => ({ ...prev, display_order: nextOrder }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: FAQItem) => {
    setFormData({
      question: item.question,
      answer: item.answer,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveFAQItem = useCallback(async () => {
    if (!formData.question || !formData.answer) {
      toast({
        title: 'Ошибка',
        description: 'Заполните вопрос и ответ',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('faq_items')
          .update({
            question: formData.question,
            answer: formData.answer,
            display_order: formData.display_order,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;

        setFaqItems(prev => prev.map(item =>
          item.id === editingId
            ? {
                ...item,
                question: formData.question,
                answer: formData.answer,
                display_order: formData.display_order,
                is_active: formData.is_active,
              }
            : item
        ));

        toast({
          title: 'Успешно',
          description: 'FAQ обновлён',
        });
      } else {
        const { data, error } = await supabase
          .from('faq_items')
          .insert({
            question: formData.question,
            answer: formData.answer,
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setFaqItems(prev => [...prev, data]);

        toast({
          title: 'Успешно',
          description: 'Новый FAQ добавлен',
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save FAQ item:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить FAQ',
        variant: 'destructive',
      });
    }
  }, [editingId, formData, toast]);

  const deleteFAQItem = useCallback(async (id: string) => {
    if (!confirm('Вы уверены? Это действие нельзя отменить.')) return;

    try {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFaqItems(prev => prev.filter(item => item.id !== id));

      toast({
        title: 'Успешно',
        description: 'FAQ удалён',
      });
    } catch (error) {
      console.error('Failed to delete FAQ item:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить FAQ',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleCheckboxChange = useCallback((id: string, currentIsActive: boolean) => {
    const newIsActive = !currentIsActive;

    setFaqItems(prev => prev.map(item =>
      item.id === id ? { ...item, is_active: newIsActive } : item
    ));

    (async () => {
      try {
        const { error } = await supabase
          .from('faq_items')
          .update({ is_active: newIsActive })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Успешно',
          description: newIsActive ? 'FAQ активирован' : 'FAQ деактивирован',
        });
      } catch (error) {
        console.error('Failed to update FAQ visibility:', error);

        setFaqItems(prev => prev.map(item =>
          item.id === id ? { ...item, is_active: currentIsActive } : item
        ));

        toast({
          title: 'Ошибка',
          description: 'Не удалось изменить видимость',
          variant: 'destructive',
        });
      }
    })();
  }, [toast]);

  if (isLoading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Управление FAQ</h2>
          <p className="text-muted-foreground">
            {faqItems.length} вопросов
          </p>
        </div>
        <Button onClick={openAddDialog}>
          + Добавить вопрос
        </Button>
      </div>

      <div className="space-y-3">
        {faqItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-none bg-white p-4 flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={item.is_active}
                onCheckedChange={() => handleCheckboxChange(item.id, item.is_active)}
                className="mt-1"
                aria-label={`Toggle visibility for ${item.question}`}
              />
              <div className="flex-1">
                <p className="font-medium">{item.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
                <p className="text-xs text-muted-foreground mt-2">Порядок: {item.display_order}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(item)}
              >
                Редактировать
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteFAQItem(item.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {faqItems.length === 0 && (
        <p className="text-center py-10 text-muted-foreground">FAQ не добавлены</p>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Редактировать FAQ' : 'Добавить новый вопрос'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Вопрос *</label>
              <Input
                placeholder="Введите вопрос"
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ответ *</label>
              <Textarea
                placeholder="Введите ответ"
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Порядок отображения</label>
              <Input
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <Checkbox
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <label className="text-sm font-medium">Активный (видимый)</label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={saveFAQItem}
                className="flex-1"
              >
                {editingId ? 'Сохранить изменения' : 'Добавить вопрос'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
