import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface HeroSettings {
  id: string;
  title: string;
  subtitle: string;
  background_image: string;
  button_text: string;
  button_link: string;
}

const DEFAULT_HERO: HeroSettings = {
  id: 'main',
  title: 'Фасилитаторы кундалини рядом с тобой',
  subtitle: 'Найди фасилитатора в твоём городе и начни свой путь пробуждения уже сегодня',
  background_image: 'https://cdn.builder.io/api/v1/image/assets%2Ff7c6ff3df7e24636ad711d68d812700a%2F11cd1920330447038be7d4baff54a53d?format=webp&width=1920',
  button_text: 'Найти фасилитатора',
  button_link: '#facilitators',
};

export default function Hero() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(DEFAULT_HERO);

  useEffect(() => {
    const loadHeroSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_settings')
          .select('*')
          .single();

        if (!error && data) {
          setHeroSettings(data);
        }
      } catch (error) {
        console.error('Failed to load hero settings:', error);
      }
    };

    loadHeroSettings();
  }, []);

  const chakras = [
    { id: 1, name: 'Корневая', color: '#DC2626', rgb: '220, 38, 38', delay: 0, yPos: 775 },
    { id: 2, name: 'Сакральная', color: '#EA580C', rgb: '234, 88, 12', delay: 0.2, yPos: 714 },
    { id: 3, name: 'Солнечного сплетения', color: '#F59E0B', rgb: '245, 158, 11', delay: 0.4, yPos: 653 },
    { id: 4, name: 'Сердечная', color: '#10B981', rgb: '16, 185, 129', delay: 0.6, yPos: 592 },
    { id: 5, name: 'Горловая', color: '#06B6D4', rgb: '6, 182, 212', delay: 0.8, yPos: 531 },
    { id: 6, name: 'Третий глаз', color: '#4F46E5', rgb: '79, 70, 229', delay: 1, yPos: 470 },
    { id: 7, name: 'Корональная', color: '#A855F7', rgb: '168, 85, 247', delay: 1.2, yPos: 409 },
  ];

  return (
    <section className="relative overflow-hidden" aria-label="Hero">
      <div className="absolute inset-0 z-0">
        <img
          src={heroSettings.background_image || DEFAULT_HERO.background_image}
          alt="Энергия кундалини"
          className="h-screen w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/10" />
        <div className="aurora-layer" />
        <div className="hero-breathe" />

        {/* SVG Energy Visualization */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block"
          viewBox="0 0 1200 1200"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Glow filters for each chakra */}
            {chakras.map((chakra) => (
              <filter key={`glow-${chakra.id}`} id={`glow-${chakra.id}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}

            {/* Energy flow gradient */}
            <linearGradient id="energyFlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.2" />
            </linearGradient>

            {/* Light ball glow filter */}
            <filter id="light-ball-glow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Energy Channel */}
          <line
            x1="1050"
            y1="220"
            x2="1050"
            y2="859"
            stroke="url(#energyFlow)"
            strokeWidth="1.5"
            opacity="0.3"
            className="animate-energy-flow"
          />

          {/* Chakra circles with energy rings */}
          {chakras.map((chakra, index) => {
            const yPos = chakra.yPos;
            return (
              <g key={chakra.id} className="chakra-group">
                {/* Outer pulsing rings */}
                <circle
                  cx="1050"
                  cy={yPos}
                  r="41"
                  fill="none"
                  stroke={chakra.color}
                  strokeWidth="0.5"
                  opacity="0.2"
                  className="animate-chakra-ring-large"
                  style={{ animationDelay: `${chakra.delay}s` }}
                  filter={`url(#glow-${chakra.id})`}
                />

                {/* Medium pulsing ring */}
                <circle
                  cx="1050"
                  cy={yPos}
                  r="30"
                  fill="none"
                  stroke={chakra.color}
                  strokeWidth="1"
                  opacity="0.35"
                  className="animate-chakra-ring-medium"
                  style={{ animationDelay: `${chakra.delay + 0.15}s` }}
                  filter={`url(#glow-${chakra.id})`}
                />

                {/* Inner bright ring */}
                <circle
                  cx="1050"
                  cy={yPos}
                  r="19"
                  fill="none"
                  stroke={chakra.color}
                  strokeWidth="1.5"
                  opacity="0.7"
                  className="animate-chakra-ring-small"
                  style={{ animationDelay: `${chakra.delay}s` }}
                  filter={`url(#glow-${chakra.id})`}
                />

                {/* Main chakra circle with gradient fill */}
                <circle
                  cx="1050"
                  cy={yPos}
                  r="13"
                  fill={chakra.color}
                  opacity="0.85"
                  className="animate-chakra-pulse"
                  style={{ animationDelay: `${chakra.delay}s` }}
                  filter={`url(#glow-${chakra.id})`}
                />

                {/* Inner bright center */}
                <circle
                  cx="1050"
                  cy={yPos}
                  r="7"
                  fill="rgba(255,255,255,0.6)"
                  className="animate-chakra-bright"
                  style={{ animationDelay: `${chakra.delay}s` }}
                />

                {/* Rotating mandala inner pattern */}
                <g
                  className="animate-chakra-rotate"
                  style={{
                    transformOrigin: `1050px ${yPos}px`,
                    animationDelay: `${chakra.delay}s`,
                  }}
                >
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const x = 1050 + Math.cos(rad) * 7.5;
                    const y = yPos + Math.sin(rad) * 7.5;
                    return (
                      <circle
                        key={`dot-${chakra.id}-${angle}`}
                        cx={x}
                        cy={y}
                        r="1"
                        fill="rgba(255,255,255,0.8)"
                      />
                    );
                  })}
                </g>

                {/* Energy connection line to next chakra */}
                {index < chakras.length - 1 && (
                  <g className="energy-line-group">
                    <line
                      x1="1050"
                      y1={yPos + 20}
                      x2="1050"
                      y2={chakras[index + 1].yPos - 20}
                      stroke={chakra.color}
                      strokeWidth="0.75"
                      opacity="0.3"
                      className="animate-energy-connect"
                      style={{ animationDelay: `${chakra.delay + 0.1}s` }}
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Background stars/particles */}
          {[...Array(30)].map((_, i) => (
            <circle
              key={`star-${i}`}
              cx={Math.random() * 1200}
              cy={Math.random() * 640 + 220}
              r={Math.random() * 0.75 + 0.4}
              fill="rgba(255,255,255,0.4)"
              opacity={Math.random() * 0.6 + 0.2}
              className="animate-star-twinkle"
              style={{
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}

          {/* Light ball traveling through chakras */}
          <g className="light-ball-group">
            <circle
              cx="1050"
              cy="250"
              r="7"
              fill="#FFFFFF"
              opacity="0.9"
              filter="url(#light-ball-glow)"
              className="animate-light-ball-travel"
            >
              <animateMotion dur="12s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                <mpath href="#light-ball-path" />
              </animateMotion>
            </circle>
            <path
              id="light-ball-path"
              d="M 1050 220 Q 1050 540 1050 859"
              fill="none"
              stroke="none"
            />
          </g>
        </svg>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[hsl(var(--background))]" />
      </div>

      {/* Text content */}
      <div data-reveal className="container relative z-10 flex h-[70vh] flex-col items-center justify-center text-center sm:h-[80vh]">
        <div className="relative mb-6">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
            <div className="w-96 h-96 bg-gradient-to-br from-brand-gold/10 via-brand-rose/5 to-transparent rounded-full blur-3xl" />
          </div>
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">
            {heroSettings.title}
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-base text-white/95 sm:text-lg drop-shadow-sm">
          {heroSettings.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={heroSettings.button_link}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-[rgba(234,174,92,0.35)_0px_10px_30px] transition will-change-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[rgba(234,174,92,0.5)_0px_15px_40px]"
          >
            {heroSettings.button_text}
          </a>
          <a
            href="#retreat"
            className="rounded-full border border-white/70 bg-white/20 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/30 hover:border-white/90"
          >
            Ближайшие ретриты
          </a>
        </div>
      </div>

      <style>{`
        @keyframes chakra-pulse {
          0%, 100% {
            r: 18px;
            filter: drop-shadow(0 0 20px currentColor);
            opacity: 0.85;
          }
          50% {
            r: 22px;
            filter: drop-shadow(0 0 35px currentColor);
            opacity: 1;
          }
        }

        @keyframes chakra-bright {
          0%, 100% {
            r: 10px;
            opacity: 0.6;
          }
          50% {
            r: 12px;
            opacity: 0.9;
          }
        }

        @keyframes chakra-ring-small {
          0%, 100% {
            r: 25px;
            stroke-width: 1.5;
            opacity: 0.7;
          }
          50% {
            r: 28px;
            stroke-width: 1;
            opacity: 0.3;
          }
        }

        @keyframes chakra-ring-medium {
          0%, 100% {
            r: 40px;
            stroke-width: 1;
            opacity: 0.35;
          }
          50% {
            r: 50px;
            stroke-width: 0.5;
            opacity: 0.1;
          }
        }

        @keyframes chakra-ring-large {
          0%, 100% {
            r: 55px;
            stroke-width: 0.5;
            opacity: 0.2;
          }
          50% {
            r: 70px;
            stroke-width: 0.3;
            opacity: 0.05;
          }
        }

        @keyframes chakra-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes energy-flow {
          0% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        @keyframes energy-connect {
          0%, 100% {
            opacity: 0.2;
            stroke-width: 1;
          }
          50% {
            opacity: 0.6;
            stroke-width: 1.5;
          }
        }

        @keyframes star-twinkle {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes light-ball-glow {
          0%, 100% {
            r: 10px;
            filter: drop-shadow(0 0 20px #FFFFFF) drop-shadow(0 0 40px rgba(255, 255, 255, 0.8));
            opacity: 0.95;
          }
          50% {
            r: 12px;
            filter: drop-shadow(0 0 30px #FFFFFF) drop-shadow(0 0 50px rgba(255, 255, 255, 1));
            opacity: 1;
          }
        }

        @keyframes light-ball-travel {
          0%, 100% {
            opacity: 0;
          }
        }

        @keyframes chakra-illuminate {
          0%, 100% {
            filter: drop-shadow(0 0 20px currentColor);
          }
          50% {
            filter: drop-shadow(0 0 40px currentColor) drop-shadow(0 0 60px currentColor);
          }
        }

        @keyframes chakra-light-arrive {
          0%, 5%, 95%, 100% {
            stroke-width: 2;
            opacity: 0;
            r: 60px;
          }
          40%, 60% {
            stroke-width: 3;
            opacity: 0.8;
            r: 70px;
          }
          50% {
            stroke-width: 2;
            opacity: 1;
            r: 65px;
          }
        }

        .animate-chakra-pulse {
          animation: chakra-pulse 4s ease-in-out infinite;
        }

        .animate-chakra-bright {
          animation: chakra-bright 4s ease-in-out infinite;
        }

        .animate-chakra-ring-small {
          animation: chakra-ring-small 4s ease-in-out infinite;
        }

        .animate-chakra-ring-medium {
          animation: chakra-ring-medium 5s ease-in-out infinite;
        }

        .animate-chakra-ring-large {
          animation: chakra-ring-large 6s ease-in-out infinite;
        }

        .animate-chakra-rotate {
          animation: chakra-rotate 8s linear infinite;
        }

        .animate-energy-flow {
          animation: energy-flow 8s linear infinite;
          stroke-dasharray: 1000;
        }

        .animate-energy-connect {
          animation: energy-connect 3s ease-in-out infinite;
        }

        .animate-star-twinkle {
          animation: star-twinkle 3s ease-in-out infinite;
        }

        .animate-light-ball-glow {
          animation: light-ball-glow 12s ease-in-out infinite;
        }

        .animate-light-ball-travel {
          animation: light-ball-glow 12s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          svg {
            transform: scaleX(0);
          }
        }
      `}</style>
    </section>
  );
}
