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

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date_text: string;
  excerpt?: string;
  image?: string;
  reading_time?: string;
  content?: string;
  is_active?: boolean;
  show_on_home?: boolean;
}

interface FormData {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date_text: string;
  reading_time: string;
  content: string;
  slug: string;
  is_active: boolean;
  show_on_home: boolean;
}

export default function AdminBlogManager() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    excerpt: '',
    image: '',
    category: '',
    date_text: new Date().toISOString().split('T')[0],
    reading_time: '5 мин',
    content: '',
    slug: '',
    is_active: true,
    show_on_home: false,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, category, date_text, excerpt, image, reading_time, content, is_active, show_on_home, slug')
        .order('display_order');

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статьи',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      image: '',
      category: '',
      date_text: new Date().toISOString().split('T')[0],
      reading_time: '5 мин',
      content: '',
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

  const openEditDialog = (post: BlogPost & { slug?: string }) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      image: post.image || '',
      category: post.category,
      date_text: post.date_text,
      reading_time: post.reading_time || '5 мин',
      content: post.content || '',
      slug: post.slug || '',
      is_active: post.is_active || true,
      show_on_home: post.show_on_home || false,
    });
    setEditingId(post.id);
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const savePost = useCallback(async () => {
    if (!formData.title || !formData.category || !formData.date_text) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля: название, категория, дата',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate slug if not provided
      let slug = formData.slug || generateSlug(formData.title);

      // Ensure slug is not empty
      if (!slug) {
        slug = `blog-post-${Date.now()}`;
      }

      // For new posts, check if slug already exists and make it unique if needed
      if (!editingId && slug) {
        const { data: existingPost } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existingPost) {
          slug = `${slug}-${Date.now()}`;
        }
      }

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: formData.title,
            excerpt: formData.excerpt,
            image: formData.image,
            category: formData.category,
            date_text: formData.date_text,
            reading_time: formData.reading_time,
            content: formData.content,
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

        setPosts(prev => prev.map(p =>
          p.id === editingId
            ? {
                ...p,
                title: formData.title,
                excerpt: formData.excerpt,
                image: formData.image,
                category: formData.category,
                date_text: formData.date_text,
                reading_time: formData.reading_time,
                content: formData.content,
                is_active: formData.is_active,
                show_on_home: formData.show_on_home,
              }
            : p
        ));

        toast({
          title: 'Успешно',
          description: 'Статья обновлена',
        });
      } else {
        // Create new
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            title: formData.title,
            excerpt: formData.excerpt,
            image: formData.image,
            category: formData.category,
            date_text: formData.date_text,
            reading_time: formData.reading_time,
            content: formData.content,
            slug: slug,
            is_active: formData.is_active,
            show_on_home: formData.show_on_home,
          })
          .select('id, title, category, date_text, excerpt, image, reading_time, content, is_active, show_on_home, slug')
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        if (data) setPosts(prev => [...prev, data]);

        toast({
          title: 'Успешно',
          description: 'Новая статья добавлена',
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save post:', error);
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

  const deletePost = useCallback(async (id: string) => {
    if (!confirm('Удалить статью?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Успешно',
        description: 'Статья удалена',
      });
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить статью',
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
          <h2 className="text-xl font-bold mb-2">Управление блогом</h2>
          <p className="text-muted-foreground">
            {posts.length} статей
          </p>
        </div>
        <Button onClick={openAddDialog}>
          + Добавить статью
        </Button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border rounded-none bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex-1">
              <p className="font-medium">{post.title}</p>
              <p className="text-sm text-muted-foreground">
                {post.category} • {post.date_text} • {post.reading_time}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(post)}
              >
                Редактировать
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deletePost(post.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center py-10 text-muted-foreground">Статьи не добавлены</p>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Редактировать статью' : 'Добавить новую статью'}
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
                placeholder="Заголовок статьи"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Категория *</label>
              <Input
                placeholder="Основы, Практика, Гид, и т.д."
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Дата *</label>
              <Input
                type="date"
                value={formData.date_text}
                onChange={(e) => handleInputChange('date_text', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Время чтения</label>
              <Input
                placeholder="5 мин"
                value={formData.reading_time}
                onChange={(e) => handleInputChange('reading_time', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Краткое описание (выдержка)</label>
              <Textarea
                placeholder="Краткое описание для превью"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Полное содержание</label>
              <Textarea
                placeholder="Полный текст статьи"
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

            <div className="flex items-center gap-2 py-2">
              <Checkbox
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <label className="text-sm font-medium">Активная (видимая на сайте)</label>
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
                    onClick={savePost}
                    className="flex-1"
                  >
                    {editingId ? 'Сохранить изменения' : 'Добавить статью'}
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
                {editingId && <AdminSEOEditor pageType="blog_post_detail" itemId={editingId} />}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Название *</label>
                <Input
                  placeholder="Заголовок статьи"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Категория *</label>
                <Input
                  placeholder="Основы, Практика, Гид, и т.д."
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Дата *</label>
                <Input
                  type="date"
                  value={formData.date_text}
                  onChange={(e) => handleInputChange('date_text', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Время чтения</label>
                <Input
                  placeholder="5 мин"
                  value={formData.reading_time}
                  onChange={(e) => handleInputChange('reading_time', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Краткое описание (выдержка)</label>
                <Textarea
                  placeholder="Краткое описание для превью"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Полное содержание</label>
                <Textarea
                  placeholder="Полный текст статьи"
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

              <div className="flex items-center gap-2 py-2">
                <Checkbox
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <label className="text-sm font-medium">Активная (видимая на сайте)</label>
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
                  onClick={savePost}
                  className="flex-1"
                >
                  {editingId ? 'Сохранить изменения' : 'Добавить статью'}
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

      <AdminSEOEditor pageType="blog_list" />
    </div>
  );
}
