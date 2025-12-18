export type Retreat = {
  id: string;
  title: string;
  city: string;
  date: string; // e.g. 12–15 Окт 2025
  image: string;
  description: string;
  format: ("Онлайн" | "Оффлайн")[];
  priceFrom: number;
  link?: string;
};

export const RETREATS: Retreat[] = [
  {
    id: "r1",
    title: "Пробуждение и тишина",
    city: "Сочи",
    date: "12–15 Окт 2025",
    image:
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1974&auto=format&fit=crop",
    description:
      "Четыре дня мягких телесных и дыхательных практик, проводимость энергии кундалини, медитации и интеграционные круги.",
    format: ["Оффлайн"],
    priceFrom: 35000,
    link: "#signup",
  },
  {
    id: "r2",
    title: "Глубокое дыхание кундалини",
    city: "Москва",
    date: "26–27 Окт 2025",
    image:
      "https://images.unsplash.com/photo-1526401485004-2fda9f4e3e0c?q=80&w=1600&auto=format&fit=crop",
    description: "Двухдневный интенсив для новичков и практиков. Фокус на безопасном раскрывании и опоре.",
    format: ["Оффлайн"],
    priceFrom: 12000,
  },
  {
    id: "r3",
    title: "Онлайн-погружение в проводимость",
    city: "Онлайн",
    date: "5 Ноя 2025",
    image:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
    description: "Однодневный онлайн-ретрит: дыхание, медитация, мягкие практики, вопросы и ответы.",
    format: ["Онлайн"],
    priceFrom: 4500,
  },
];
