import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  id: string;
  author_name: string;
  text: string;
  display_order: number;
}

export default function AdminTestimonialsManager() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('main_testimonials')
        .select('id, author_name, text, display_order')
        .order('display_order');

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить отзывы',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Удалить отзыв?')) return;

    try {
      const { error } = await supabase
        .from('main_testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTestimonials(testimonials.filter(t => t.id !== id));
      toast({
        title: 'Успешно',
        description: 'Отзыв удален',
      });
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить отзыв',
        variant: 'destructive',
      });
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newTestimonials = [...testimonials];
    [newTestimonials[index - 1].display_order, newTestimonials[index].display_order] = 
    [newTestimonials[index].display_order, newTestimonials[index - 1].display_order];
    
    try {
      await Promise.all(
        newTestimonials.map(t =>
          supabase.from('main_testimonials').update({ display_order: t.display_order }).eq('id', t.id)
        )
      );
      setTestimonials(newTestimonials.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось переместить отзыв',
        variant: 'destructive',
      });
    }
  };

  const moveDown = async (index: number) => {
    if (index === testimonials.length - 1) return;
    const newTestimonials = [...testimonials];
    [newTestimonials[index + 1].display_order, newTestimonials[index].display_order] = 
    [newTestimonials[index].display_order, newTestimonials[index + 1].display_order];
    
    try {
      await Promise.all(
        newTestimonials.map(t =>
          supabase.from('main_testimonials').update({ display_order: t.display_order }).eq('id', t.id)
        )
      );
      setTestimonials(newTestimonials.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось переместить отзыв',
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
        <h2 className="text-xl font-bold mb-4">Управление отзывами</h2>
        <p className="text-muted-foreground mb-6">Отзывы отображаются в карусели на главной странице</p>
      </div>

      <div className="space-y-3">
        {testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className="border rounded-none bg-white p-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveDown(index)}
                  disabled={index === testimonials.length - 1}
                >
                  ↓
                </Button>
              </div>
              <div className="flex-1">
                <p className="font-medium">{testimonial.author_name}</p>
                <p className="text-sm text-muted-foreground mt-2">{testimonial.text}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteTestimonial(testimonial.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <p className="text-center py-10 text-muted-foreground">Отзывы не добавлены</p>
      )}
    </div>
  );
}
