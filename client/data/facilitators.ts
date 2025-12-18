export type Facilitator = {
  id: string;
  name: string;
  city: string;
  tagline: string;
  sessions: string[]; // ["Индивидуальные", "Групповые"]
  format: string[]; // ["Онлайн", "Оффлайн"]
  photo: string;
  contacts: { telegram?: string; whatsapp?: string; email?: string };
};

export const FACILITATORS: Facilitator[] = [
  {
    id: "1",
    name: "Алина Соколова",
    city: "Москва",
    tagline: "Помогаю раскрыть сердце через практику кундалини",
    sessions: ["Индивидуальные", "Групповые"],
    format: ["Онлайн", "Оффлайн"],
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    contacts: { telegram: "https://t.me/", whatsapp: "https://wa.me/79990000001", email: "mailto:alina@example.com" },
  },
  {
    id: "2",
    name: "Марк Иванов",
    city: "Санкт-Петербург",
    tagline: "Мягкая проводимость энергии и поддержка трансформации",
    sessions: ["Индивидуальные"],
    format: ["Онлайн", "Оффлайн"],
    photo:
      "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?q=80&w=1200&auto=format&fit=crop",
    contacts: { telegram: "https://t.me/", whatsapp: "https://wa.me/79990000002", email: "mailto:mark@example.com" },
  },
  {
    id: "3",
    name: "Елена Мирная",
    city: "Казань",
    tagline: "Путь к ясности через дыхание и кундалини",
    sessions: ["Групповые"],
    format: ["Онлайн"],
    photo:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop",
    contacts: { telegram: "https://t.me/", whatsapp: "https://wa.me/79990000003", email: "mailto:elena@example.com" },
  },
  {
    id: "4",
    name: "Роман Север",
    city: "Новосибирск",
    tagline: "Осознанность тела, тишина ума, пробуждение энергии",
    sessions: ["Индивидуальные", "Групповые"],
    format: ["Оффлайн"],
    photo:
      "https://images.unsplash.com/photo-1508830524289-0adcbe822b40?q=80&w=1200&auto=format&fit=crop",
    contacts: { telegram: "https://t.me/", whatsapp: "https://wa.me/79990000004", email: "mailto:roman@example.com" },
  },
];
