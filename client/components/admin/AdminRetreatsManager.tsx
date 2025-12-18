import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { generateSlug } from '@/lib/slug-generator';
import AdminSEOEditor from './AdminSEOEditor';

interface Retreat {
  id: string;
  title: string;
  city: string;
  date_text: string;
  price_from: number;
  image?: string;
  description?: string;
  content?: string;
  format?: string[];
  link?: string;
  is_active?: boolean;
  show_on_home?: boolean;
}

interface FormData {
  title: string;
  city: string;
  date_text: string;
  price_from: number;
  image: string;
  description: string;
  content: string;
  format: string[];
  link: string;
  slug: string;
  is_active: boolean;
  show_on_home: boolean;
}

export default function AdminRetreatsManager() {
  const { toast } = useToast();
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    city: '',
    date_text: '',
    price_from: 0,
    image: '',
    description: '',
    content: '',
    format: ['Оффлайн'],
    link: '',
    slug: '',
    is_active: true,
    show_on_home: false,
  });

  useEffect(() => {
    loadRetreats();
  }, []);

  const loadRetreats = async () => {
    try {
      const { data, error } = await supabase
        .from('retreats')
        .select('id, title, city, date_text, price_from, image, description, content, format, link, is_active, show_on_home, slug')
        .order('display_order');

      if (error) throw error;
      setRetreats(data || []);
    } catch (error) {
      console.error('Failed to load retreats:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить ретриты',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      city: '',
      date_text: '',
      price_from: 0,
      image: '',
      description: '',
      content: '',
      format: ['Оффлайн'],
      link: '',
      slug: '',
      is_active: true,
      show_on_home: false,
    });
    setEditingId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (retreat: Retreat & { slug?: string }) => {
    setFormData({
      title: retreat.title,
      city: retreat.city,
      date_text: retreat.date_text,
      price_from: retreat.price_from || 0,
      image: retreat.image || '',
      description: retreat.description || '',
      content: retreat.content || '',
      format: retreat.format || ['Оффлайн'],
      link: retreat.link || '',
      slug: retreat.slug || '',
      is_active: retreat.is_active || true,
      show_on_home: retreat.show_on_home || false,
    });
    setEditingId(retreat.id);
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveRetreat = useCallback(async () => {
    if (!formData.title || !formData.city || !formData.date_text) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля: название, город, дату',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate slug if not provided
      let slug = formData.slug || generateSlug(formData.title);

      // Ensure slug is not empty
      if (!slug) {
        slug = `retreat-${Date.now()}`;
      }

      // For new retreats, check if slug already exists and make it unique if needed
      if (!editingId && slug) {
        const { data: existingRetreat } = await supabase
          .from('retreats')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existingRetreat) {
          slug = `${slug}-${Date.now()}`;
        }
      }

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('retreats')
          .update({
            title: formData.title,
            city: formData.city,
            date_text: formData.date_text,
            price_from: formData.price_from,
            image: formData.image,
            description: formData.description,
            content: formData.content,
            format: formData.format,
            link: formData.link,
            slug: slug,
            is_active: formData.is_active,
            show_on_home: formData.show_on_home,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        setRetreats(prev => prev.map(r =>
          r.id === editingId
            ? {
                ...r,
                title: formData.title,
                city: formData.city,
                date_text: formData.date_text,
                price_from: formData.price_from,
                image: formData.image,
                description: formData.description,
                content: formData.content,
                format: formData.format,
                link: formData.link,
                is_active: formData.is_active,
                show_on_home: formData.show_on_home,
              }
            : r
        ));

        toast({
          title: 'Успешно',
          description: 'Ретрит обновлен',
        });
      } else {
        // Create new
        const { data, error } = await supabase
          .from('retreats')
          .insert({
            title: formData.title,
            city: formData.city,
            date_text: formData.date_text,
            price_from: formData.price_from,
            image: formData.image,
            description: formData.description,
            content: formData.content,
            format: formData.format,
            link: formData.link,
            slug: slug,
            is_active: formData.is_active,
            show_on_home: formData.show_on_home,
          })
          .select('id, title, city, date_text, price_from, image, description, content, format, link, is_active, show_on_home, slug')
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        if (data) setRetreats(prev => [...prev, data]);

        toast({
          title: 'Успешно',
          description: 'Новый ретрит добавлен',
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save retreat:', error);
      let errorMessage = 'Неизвестная ошибка';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const supabaseError = error as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.details) {
          errorMessage = supabaseError.details;
        } else {
          errorMessage = JSON.stringify(error);
        }
      }

      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [editingId, formData, toast]);

  const deleteRetreat = useCallback(async (id: string) => {
    if (!confirm('Удалить ретрит?')) return;

    try {
      const { error } = await supabase
        .from('retreats')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRetreats(prev => prev.filter(r => r.id !== id));
      toast({
        title: 'Успешно',
        description: 'Ретрит удален',
      });
    } catch (error) {
      console.error('Failed to delete retreat:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить ретрит',
        variant: 'destructive',
      });
    }
  }, [toast]);

  if (isLoading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Управление ретритами</h2>
          <p className="text-muted-foreground">
            {retreats.length} ретритов
          </p>
        </div>
        <Button onClick={openAddDialog}>
          + Добавить ретрит
        </Button>
      </div>

      <div className="space-y-3">
        {retreats.map((retreat) => (
          <div
            key={retreat.id}
            className="border rounded-none bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex-1">
              <p className="font-medium">{retreat.title}</p>
              <p className="text-sm text-muted-foreground">
                {retreat.city} • {retreat.date_text} • {retreat.price_from?.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(retreat)}
              >
                Редактировать
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteRetreat(retreat.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {retreats.length === 0 && (
        <p className="text-center py-10 text-muted-foreground">Ретриты не добавлены</p>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Редактировать ретрит' : 'Добавить новый ретрит'}
            </DialogTitle>
          </DialogHeader>

          {editingId ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Основная информация</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название *</label>
              <Input
                placeholder="Название ретрита"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Город *</label>
              <Input
                placeholder="Москва"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Дата *</label>
              <Input
                placeholder="12–15 Окт 2025"
                value={formData.date_text}
                onChange={(e) => handleInputChange('date_text', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Цена (от)</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.price_from}
                onChange={(e) => handleInputChange('price_from', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Описание</label>
              <Textarea
                placeholder="Подробное описание ретрита"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Полное содержание</label>
              <Textarea
                placeholder="Полный текст содержания ретрита"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Изображение (URL)</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ссылка для записи</label>
              <Input
                placeholder="https://example.com/signup"
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <Checkbox
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <label className="text-sm font-medium">Активный (видимый на сайте)</label>
            </div>

            <div className="flex items-center gap-2 py-2">
              <Checkbox
                checked={formData.show_on_home}
                onCheckedChange={(checked) => handleInputChange('show_on_home', checked)}
              />
              <label className="text-sm font-medium">Показывать на главной странице</label>
            </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={saveRetreat}
                    className="flex-1"
                  >
                    {editingId ? 'Сохранить изменения' : 'Добавить ретрит'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="seo" className="space-y-4">
                {editingId && <AdminSEOEditor pageType="retreat_detail" itemId={editingId} />}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Название *</label>
                <Input
                  placeholder="Название ретрита"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Город *</label>
                <Input
                  placeholder="Москва"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Дата *</label>
                <Input
                  placeholder="12–15 Окт 2025"
                  value={formData.date_text}
                  onChange={(e) => handleInputChange('date_text', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Цена (от)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.price_from}
                  onChange={(e) => handleInputChange('price_from', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Описание</label>
                <Textarea
                  placeholder="Подробное описание ретрита"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Полное содержание</label>
                <Textarea
                  placeholder="Полный текст содержания ретрита"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="min-h-[150px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Изображение (URL)</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Ссылка для записи</label>
                <Input
                  placeholder="https://example.com/signup"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <Checkbox
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <label className="text-sm font-medium">Активный (видимый на сайте)</label>
              </div>

              <div className="flex items-center gap-2 py-2">
                <Checkbox
                  checked={formData.show_on_home}
                  onCheckedChange={(checked) => handleInputChange('show_on_home', checked)}
                />
                <label className="text-sm font-medium">Показывать на главной странице</label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={saveRetreat}
                  className="flex-1"
                >
                  {editingId ? 'Сохранить изменения' : 'Добавить ретрит'}
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
          )}
        </DialogContent>
      </Dialog>

      <AdminSEOEditor pageType="retreats_list" />
    </div>
  );
}
