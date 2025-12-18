import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";

const testimonials = [
  {
    name: "Мария",
    text: "После первой сессии почувствовала лёгкость и тепло. Очень бережный подход.",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Дмитрий",
    text: "Практи��а помогла справиться со стрессом и найти больше ясности в решениях.",
    photo: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Ольга",
    text: "Чувствую качественные изменения в теле и эмоциях. Благодарю за поддержку!",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Игорь",
    text: "Группа дала ощущение общности и принятия. Продолжаю практику.",
    photo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=600&auto=format&fit=crop",
  },
];

export default function TestimonialsBlock() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="bg-[#FFF3E6] py-20" data-reveal>
      <div className="container">
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <h2 className="section-title text-2xl font-bold tracking-tight sm:text-3xl">Отзывы</h2>
          <div className="hidden gap-2 sm:flex">
            <button onClick={scrollPrev} className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white">
              ←
            </button>
            <button onClick={scrollNext} className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white">
              →
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {testimonials.map((t, i) => (
              <figure
                key={i}
                data-reveal
                style={{ ["--reveal-delay" as any]: `${i * 90}ms` }}
                className="min-w-0 shrink-0 basis-[85%] rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(234,174,92,0.20)] sm:basis-[48%] lg:basis-[31%]"
              >
                <div className="flex items-center gap-3">
                  <img src={t.photo} alt={t.name} className="h-12 w-12 rounded-full object-cover shadow-[0_0_0_4px_rgba(234,174,92,0.15)]" loading="lazy" />
                  <figcaption className="font-medium">{t.name}</figcaption>
                </div>
                <blockquote className="mt-3 text-sm text-muted-foreground">{t.text}</blockquote>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2 sm:hidden">
          <button onClick={scrollPrev} className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white">
            ←
          </button>
          <button onClick={scrollNext} className="rounded-full border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white">
            →
          </button>
        </div>
      </div>
    </section>
  );
}
