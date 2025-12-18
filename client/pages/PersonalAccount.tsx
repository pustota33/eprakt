import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import SEO from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';

interface Schedule {
  id: string;
  city: string;
  date: string;
  location: string;
  time: string;
  cost: string;
}

interface Review {
  id: string;
  name: string;
  text: string;
  photo: string;
}

interface Facilitator {
  id: string;
  name: string;
  city: string;
  cities: string;
  tagline: string;
  description: string;
  rating: number;
  sessions: string[];
  format: string[];
  cost: string;
  photo: string;
  video_url: string;
  title_prefix: string;
  cta_text: string;
  cta_href: string;
  service_types: string[];
  contacts: {
    telegram?: string;
    whatsapp?: string;
    email?: string;
  };
  reviews: Review[];
  schedule: Schedule[];
}

export default function PersonalAccount() {
  const { facilitatorId, logout } = useAuth();
  const { toast } = useToast();
  const [facilitator, setFacilitator] = useState<Facilitator | null>(null);
  const [availableServiceTypes, setAvailableServiceTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    loadFacilitatorData();
    loadServiceTypes();
  }, [facilitatorId]);

  const loadServiceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAvailableServiceTypes(data || []);
    } catch (error) {
      console.error('Failed to load service types:', error);
    }
  };

  const loadFacilitatorData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('facilitators')
        .select('*')
        .eq('id', facilitatorId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Ensure all string fields have values (not undefined)
        const facilitatorData: Facilitator = {
          ...data,
          name: data.name || '',
          city: data.city || '',
          cities: data.cities || '',
          tagline: data.tagline || '',
          description: data.description || '',
          photo: data.photo || '',
          video_url: data.video_url || '',
          cost: data.cost || '',
          title_prefix: data.title_prefix || 'Фасилитатор ',
          cta_text: data.cta_text || 'Записаться',
          cta_href: data.cta_href || '',
          rating: data.rating || 4.9,
          sessions: data.sessions || [],
          format: data.format || [],
          service_types: data.service_types || [],
          contacts: data.contacts || {},
          reviews: data.reviews || [],
          schedule: data.schedule || [],
        };
        setFacilitator(facilitatorData);
      }
    } catch (error) {
      console.error('Failed to load facilitator:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!facilitator) return;

    try {
      setIsSaving(true);

      const updateData = {
        name: facilitator.name,
        city: facilitator.city,
        cities: facilitator.cities,
        tagline: facilitator.tagline,
        description: facilitator.description,
        rating: facilitator.rating,
        sessions: facilitator.sessions,
        format: facilitator.format,
        cost: facilitator.cost,
        photo: facilitator.photo,
        video_url: facilitator.video_url,
        title_prefix: facilitator.title_prefix,
        cta_text: facilitator.cta_text,
        cta_href: facilitator.cta_href,
        service_types: facilitator.service_types,
        contacts: facilitator.contacts,
        reviews: facilitator.reviews,
        schedule: facilitator.schedule,
        updated_at: new Date().toISOString(),
      };

      console.log('Saving facilitator data:', {
        facilitatorId,
        data: updateData,
      });

      const { error } = await supabase
        .from('facilitators')
        .update(updateData)
        .eq('id', facilitatorId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      toast({
        title: 'Успешно',
        description: 'Данные сохранены',
      });
    } catch (error) {
      console.error('Failed to save:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить данные',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !facilitator) {
    return <div className="container py-20 text-center">Загрузка...</div>;
  }

  const tabs = [
    { id: 'basic', label: 'Основная информация' },
    { id: 'details', label: 'Детали' },
    { id: 'schedule', label: 'Расписание' },
    { id: 'reviews', label: 'Отзывы' },
  ];

  return (
    <section className="container py-10 sm:py-14">
      <SEO description="Личный кабинет фасилитатора" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Личный кабинет</h1>
          <p className="mt-2 text-muted-foreground">{facilitator.name}</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Выйти
        </Button>
      </div>

      <div className="rounded-none border bg-white shadow-sm">
        <div className="border-b">
          <div className="container flex gap-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Имя</label>
                <Input
                  value={facilitator.name}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Город (основной)</label>
                <Input
                  value={facilitator.city}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, city: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Города (через запятую)</label>
                <Input
                  value={facilitator.cities}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, cities: e.target.value })
                  }
                  placeholder="Новосибирск, Москва, Санкт-Петербург"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">Введите города через запятую</p>
              </div>

              <div>
                <label className="text-sm font-medium">Подзаголовок <span className="text-xs text-muted-foreground">(короткий текст, в 1-2 предложения)</span></label>
                <Input
                  value={facilitator.tagline}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, tagline: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Префикс названия (например, "Фасилитатор кундалини —")</label>
                <Input
                  value={facilitator.title_prefix}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, title_prefix: e.target.value })
                  }
                  placeholder="Фасилитатор "
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Текст кнопки "записаться"</label>
                <Input
                  value={facilitator.cta_text}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, cta_text: e.target.value })
                  }
                  placeholder="Записаться"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Ссылка кнопки "записаться"</label>
                <Input
                  value={facilitator.cta_href}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, cta_href: e.target.value })
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email (контакт)</label>
                <Input
                  type="email"
                  value={facilitator.contacts.email || ''}
                  onChange={(e) =>
                    setFacilitator({
                      ...facilitator,
                      contacts: { ...facilitator.contacts, email: e.target.value },
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Telegram</label>
                <Input
                  value={facilitator.contacts.telegram || ''}
                  onChange={(e) =>
                    setFacilitator({
                      ...facilitator,
                      contacts: { ...facilitator.contacts, telegram: e.target.value },
                    })
                  }
                  placeholder="https://t.me/..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">WhatsApp</label>
                <Input
                  value={facilitator.contacts.whatsapp || ''}
                  onChange={(e) =>
                    setFacilitator({
                      ...facilitator,
                      contacts: { ...facilitator.contacts, whatsapp: e.target.value },
                    })
                  }
                  placeholder="https://wa.me/..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Описание</label>
                <Textarea
                  value={facilitator.description}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, description: e.target.value })
                  }
                  rows={6}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Рейтинг</label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={facilitator.rating}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, rating: parseFloat(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Стоимость (описание)</label>
                <Input
                  value={facilitator.cost}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, cost: e.target.value })
                  }
                  placeholder="от 5000 рублей"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Фото (URL)</label>
                <Input
                  value={facilitator.photo}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, photo: e.target.value })
                  }
                  className="mt-1"
                />
                {facilitator.photo && (
                  <img src={facilitator.photo} alt="Preview" className="mt-2 h-40 w-40 rounded-none object-cover" loading="lazy" />
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Видео (YouTube URL)</label>
                <Input
                  value={facilitator.video_url}
                  onChange={(e) =>
                    setFacilitator({ ...facilitator, video_url: e.target.value })
                  }
                  placeholder="https://www.youtube.com/embed/..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Типы услуг</label>
                <div className="space-y-2">
                  {availableServiceTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Типы услуг еще не добавлены администратором</p>
                  ) : (
                    availableServiceTypes.map((serviceType) => (
                      <div key={serviceType.id} className="flex items-center gap-2">
                        <Checkbox
                          id={serviceType.id}
                          checked={facilitator.service_types.includes(serviceType.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFacilitator({
                                ...facilitator,
                                service_types: [...facilitator.service_types, serviceType.id],
                              });
                            } else {
                              setFacilitator({
                                ...facilitator,
                                service_types: facilitator.service_types.filter((s) => s !== serviceType.id),
                              });
                            }
                          }}
                        />
                        <label htmlFor={serviceType.id} className="text-sm cursor-pointer">{serviceType.name}</label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Типы сессий</label>
                <div className="space-y-2">
                  {['Индивидуальные', 'Групповые'].map((session) => (
                    <div key={session} className="flex items-center gap-2">
                      <Checkbox
                        id={session}
                        checked={facilitator.sessions.includes(session)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFacilitator({
                              ...facilitator,
                              sessions: [...facilitator.sessions, session],
                            });
                          } else {
                            setFacilitator({
                              ...facilitator,
                              sessions: facilitator.sessions.filter((s) => s !== session),
                            });
                          }
                        }}
                      />
                      <label htmlFor={session} className="text-sm cursor-pointer">{session}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Формат</label>
                <div className="space-y-2">
                  {['Онлайн', 'Оффлайн'].map((format) => (
                    <div key={format} className="flex items-center gap-2">
                      <Checkbox
                        id={format}
                        checked={facilitator.format.includes(format)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFacilitator({
                              ...facilitator,
                              format: [...facilitator.format, format],
                            });
                          } else {
                            setFacilitator({
                              ...facilitator,
                              format: facilitator.format.filter((f) => f !== format),
                            });
                          }
                        }}
                      />
                      <label htmlFor={format} className="text-sm cursor-pointer">{format}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="mb-4">
                <Button
                  onClick={() => {
                    const newSession: Schedule = {
                      id: Date.now().toString(),
                      city: '',
                      date: '',
                      location: '',
                      time: '',
                      cost: '',
                    };
                    setFacilitator({
                      ...facilitator,
                      schedule: [...facilitator.schedule, newSession],
                    });
                  }}
                >
                  Добавить сессию
                </Button>
              </div>

              {facilitator.schedule.map((session, index) => (
                <div key={session.id} className="rounded-none border p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Сессия {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFacilitator({
                          ...facilitator,
                          schedule: facilitator.schedule.filter((s) => s.id !== session.id),
                        });
                      }}
                    >
                      Удалить
                    </Button>
                  </div>

                  <Input
                    placeholder="Город"
                    value={session.city}
                    onChange={(e) => {
                      const updated = [...facilitator.schedule];
                      updated[index].city = e.target.value;
                      setFacilitator({ ...facilitator, schedule: updated });
                    }}
                  />

                  <Input
                    type="date"
                    value={session.date}
                    onChange={(e) => {
                      const updated = [...facilitator.schedule];
                      updated[index].date = e.target.value;
                      setFacilitator({ ...facilitator, schedule: updated });
                    }}
                  />

                  <Input
                    placeholder="Место"
                    value={session.location}
                    onChange={(e) => {
                      const updated = [...facilitator.schedule];
                      updated[index].location = e.target.value;
                      setFacilitator({ ...facilitator, schedule: updated });
                    }}
                  />

                  <Input
                    placeholder="Время"
                    value={session.time}
                    onChange={(e) => {
                      const updated = [...facilitator.schedule];
                      updated[index].time = e.target.value;
                      setFacilitator({ ...facilitator, schedule: updated });
                    }}
                  />

                  <Input
                    placeholder="Стоимость"
                    value={session.cost}
                    onChange={(e) => {
                      const updated = [...facilitator.schedule];
                      updated[index].cost = e.target.value;
                      setFacilitator({ ...facilitator, schedule: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="mb-4">
                <Button
                  onClick={() => {
                    const newReview: Review = {
                      id: Date.now().toString(),
                      name: '',
                      text: '',
                      photo: '',
                    };
                    setFacilitator({
                      ...facilitator,
                      reviews: [...facilitator.reviews, newReview],
                    });
                  }}
                >
                  Добавить отзыв
                </Button>
              </div>

              {facilitator.reviews.map((review, index) => (
                <div key={review.id} className="rounded-none border p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Отзыв {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFacilitator({
                          ...facilitator,
                          reviews: facilitator.reviews.filter((r) => r.id !== review.id),
                        });
                      }}
                    >
                      Удалить
                    </Button>
                  </div>

                  <Input
                    placeholder="Имя"
                    value={review.name}
                    onChange={(e) => {
                      const updated = [...facilitator.reviews];
                      updated[index].name = e.target.value;
                      setFacilitator({ ...facilitator, reviews: updated });
                    }}
                  />

                  <Textarea
                    placeholder="Текст отзыва"
                    value={review.text}
                    onChange={(e) => {
                      const updated = [...facilitator.reviews];
                      updated[index].text = e.target.value;
                      setFacilitator({ ...facilitator, reviews: updated });
                    }}
                    rows={3}
                  />

                  <Input
                    placeholder="Фото (URL)"
                    value={review.photo}
                    onChange={(e) => {
                      const updated = [...facilitator.reviews];
                      updated[index].photo = e.target.value;
                      setFacilitator({ ...facilitator, reviews: updated });
                    }}
                  />

                  {review.photo && (
                    <img src={review.photo} alt="Review preview" className="h-20 w-20 rounded-none object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
