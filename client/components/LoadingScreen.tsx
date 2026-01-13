export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-rose animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 rounded-full bg-brand-rose animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      </div>
    </div>
  );
}
