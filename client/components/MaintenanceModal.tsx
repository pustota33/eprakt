export default function MaintenanceModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-4 text-center">
        {/* Decorative circle */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-rose to-brand-gold/60 flex items-center justify-center text-4xl">
            ✨
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Мы обновляем пространство сайта.
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Скоро вернёмся — в течение 24 часов.
          </p>
          <p className="text-2xl">Спасибо, что вы с нами 💜</p>
        </div>

        {/* Loading animation */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-rose animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-brand-rose animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
