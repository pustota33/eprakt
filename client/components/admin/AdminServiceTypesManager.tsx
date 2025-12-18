import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ServiceType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function AdminServiceTypesManager() {
  const { toast } = useToast();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadServiceTypes();
  }, []);

  const loadServiceTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setServiceTypes(data || []);
    } catch (error) {
      console.error('Failed to load service types:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить типы услуг',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название типа услуги',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('service_types')
        .insert([{ name: newName }]);

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Тип услуги добавлен',
      });
      setNewName('');
      setIsDialogOpen(false);
      await loadServiceTypes();
    } catch (error) {
      console.error('Failed to add service type:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить тип услуги',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название типа услуги',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('service_types')
        .update({ name: editingName })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Тип услуги обновлен',
      });
      setEditingId(null);
      setEditingName('');
      await loadServiceTypes();
    } catch (error) {
      console.error('Failed to update service type:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить тип услуги',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены? Это может повлиять на практиков, использующих эту услугу.')) {
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успешно',
        description: 'Тип услуги удален',
      });
      await loadServiceTypes();
    } catch (error) {
      console.error('Failed to delete service type:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить тип услуги',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Типы услуг практиков</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Добавить тип услуги</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый тип услуги</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Название типа услуги</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Например: Фасилитатор Кундалини"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAdd}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Добавление...' : 'Добавить'}
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

      <div className="space-y-2">
        {serviceTypes.length === 0 ? (
          <p className="text-muted-foreground">Типов услуг не добавлено</p>
        ) : (
          serviceTypes.map((serviceType) => (
            <div
              key={serviceType.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              {editingId === serviceType.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleEdit(serviceType.id)}
                    disabled={isSaving}
                  >
                    Сохранить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                  >
                    Отмена
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium">{serviceType.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(serviceType.id);
                        setEditingName(serviceType.name);
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(serviceType.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
