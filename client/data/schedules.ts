import { ScheduleSession } from "@/lib/schedule-storage";

export const DEFAULT_SCHEDULES: Record<string, ScheduleSession[]> = {
  "1": [
    {
      id: "session_1_alina_1",
      city: "Москва",
      date: "2025-10-12",
      location: "Студия \"Свет\", Арбат 12",
      time: "19:00–21:00",
      cost: "5000 рублей",
    },
    {
      id: "session_1_alina_2",
      city: "Москва",
      date: "2025-10-19",
      location: "Центр \"Дыхание\", Тверская 7",
      time: "11:00–13:00",
      cost: "5000 рублей",
    },
  ],
  "2": [
    {
      id: "session_2_mark_1",
      city: "Санкт-Петербург",
      date: "2025-10-15",
      location: "Студия \"Энергия\", Невский 45",
      time: "18:00–20:00",
      cost: "5500 рублей",
    },
  ],
  "3": [
    {
      id: "session_3_elena_1",
      city: "Казань",
      date: "2025-10-10",
      location: "Центр \"Ясность\", Баумана 25",
      time: "19:30–21:30",
      cost: "4500 рублей",
    },
  ],
  "4": [
    {
      id: "session_4_roman_1",
      city: "Новосибирск",
      date: "2025-10-18",
      location: "Студия \"Пробуждение\", Ленина 20",
      time: "10:00–12:00",
      cost: "5000 рублей",
    },
  ],
};
