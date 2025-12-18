import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export default function AdminNewsletterManager() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить подписчиков',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Вы уверены, что хотите удалить ${email}?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubscribers(subscribers.filter(s => s.id !== id));
      toast({
        title: 'Успешно',
        description: 'Подписчик удалён',
      });
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить подписчика',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Email', 'Дата подписки', 'Активен'],
      ...subscribers.map(s => [
        s.email,
        new Date(s.subscribed_at).toLocaleDateString('ru-RU'),
        s.is_active ? 'Да' : 'Нет',
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Успешно',
      description: 'Список подписчиков экспортирован в CSV',
    });
  };

  if (isLoading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Подписчики рассылки</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Всего подписчиков: <strong>{subscribers.length}</strong>
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          Экспортировать CSV
        </Button>
      </div>

      {subscribers.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">Пока нет подписчиков</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Дата подписки</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Действие</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">{subscriber.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(subscriber.subscribed_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                      subscriber.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscriber.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(subscriber.id, subscriber.email)}
                      disabled={isDeleting === subscriber.id}
                      className="inline-flex items-center gap-1 rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
