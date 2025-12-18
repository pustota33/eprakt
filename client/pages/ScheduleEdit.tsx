import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FACILITATORS } from "@/data/facilitators";
import { getFacilitatorIdFromCode } from "@/lib/schedule-codes";
import { getScheduleData, addSession, updateSession, deleteSession } from "@/lib/schedule-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

type FormSession = {
  id: string;
  city: string;
  date: string;
  location: string;
  time: string;
  cost: string;
};

export default function ScheduleEdit() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<FormSession[]>([]);
  const [facilitator, setFacilitator] = useState<typeof FACILITATORS[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const facilitatorId = getFacilitatorIdFromCode(code);
    if (!facilitatorId) {
      navigate("/");
      return;
    }

    const foundFacilitator = FACILITATORS.find((f) => f.id === facilitatorId);
    if (!foundFacilitator) {
      navigate("/");
      return;
    }

    setFacilitator(foundFacilitator);
    const scheduleData = getScheduleData(facilitatorId);
    setSessions(scheduleData.sessions);
    setIsLoading(false);
  }, [code, navigate]);

  if (isLoading) {
    return (
      <div className="container py-10 text-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!facilitator) {
    return (
      <div className="container py-10 text-center">
        <div className="text-lg font-semibold">Недействительная ссылка для редактирования</div>
        <Button variant="outline" onClick={() => navigate("/")} className="mt-4">
          Вернуться на главную
        </Button>
      </div>
    );
  }

  const handleAddSession = () => {
    const newSession: FormSession = {
      id: `new_${Date.now()}`,
      city: facilitator.city,
      date: "",
      location: "",
      time: "",
      cost: "",
    };
    setSessions([...sessions, newSession]);
  };

  const handleSaveSession = (session: FormSession) => {
    if (session.id.startsWith("new_")) {
      // New session
      if (session.date && session.location && session.time && session.cost) {
        const savedSession = addSession(facilitator.id, {
          city: session.city,
          date: session.date,
          location: session.location,
          time: session.time,
          cost: session.cost,
        });
        setSessions(sessions.map((s) => (s.id === session.id ? savedSession : s)));
        setEditingId(null);
      }
    } else {
      // Existing session
      if (session.date && session.location && session.time && session.cost) {
        updateSession(facilitator.id, session.id, {
          city: session.city,
          date: session.date,
          location: session.location,
          time: session.time,
          cost: session.cost,
        });
        setEditingId(null);
      }
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessionId.startsWith("new_")) {
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } else {
      deleteSession(facilitator.id, sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    }
  };

  const handleUpdateField = (sessionId: string, field: keyof FormSession, value: string) => {
    setSessions(
      sessions.map((s) =>
        s.id === sessionId
          ? { ...s, [field]: value }
          : s
      )
    );
  };

  return (
    <section className="container py-10 sm:py-14 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Редактирование расписания — {facilitator.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          ��обавляйте, изменяйте и удаляйте занятия. Изменения сохраняются автоматически.
        </p>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="border border-dashed p-6 text-center">
            <p className="text-muted-foreground">Нет сохранённых занятий</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="border p-4 sm:p-6">
              {editingId === session.id ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium">Город</label>
                      <Input
                        value={session.city}
                        onChange={(e) => handleUpdateField(session.id, "city", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Дата</label>
                      <Input
                        type="date"
                        value={session.date}
                        onChange={(e) => handleUpdateField(session.id, "date", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Место</label>
                      <Input
                        value={session.location}
                        onChange={(e) => handleUpdateField(session.id, "location", e.target.value)}
                        className="mt-1"
                        placeholder="e.g., Студия Свет, Арбат 12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Время</label>
                      <Input
                        value={session.time}
                        onChange={(e) => handleUpdateField(session.id, "time", e.target.value)}
                        className="mt-1"
                        placeholder="e.g., 19:00–21:00"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium">Стоимость</label>
                      <Input
                        value={session.cost}
                        onChange={(e) => handleUpdateField(session.id, "cost", e.target.value)}
                        className="mt-1"
                        placeholder="e.g., 5000 рублей"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleSaveSession(session)} size="sm" className="rounded-none">
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                      className="rounded-none"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-start">
                    <div>
                      <p className="text-xs text-muted-foreground">Город</p>
                      <p className="font-medium">{session.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Дата</p>
                      <p className="font-medium">{session.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Место</p>
                      <p className="font-medium text-sm">{session.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Время</p>
                      <p className="font-medium">{session.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Стоимость</p>
                      <p className="font-medium text-sm">{session.cost}</p>
                    </div>
                    <div className="flex gap-2 pt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(session.id)}
                        className="flex-1 rounded-none"
                      >
                        Редакт.
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Button onClick={handleAddSession} className="mt-6 gap-2 rounded-none" size="lg">
        <Plus className="h-4 w-4" />
        Добавить занятие
      </Button>
    </section>
  );
}
