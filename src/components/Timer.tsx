import { useState } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimer } from '@/hooks/useTimer';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useCouple } from '@/context/CoupleContext';
import { toast } from 'sonner';

const categories = [
  'Çalışma',
  'Ders',
  'Kodlama',
  'Okuma',
  'Proje',
  'Toplantı',
  'Diğer',
];

export function Timer() {
  const { isRunning, elapsedTime, formattedTime, start, pause, resume, stop, reset, startTime } = useTimer();
  const { addTimerSession } = useData();
  const { addWorkSession } = useCouple();
  const { isAuthenticated } = useAuth();
  
  const [category, setCategory] = useState('Çalışma');
  const [description, setDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleStart = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    start();
  };

  const handlePause = () => {
    pause();
  };

  const handleResume = () => {
    resume();
  };

  const handleStop = () => {
    stop();
    setShowSaveDialog(true);
  };

  const handleSave = () => {
    if (elapsedTime < 60) {
      toast.error('En az 1 dakika çalışma kaydedilebilir');
      return;
    }

    const durationMinutes = Math.floor(elapsedTime / 60);
    
    // Save to general data
    addTimerSession({
      duration: durationMinutes,
      category,
      description: description || undefined,
      startedAt: startTime || new Date(),
      endedAt: new Date(),
      isShared: false,
    });

    // Also add to couple feed
    addWorkSession(durationMinutes, category, description);

    toast.success('Çalışma oturumu kaydedildi!');
    setShowSaveDialog(false);
    reset();
    setDescription('');
  };

  const handleDiscard = () => {
    setShowSaveDialog(false);
    reset();
    setDescription('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Çalışma Sayaç
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showSaveDialog ? (
          <>
            {/* Timer Display */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-7xl font-mono font-bold text-primary tabular-nums">
                {formattedTime}
              </div>
              <p className="text-muted-foreground mt-2">
                {isRunning ? 'Çalışıyor...' : elapsedTime > 0 ? 'Duraklatıldı' : 'Hazır'}
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={category} onValueChange={setCategory} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Açıklama (İsteğe Bağlı)</Label>
                <Input
                  placeholder="Ne üzerinde çalışıyorsunuz?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isRunning}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-pink-500 bg-pink-50 dark:bg-pink-900/20 p-2 rounded">
                <Heart className="w-4 h-4 fill-pink-500" />
                <span>Çalışma bitince otomatik paylaşılacak</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isRunning && elapsedTime === 0 && (
                <Button size="lg" onClick={handleStart} className="gap-2">
                  <Play className="w-5 h-5" />
                  Başlat
                </Button>
              )}
              
              {isRunning && (
                <Button size="lg" variant="outline" onClick={handlePause} className="gap-2">
                  <Pause className="w-5 h-5" />
                  Duraklat
                </Button>
              )}
              
              {!isRunning && elapsedTime > 0 && (
                <Button size="lg" onClick={handleResume} className="gap-2">
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
                <Button size="lg" variant="ghost" onClick={reset} className="gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Sıfırla
                </Button>
              )}
            </div>
          </>
        ) : (
          /* Save Dialog */
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-lg font-medium">Çalışma Oturumu Tamamlandı!</p>
              <p className="text-3xl font-bold text-primary mt-2">{formattedTime}</p>
              <p className="text-muted-foreground">{category}</p>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleDiscard}>
                Sil
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Clock className="w-4 h-4" />
                Kaydet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
