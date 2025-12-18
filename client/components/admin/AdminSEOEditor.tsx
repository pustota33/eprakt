import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface SEOData {
  id: string;
  pageType: string;
  itemId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

interface AdminSEOEditorProps {
  pageType: string;
  itemId?: string;
  onSaved?: () => void;
}

export default function AdminSEOEditor({ pageType, itemId, onSaved }: AdminSEOEditorProps) {
  const { toast } = useToast();
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSEOData();
  }, [pageType, itemId]);

  const loadSEOData = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('seo_settings')
        .select('*')
        .eq('page_type', pageType);

      if (itemId) {
        query = query.eq('item_id', itemId);
      } else {
        query = query.is('item_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      // Use the actual ID from DB if it exists, otherwise generate one
      const id = data?.id || (itemId ? `${pageType}_${itemId}` : pageType);

      setSeoData(data ? {
        id: data.id,
        pageType: data.page_type,
        itemId: data.item_id,
        metaTitle: data.meta_title || '',
        metaDescription: data.meta_description || '',
        metaImage: data.meta_image || '',
        ogTitle: data.og_title || '',
        ogDescription: data.og_description || '',
        ogImage: data.og_image || '',
      } : {
        id,
        pageType,
        itemId,
        metaTitle: '',
        metaDescription: '',
        metaImage: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
      });
    } catch (error) {
      console.error('AdminSEOEditor: Failed to load SEO data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить SEO данные',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!seoData) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('seo_settings')
        .upsert({
          id: seoData.id,
          page_type: pageType,
          item_id: itemId || null,
          meta_title: seoData.metaTitle || null,
          meta_description: seoData.metaDescription || null,
          meta_image: seoData.metaImage || null,
          og_title: seoData.ogTitle || null,
          og_description: seoData.ogDescription || null,
          og_image: seoData.ogImage || null,
        }, {
          onConflict: 'id',
        });

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'SEO данные сохранены',
      });

      // Reload data after successful save
      await loadSEOData();

      if (onSaved) onSaved();
    } catch (error) {
      console.error('Failed to save SEO data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить SEO данные',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !seoData) {
    return <div className="text-center py-4 text-muted-foreground">Загрузка SEO данных...</div>;
  }

  return (
    <div className="space-y-6 border-t pt-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">SEO настройки</h3>
        
        <div className="grid gap-6 max-w-2xl">
          {/* Meta Title */}
          <div>
            <label className="text-sm font-medium">Meta Title (заголовок в поиске)</label>
            <Input
              value={seoData.metaTitle || ''}
              onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
              className="mt-1"
              placeholder="Оптимальная длина: 30-60 символов"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seoData.metaTitle?.length || 0}/60 символов
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label className="text-sm font-medium">Meta Description (описание в поиске)</label>
            <Textarea
              value={seoData.metaDescription || ''}
              onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
              className="mt-1"
              placeholder="Оптимальная длина: 120-160 символов"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seoData.metaDescription?.length || 0}/160 символов
            </p>
          </div>

          {/* Meta Image */}
          <div>
            <label className="text-sm font-medium">Meta Image URL</label>
            <Input
              value={seoData.metaImage || ''}
              onChange={(e) => setSeoData({ ...seoData, metaImage: e.target.value })}
              className="mt-1"
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          {/* OG Title */}
          <div>
            <label className="text-sm font-medium">OG Title (для социальных сетей)</label>
            <Input
              value={seoData.ogTitle || ''}
              onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
              className="mt-1"
              placeholder="Заголовок при поделке в соцсетях"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seoData.ogTitle?.length || 0}/60 символов
            </p>
          </div>

          {/* OG Description */}
          <div>
            <label className="text-sm font-medium">OG Description (для социальных сетей)</label>
            <Textarea
              value={seoData.ogDescription || ''}
              onChange={(e) => setSeoData({ ...seoData, ogDescription: e.target.value })}
              className="mt-1"
              placeholder="Описание при поделке в соцсетях"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seoData.ogDescription?.length || 0}/160 символов
            </p>
          </div>

          {/* OG Image */}
          <div>
            <label className="text-sm font-medium">OG Image URL (для социальных сетей)</label>
            <Input
              value={seoData.ogImage || ''}
              onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
              className="mt-1"
              placeholder="https://example.com/og-image.jpg"
              type="url"
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="mt-4">
            {isSaving ? 'Сохранение SEO...' : 'Сохранить SEO данные'}
          </Button>
        </div>
      </div>
    </div>
  );
}
