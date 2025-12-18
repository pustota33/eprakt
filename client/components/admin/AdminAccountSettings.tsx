import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AdminAccountSettings() {
  const { email, updateCredentials, isLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState(email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword) {
      toast({
        title: 'Ошибка',
        description: 'Введите текущий пароль',
        variant: 'destructive',
      });
      return;
    }

    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный email',
        variant: 'destructive',
      });
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 3 символов',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateCredentials(currentPassword, newEmail, newPassword);
      
      if (result.success) {
        toast({
          title: 'Успешно',
          description: 'Данные учётной записи обновлены. При следующем входе используйте новые данные.',
        });
        
        // Reset form
        setCurrentPassword('');
        setNewEmail(email || '');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: 'Ошибка',
          description: result.error || 'Не удалось обновить данные',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Параметры учётной записи</h2>

      <form onSubmit={handleSubmit} className="grid gap-6 max-w-2xl">
        {/* Current Email Display */}
        <div>
          <label className="text-sm font-medium">Текущий email</label>
          <Input
            type="text"
            value={email || ''}
            disabled
            className="mt-1"
          />
        </div>

        {/* Current Password */}
        <div>
          <label className="text-sm font-medium">Текущий пароль *</label>
          <div className="relative mt-1">
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrentPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Требуется для подтверждения изменений</p>
        </div>

        {/* New Email */}
        <div>
          <label className="text-sm font-medium">Новый email</label>
          <Input
            type="email"
            placeholder="new@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="text-sm font-medium">Новый пароль</label>
          <div className="relative mt-1">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNewPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm font-medium">Подтвердить пароль</label>
          <div className="relative mt-1">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Обновление...' : 'Сохранить изменения'}
        </Button>

        <p className="text-xs text-muted-foreground">
          * Поле обязательно для всех изменений
        </p>
      </form>
    </div>
  );
}
