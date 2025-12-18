import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AdminSEOEditor from './AdminSEOEditor';

interface Contacts {
  id: string;
  phone: string;
  email: string;
  telegram: string;
  whatsapp: string;
  vk_link: string;
  instagram_link: string;
  youtube_link: string;
  rutube_link: string;
  response_time: string;
  working_hours: string;
}

export default function AdminContactsManager() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contacts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('site_contacts')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setContacts(data || {
        id: 'main',
        phone: '',
        email: '',
        telegram: '',
        whatsapp: '',
        vk_link: '',
        instagram_link: '',
        youtube_link: '',
        rutube_link: '',
        response_time: '',
        working_hours: '',
      });
    } catch (error) {
      console.error('Failed to load contacts:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить контакты',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contacts) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('site_contacts')
        .upsert(contacts);

      if (error) throw error;
      
      toast({
        title: 'Успешно',
        description: 'Контакты сохранены',
      });
    } catch (error) {
      console.error('Failed to save contacts:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить контакты',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !contacts) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Управление контактами</h2>

      <div className="grid gap-6 max-w-2xl">
        <div>
          <label className="text-sm font-medium">Телефон</label>
          <Input
            value={contacts.phone}
            onChange={(e) => setContacts({ ...contacts, phone: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            value={contacts.email}
            onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Telegram</label>
          <Input
            value={contacts.telegram}
            onChange={(e) => setContacts({ ...contacts, telegram: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">WhatsApp</label>
          <Input
            value={contacts.whatsapp}
            onChange={(e) => setContacts({ ...contacts, whatsapp: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">VK</label>
          <Input
            value={contacts.vk_link}
            onChange={(e) => setContacts({ ...contacts, vk_link: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Instagram</label>
          <Input
            value={contacts.instagram_link}
            onChange={(e) => setContacts({ ...contacts, instagram_link: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">YouTube</label>
          <Input
            value={contacts.youtube_link}
            onChange={(e) => setContacts({ ...contacts, youtube_link: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Rutube</label>
          <Input
            value={contacts.rutube_link}
            onChange={(e) => setContacts({ ...contacts, rutube_link: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Время ответа</label>
          <Textarea
            value={contacts.response_time}
            onChange={(e) => setContacts({ ...contacts, response_time: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Время работы</label>
          <Textarea
            value={contacts.working_hours}
            onChange={(e) => setContacts({ ...contacts, working_hours: e.target.value })}
            className="mt-1"
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить контакты'}
        </Button>
      </div>

      <AdminSEOEditor pageType="contacts" />
    </div>
  );
}
