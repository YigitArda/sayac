import { Play, Pause, Square, RotateCcw, Users, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSharedTimer } from '@/hooks/useSharedTimer';
import { useAuth } from '@/context/AuthContext';
import { useCouple } from '@/context/CoupleContext';
import { toast } from 'sonner';

export function SharedTimer() {
  const { user, isAuthenticated } = useAuth();
  const { addWorkSession } = useCouple();
  
  const {
    isRunning,
    elapsedTime,
    formattedTime,
    startedBy,
    pausedBy,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useSharedTimer(user?.id || '', user?.name || '');

  if (!isAuthenticated) {
    return (
      <Card className="w-full border-pink-200 dark:border-pink-800">
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto text-pink-400 mb-4" />
          <p className="text-muted-foreground">Ortak sayacı kullanmak için giriş yapın</p>
        </CardContent>
      </Card>
    );
  }

  const handleStart = () => {
    start();
    toast.success('Ortak sayaç başladı! 💕', {
      description: 'Partneriniz de görebilir ve kontrol edebilir',
    });
  };

  const handlePause = () => {
    pause();
    toast.info(`Sayaç duraklatıldı`);
  };

  const handleStop = () => {
    stop();
    
    // Auto-save to feed if more than 1 minute
    if (elapsedTime >= 60) {
      const durationMinutes = Math.floor(elapsedTime / 60);
      addWorkSession(durationMinutes, 'Ortak Çalışma', 'Partnerinizle birlikte çalışma');
      toast.success(`Ortak çalışma kaydedildi: ${formattedTime}`);
    }
  };

  const handleReset = () => {
    reset();
    toast.info('Sayaç sıfırlandı');
  };

  return (
    <Card className="w-full border-pink-200 dark:border-pink-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
          <Users className="w-5 h-5" />
          Ortak Sayaç
          <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-2">
          <div className="text-6xl font-mono font-bold text-pink-600 dark:text-pink-400 tabular-nums">
            {formattedTime}
          </div>
          
          {isRunning ? (
            <div className="flex items-center justify-center gap-2 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Çalışıyor...</span>
            </div>
          ) : elapsedTime > 0 ? (
            <p className="text-sm text-muted-foreground">Duraklatıldı</p>
          ) : (
            <p className="text-sm text-muted-foreground">Hazır - Birlikte başlayın!</p>
          )}
        </div>

        {/* Status Info */}
        {(startedBy || pausedBy) && (
          <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg text-sm space-y-1">
            {startedBy && (
              <p className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Başlatan: <strong>{startedBy}</strong></span>
              </p>
            )}
            {pausedBy && !isRunning && (
              <p className="flex items-center gap-2 text-orange-500">
                <Pause className="w-4 h-4" />
                <span>Durduran: <strong>{pausedBy}</strong></span>
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 flex-wrap">
          {!isRunning && elapsedTime === 0 && (
            <Button size="lg" onClick={handleStart} className="gap-2 bg-pink-500 hover:bg-pink-600">
              <Play className="w-5 h-5" />
              Birlikte Başla
            </Button>
          )}
          
          {isRunning && (
            <Button size="lg" variant="outline" onClick={handlePause} className="gap-2">
              <Pause className="w-5 h-5" />
              Duraklat
            </Button>
          )}
          
          {!isRunning && elapsedTime > 0 && (
            <Button size="lg" onClick={resume} className="gap-2 bg-pink-500 hover:bg-pink-600">
              <Play className="w-5 h-5" />
              Devam Et
            </Button>
          )}
          
          {(isRunning || elapsedTime > 0) && (
            <Button size="lg" variant="destructive" onClick={handleStop} className="gap-2">
              <Square className="w-5 h-5" />
              Bitir
            </Button>
          )}
          
          {elapsedTime > 0 && !isRunning && (
            <Button size="lg" variant="ghost" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Sıfırla
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-center text-muted-foreground bg-muted p-3 rounded">
          <p>💡 İpucu: Bu sayaç senkronize çalışır.</p>
          <p>Siz ve partneriniz aynı sayacı görebilir ve kontrol edebilirsiniz.</p>
          <p>Biri başlatınca/durdurunca ikisi de etkilenir.</p>
        </div>
      </CardContent>
    </Card>
  );
}
