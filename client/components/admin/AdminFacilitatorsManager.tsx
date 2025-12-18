import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminSEOEditor from './AdminSEOEditor';
import { generateSlug } from '@/lib/slug-generator';

interface Facilitator {
  id: string;
  name: string;
  city: string;
  tagline: string;
  email: string;
  slug?: string;
  description?: string;
  is_active: boolean;
  photo?: string;
  video_url?: string;
  cost?: string;
  sort_method?: string;
  sort_order?: number;
  featured?: boolean;
}

interface FormData {
  name: string;
  email: string;
  city: string;
  tagline: string;
  slug: string;
  description: string;
  photo: string;
  video_url: string;
  cost: string;
  password: string;
  is_active: boolean;
  sort_method: string;
  sort_order: number;
  featured: boolean;
}

export default function AdminFacilitatorsManager() {
  const { toast } = useToast();
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    city: '',
    tagline: '',
    slug: '',
    description: '',
    photo: '',
    video_url: '',
    cost: '',
    password: '',
    is_active: true,
    sort_method: 'random',
    sort_order: 0,
    featured: false,
  });

  useEffect(() => {
    loadFacilitators();
  }, []);

  const loadFacilitators = async () => {
    try {
      const { data, error } = await supabase
        .from('facilitators')
        .select('id, name, city, tagline, email, slug, description, is_active, photo, video_url, cost, sort_method, sort_order, featured');

      if (error) throw error;
      setFacilitators(data || []);
    } catch (error) {
      console.error('Failed to load facilitators:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фасилитаторов',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      city: '',
      tagline: '',
      slug: '',
      description: '',
      photo: '',
      video_url: '',
      cost: '',
      password: '',
      is_active: true,
      sort_method: 'random',
      sort_order: 0,
      featured: false,
    });
    setEditingId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (facilitator: Facilitator) => {
    setFormData({
      name: facilitator.name,
      email: facilitator.email,
      city: facilitator.city,
      tagline: facilitator.tagline,
      slug: facilitator.slug || '',
      description: facilitator.description || '',
      photo: facilitator.photo || '',
      video_url: facilitator.video_url || '',
      cost: facilitator.cost || '',
      password: '',
      is_active: facilitator.is_active,
      sort_method: facilitator.sort_method || 'random',
      sort_order: facilitator.sort_order || 0,
      featured: facilitator.featured || false,
    });
    setEditingId(facilitator.id);
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveFacilitator = useCallback(async () => {
    if (!formData.name || !formData.email || !formData.city || !formData.tagline) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля: имя, email, город, таглайн',
        variant: 'destructive',
      });
      return;
    }

    if (!editingId && !formData.password) {
      toast({
        title: 'Ошибка',
        description: 'Для новых фасилитаторов обязательно установить пароль',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate slug if not provided
      let slug = formData.slug || generateSlug(formData.name);

      // Ensure slug is not empty
      if (!slug) {
        // Fallback: use timestamp-based slug if generation fails
        slug = `facilitator-${Date.now()}`;
      }

      // For new facilitators, check if slug already exists and make it unique if needed
      if (!editingId && slug) {
        const { data: existingFacilitator } = await supabase
          .from('facilitators')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existingFacilitator) {
          // Slug already exists, append timestamp to make it unique
          slug = `${slug}-${Date.now()}`;
        }
      }

      if (editingId) {
        // Update existing
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          city: formData.city,
          tagline: formData.tagline,
          slug: slug,
          description: formData.description,
          photo: formData.photo,
          video_url: formData.video_url,
          cost: formData.cost,
          is_active: formData.is_active,
          sort_method: formData.sort_method,
          sort_order: formData.sort_order,
          featured: formData.featured,
          updated_at: new Date().toISOString(),
        };

        if (formData.password) {
          updateData.password_hash = formData.password;
        }

        const { error } = await supabase
          .from('facilitators')
          .update(updateData)
          .eq('id', editingId);

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        setFacilitators(prev => prev.map(f =>
          f.id === editingId
            ? {
                ...f,
                name: formData.name,
                email: formData.email,
                city: formData.city,
                tagline: formData.tagline,
                slug: slug,
                description: formData.description,
                photo: formData.photo,
                video_url: formData.video_url,
                cost: formData.cost,
                is_active: formData.is_active,
                sort_method: formData.sort_method,
                sort_order: formData.sort_order,
                featured: formData.featured,
              }
            : f
        ));

        toast({
          title: 'Успешно',
          description: 'Фасилитатор обновлен',
        });
      } else {
        // Create new
        const insertData: any = {
          name: formData.name,
          email: formData.email,
          city: formData.city,
          tagline: formData.tagline,
          slug: slug,
          password_hash: formData.password,
          is_active: formData.is_active,
          sort_method: formData.sort_method,
          sort_order: formData.sort_order,
          featured: formData.featured,
        };

        // Only include optional fields if they have values
        if (formData.description) insertData.description = formData.description;
        if (formData.photo) insertData.photo = formData.photo;
        if (formData.video_url) insertData.video_url = formData.video_url;
        if (formData.cost) insertData.cost = formData.cost;

        console.log('Creating facilitator with data:', insertData);

        const { data, error } = await supabase
          .from('facilitators')
          .insert(insertData)
          .select('id, name, city, tagline, email, slug, description, is_active, photo, video_url, cost, sort_method, sort_order, featured')
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        if (data) setFacilitators(prev => [...prev, data]);

        toast({
          title: 'Успешно',
          description: 'Новый фасилитатор добавлен',
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save facilitator:', error);
      let errorMessage = 'Неизвестная ошибка';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error objects
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

  const handleCheckboxChange = useCallback((id: string, currentIsActive: boolean) => {
    const newIsActive = !currentIsActive;

    // Update UI immediately for better UX
    setFacilitators(prev => prev.map(f =>
      f.id === id ? { ...f, is_active: newIsActive } : f
    ));

    // Update database
    (async () => {
      try {
        const { error } = await supabase
          .from('facilitators')
          .update({ is_active: newIsActive })
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast({
          title: 'Успешно',
          description: newIsActive ? 'Фасилитатор активирован' : 'Фасилитатор деактивирован',
        });
      } catch (error) {
        console.error('Failed to update visibility:', error);

        // Revert UI on error
        setFacilitators(prev => prev.map(f =>
          f.id === id ? { ...f, is_active: currentIsActive } : f
        ));

        toast({
          title: 'Ошибка',
          description: 'Не удалось изменить видимость',
          variant: 'destructive',
        });
      }
    })();
  }, [toast]);

  const deleteFacilitator = useCallback(async (id: string) => {
    if (!confirm('Вы уверены? Это действие нельзя отменить.')) return;

    try {
      const { error } = await supabase
        .from('facilitators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFacilitators(prev => prev.filter(f => f.id !== id));

      toast({
        title: 'Успешно',
        description: 'Фасилитатор удален',
      });
    } catch (error) {
      console.error('Failed to delete facilitator:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить фасилитатора',
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
          <h2 className="text-xl font-bold mb-2">Управление фасилитаторами</h2>
          <p className="text-muted-foreground">
            {facilitators.length} фасилитаторов
          </p>
        </div>
        <Button onClick={openAddDialog}>
          + Добавить фасилитатора
        </Button>
      </div>

      <div className="space-y-3">
        {facilitators.map((facilitator) => (
          <div
            key={facilitator.id}
            className="border rounded-none bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={facilitator.is_active}
                  onCheckedChange={() => handleCheckboxChange(facilitator.id, facilitator.is_active)}
                  className="mt-1"
                  aria-label={`Toggle visibility for ${facilitator.name}`}
                />
                <div className="flex-1">
                  <p className="font-medium">{facilitator.name}</p>
                  <p className="text-sm text-muted-foreground">{facilitator.city}</p>
                  <p className="text-xs text-muted-foreground">{facilitator.email}</p>
                  {facilitator.tagline && (
                    <p className="text-sm text-gray-600 mt-1">{facilitator.tagline}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(facilitator)}
              >
                Редактировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = `/energopraktiki/${facilitator.slug || facilitator.id}`}
              >
                Просмотр
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteFacilitator(facilitator.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {facilitators.length === 0 && (
        <p className="text-center py-10 text-muted-foreground">Фасилитаторы не добавлены</p>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Редактировать фасилитатора' : 'Добавить нового фасилитатора'}
            </DialogTitle>
          </DialogHeader>

          {editingId ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Основная информация</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
            {/* Required Fields */}
            <div>
              <label className="text-sm font-medium">Имя *</label>
              <Input
                placeholder="ФИО фасилитатора"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email (логин для входа) *</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Пароль {editingId ? '(оставить пустым, чтобы не менять)' : '*'}
              </label>
              <Input
                type="password"
                placeholder={editingId ? 'Не заполнять, если пароль не менять' : 'Установить пароль для нового фасилитатора'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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
              <label className="text-sm font-medium">Таглайн *</label>
              <Input
                placeholder="Краткое описание специализации"
                value={formData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">URL Slug (для URL страницы)</label>
              <Input
                placeholder={generateSlug(formData.name || 'name')}
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Если не заполнено, будет создан автоматически из имени</p>
            </div>

            {/* Optional Fields */}
            <div>
              <label className="text-sm font-medium">Описание</label>
              <Textarea
                placeholder="Подробное описание фасилитатора"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Фото (URL)</label>
              <Input
                placeholder="https://example.com/photo.jpg"
                value={formData.photo}
                onChange={(e) => handleInputChange('photo', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Видео (URL)</label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Стоимость</label>
              <Input
                placeholder="от 5000 рублей"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <Checkbox
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <label className="text-sm font-medium">Активный (видимый на сайте)</label>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Сортировка и показ</h3>

              <div>
                <label className="text-sm font-medium">Способ сортировки</label>
                <select
                  value={formData.sort_method}
                  onChange={(e) => handleInputChange('sort_method', e.target.value)}
                  className="w-full mt-1 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring"
                >
                  <option value="random">В случайном порядке (меняется при обновлении)</option>
                  <option value="rating">По рейтингу (выше оценка первой)</option>
                  <option value="created_at_desc">По дате добавления (новые сверху)</option>
                  <option value="created_at_asc">По дате добавления (старые сверху)</option>
                  <option value="custom_order">Пользовательский порядок</option>
                </select>
              </div>

              {formData.sort_method === 'custom_order' && (
                <div className="mt-3">
                  <label className="text-sm font-medium">Порядок отображения (меньше = выше на странице)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 py-3">
                <Checkbox
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
                <label className="text-sm font-medium">Закрепить на главной странице (будет отображаться всегда первым)</label>
              </div>
            </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={saveFacilitator}
                    className="flex-1"
                  >
                    {editingId ? 'Сохранить изменения' : 'Добавить фасилитатора'}
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
                {editingId && <AdminSEOEditor pageType="facilitator_detail" itemId={editingId} />}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {/* Required Fields */}
              <div>
                <label className="text-sm font-medium">Имя *</label>
                <Input
                  placeholder="ФИО фасилитатора"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email (логин для входа) *</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Пароль {editingId ? '(оставить пустым, чтобы не менять)' : '*'}
                </label>
                <Input
                  type="password"
                  placeholder={editingId ? 'Не заполнять, если пароль не менять' : 'Установить пароль для нового фасилитатора'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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
                <label className="text-sm font-medium">Таглайн *</label>
                <Input
                  placeholder="Краткое описание специализации"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">URL Slug (для URL страницы)</label>
                <Input
                  placeholder={generateSlug(formData.name || 'name')}
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Если не заполнено, будет создан автоматически из имени</p>
              </div>

              {/* Optional Fields */}
              <div>
                <label className="text-sm font-medium">Описание</label>
                <Textarea
                  placeholder="Подробное описание фасилитатора"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Фото (URL)</label>
                <Input
                  placeholder="https://example.com/photo.jpg"
                  value={formData.photo}
                  onChange={(e) => handleInputChange('photo', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Видео (URL)</label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => handleInputChange('video_url', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Стоимость</label>
                <Input
                  placeholder="от 5000 рублей"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <Checkbox
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <label className="text-sm font-medium">Активный (видимый на сайте)</label>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Сортировка и показ</h3>

                <div>
                  <label className="text-sm font-medium">Способ сортировки</label>
                  <select
                    value={formData.sort_method}
                    onChange={(e) => handleInputChange('sort_method', e.target.value)}
                    className="w-full mt-1 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring"
                  >
                    <option value="random">В случайном порядке (меняется при обновлении)</option>
                    <option value="rating">По рейтингу (выше оценка первой)</option>
                    <option value="created_at_desc">По дате добавления (новые сверху)</option>
                    <option value="created_at_asc">По дате добавления (старые сверху)</option>
                    <option value="custom_order">Пользовательский порядок</option>
                  </select>
                </div>

                {formData.sort_method === 'custom_order' && (
                  <div className="mt-3">
                    <label className="text-sm font-medium">Порядок отображения (меньше = выше на странице)</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.sort_order}
                      onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 py-3">
                  <Checkbox
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                  <label className="text-sm font-medium">Закрепить на главной странице (будет отображаться всегда первым)</label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={saveFacilitator}
                  className="flex-1"
                >
                  {editingId ? 'Сохранить изменения' : 'Добавить фасилитатора'}
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

      <AdminSEOEditor pageType="facilitators_list" />
    </div>
  );
}
