import { useState, useEffect, useRef } from 'react';
import { Focus, Maximize2, Minimize2, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useTimer } from '@/hooks/useTimer';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const focusSounds = [
  { value: 'none', label: 'Sessiz', emoji: '🔇' },
  { value: 'white_noise', label: 'Beyaz Gürültü', emoji: '🌊' },
  { value: 'rain', label: 'Yağmur', emoji: '🌧️' },
  { value: 'ocean', label: 'Okyanus', emoji: '🌊' },
  { value: 'forest', label: 'Orman', emoji: '🌲' },
  { value: 'cafe', label: 'Kafe', emoji: '☕' },
  { value: 'lofi', label: 'Lo-Fi Müzik', emoji: '🎵' },
  { value: 'fire', label: 'Şömine', emoji: '🔥' },
];

export function FocusMode() {
  const { isAuthenticated } = useAuth();
  const { addTimerSession } = useData();
  const { isRunning, elapsedTime, formattedTime, start, pause, resume, stop, reset, startTime } = useTimer();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSound, setSelectedSound] = useState('none');
  const [volume, setVolume] = useState(50);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [category, setCategory] = useState('Çalışma');
  
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleStart = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    start();
    if (selectedSound !== 'none') {
      setIsSoundPlaying(true);
    }
  };

  const handlePause = () => {
    pause();
    setIsSoundPlaying(false);
  };

  const handleResume = () => {
    resume();
    if (selectedSound !== 'none') {
      setIsSoundPlaying(true);
    }
  };

  const handleStop = () => {
    if (elapsedTime < 60) {
      toast.error('En az 1 dakika çalışma kaydedilebilir');
      return;
    }

    const durationMinutes = Math.floor(elapsedTime / 60);
    
    addTimerSession({
      duration: durationMinutes,
      category,
      description: 'Odak Modu',
      startedAt: startTime || new Date(),
      endedAt: new Date(),
      isShared: false,
    });

    toast.success('Çalışma oturumu kaydedildi!');
    stop();
    setIsSoundPlaying(false);
    reset();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isRunning) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card 
      className={`w-full transition-all duration-500 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 rounded-none flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'
      }`}
      onMouseMove={handleMouseMove}
    >
      <CardContent className={`p-8 ${isFullscreen ? 'w-full max-w-2xl' : ''}`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-8 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Focus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold">Odak Modu</h2>
              <p className="text-xs text-white/60">Dikkat dağıtıcıları kapat</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>

        {/* Timer Display */}
        <div className="text-center py-12">
          <div className="text-8xl md:text-9xl font-mono font-bold text-white tabular-nums tracking-tight">
            {formattedTime}
          </div>
          <p className="text-white/60 mt-4 text-lg">
            {isRunning ? 'Odaklanıyorsunuz...' : elapsedTime > 0 ? 'Duraklatıldı' : 'Başlamaya hazır'}
          </p>
        </div>

        {/* Controls */}
        <div className={`space-y-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Sound Settings */}
          <div className="bg-white/5 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Arka Plan Sesi</span>
              {isSoundPlaying && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Çalıyor
                </span>
              )}
            </div>
            
            <Select value={selectedSound} onValueChange={setSelectedSound} disabled={isRunning}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {focusSounds.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    <span className="flex items-center gap-2">
                      <span>{s.emoji}</span>
                      {s.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSound !== 'none' && (
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-white/60" />
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-white/60" />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-white/5 rounded-xl p-4">
            <span className="text-sm text-white/80 block mb-2">Kategori</span>
            <Select value={category} onValueChange={setCategory} disabled={isRunning}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Çalışma', 'Ders', 'Kodlama', 'Okuma', 'Proje', 'Toplantı', 'Diğer'].map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-4">
            {!isRunning && elapsedTime === 0 && (
              <Button 
                size="lg" 
                onClick={handleStart}
                className="gap-2 bg-white text-slate-900 hover:bg-white/90 px-8"
              >
                <Play className="w-5 h-5" />
                Başlat
              </Button>
            )}
            
            {isRunning && (
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handlePause}
                className="gap-2 border-white/30 text-white hover:bg-white/10 px-8"
              >
                <Pause className="w-5 h-5" />
                Duraklat
              </Button>
            )}
            
            {!isRunning && elapsedTime > 0 && (
              <Button 
                size="lg" 
                onClick={handleResume}
                className="gap-2 bg-white text-slate-900 hover:bg-white/90 px-8"
              >
                <Play className="w-5 h-5" />
                Devam Et
              </Button>
            )}
            
            {(isRunning || elapsedTime > 0) && (
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleStop}
                className="gap-2 border-red-400/50 text-red-400 hover:bg-red-400/10 px-8"
              >
                <RotateCcw className="w-5 h-5" />
                Bitir
              </Button>
            )}
          </div>

          {/* Tips */}
          <div className="text-center text-white/40 text-sm">
            <p>💡 İpucu: Fareyi hareket ettirmeyi bırakırsanız kontroller gizlenir</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
