import { useState } from 'react';
import { Droplets, Brain, Dumbbell, SmilePlus, Plus, Minus, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWellness } from '@/context/WellnessContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { ExerciseType, MoodType } from '@/types';

const exerciseTypes: { value: ExerciseType; label: string; emoji: string }[] = [
  { value: 'running', label: 'Koşu', emoji: '🏃' },
  { value: 'walking', label: 'Yürüyüş', emoji: '🚶' },
  { value: 'cycling', label: 'Bisiklet', emoji: '🚴' },
  { value: 'swimming', label: 'Yüzme', emoji: '🏊' },
  { value: 'gym', label: 'Spor Salonu', emoji: '🏋️' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘' },
  { value: 'other', label: 'Diğer', emoji: '⚡' },
];

const moodTypes: { value: MoodType; label: string; emoji: string; color: string }[] = [
  { value: 'terrible', label: 'Berbat', emoji: '😢', color: 'bg-red-100 text-red-700' },
  { value: 'bad', label: 'Kötü', emoji: '😕', color: 'bg-orange-100 text-orange-700' },
  { value: 'neutral', label: 'Normal', emoji: '😐', color: 'bg-gray-100 text-gray-700' },
  { value: 'good', label: 'İyi', emoji: '🙂', color: 'bg-blue-100 text-blue-700' },
  { value: 'excellent', label: 'Harika', emoji: '😄', color: 'bg-green-100 text-green-700' },
];

const meditationTypes = [
  { value: 'breathing', label: 'Nefes Egzersizi', duration: 5 },
  { value: 'mindfulness', label: 'Mindfulness', duration: 10 },
  { value: 'body_scan', label: 'Beden Taraması', duration: 15 },
  { value: 'guided', label: 'Rehberli Meditasyon', duration: 20 },
];

export function Wellness() {
  const { 
    addMeditationSession, 
    getTotalMeditationMinutes,
    addExerciseEntry,
    getTotalExerciseMinutes,
    addWaterEntry,
    getTodayWaterIntake,
    addMoodEntry,
    getTodayMood,
    getMoodStats,
  } = useWellness();
  const { isAuthenticated } = useAuth();

  // Water
  const todayWater = getTodayWaterIntake();
  const waterGoal = 8;
  const waterProgress = (todayWater / waterGoal) * 100;

  // Meditation timer
  const [meditationType, setMeditationType] = useState('breathing');
  const [meditationTime, setMeditationTime] = useState(5);
  const [isMeditating, setIsMeditating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [meditationInterval, setMeditationInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Exercise
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('running');
  const [exerciseDuration, setExerciseDuration] = useState('30');
  const [exerciseDistance, setExerciseDistance] = useState('');
  const [exerciseCalories, setExerciseCalories] = useState('');
  const [shareExercise, setShareExercise] = useState(true);

  // Mood
  const todayMood = getTodayMood();
  const moodStats = getMoodStats();

  const handleAddWater = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    addWaterEntry(1);
  };

  const startMeditation = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    setIsMeditating(true);
    setTimeLeft(meditationTime * 60);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          completeMeditation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setMeditationInterval(interval);
  };

  const stopMeditation = () => {
    if (meditationInterval) {
      clearInterval(meditationInterval);
      setMeditationInterval(null);
    }
    setIsMeditating(false);
    setTimeLeft(meditationTime * 60);
  };

  const completeMeditation = () => {
    setIsMeditating(false);
    setMeditationInterval(null);
    
    addMeditationSession({
      duration: meditationTime,
      type: meditationType as any,
      isShared: false,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const duration = parseInt(exerciseDuration);
    if (isNaN(duration) || duration <= 0) {
      toast.error('Geçerli bir süre girin');
      return;
    }

    addExerciseEntry({
      type: exerciseType,
      duration,
      distance: exerciseDistance ? parseFloat(exerciseDistance) : undefined,
      calories: exerciseCalories ? parseInt(exerciseCalories) : undefined,
      date: new Date(),
      isShared: shareExercise,
    });

    setIsExerciseDialogOpen(false);
    setExerciseDuration('30');
    setExerciseDistance('');
    setExerciseCalories('');
  };

  const handleAddMood = (mood: MoodType) => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    addMoodEntry({
      mood,
      activities: [],
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Wellness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="water" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="water" className="gap-1">
              <Droplets className="w-4 h-4" />
              <span className="hidden sm:inline">Su</span>
            </TabsTrigger>
            <TabsTrigger value="meditation" className="gap-1">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Meditasyon</span>
            </TabsTrigger>
            <TabsTrigger value="exercise" className="gap-1">
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">Spor</span>
            </TabsTrigger>
            <TabsTrigger value="mood" className="gap-1">
              <SmilePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Ruh Hali</span>
            </TabsTrigger>
          </TabsList>

          {/* Water Tracker */}
          <TabsContent value="water" className="space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl mb-2">💧</div>
              <p className="text-3xl font-bold">{todayWater} / {waterGoal}</p>
              <p className="text-sm text-muted-foreground">bardak su</p>
            </div>
            <Progress value={waterProgress} className="h-3" />
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="lg" onClick={() => {}} className="opacity-50">
                <Minus className="w-5 h-5" />
              </Button>
              <Button size="lg" onClick={handleAddWater} className="gap-2">
                <Plus className="w-5 h-5" />
                1 Bardak
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Toplam meditasyon: {getTotalMeditationMinutes()} dk
            </p>
          </TabsContent>

          {/* Meditation */}
          <TabsContent value="meditation" className="space-y-4">
            {!isMeditating ? (
              <>
                <div className="space-y-2">
                  <Label>Meditasyon Türü</Label>
                  <Select value={meditationType} onValueChange={(v) => {
                    setMeditationType(v);
                    const type = meditationTypes.find(t => t.value === v);
                    if (type) {
                      setMeditationTime(type.duration);
                      setTimeLeft(type.duration * 60);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meditationTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label} ({t.duration} dk)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-center py-4">
                  <p className="text-4xl font-mono font-bold">{meditationTime}:00</p>
                </div>
                <Button className="w-full gap-2" onClick={startMeditation}>
                  <Play className="w-5 h-5" />
                  Başlat
                </Button>
              </>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="text-6xl animate-pulse">🧘</div>
                <p className="text-5xl font-mono font-bold">{formatTime(timeLeft)}</p>
                <p className="text-muted-foreground">Nefes al... Nefes ver...</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={stopMeditation}>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Sıfırla
                  </Button>
                  <Button variant="destructive" onClick={stopMeditation}>
                    <Pause className="w-5 h-5 mr-2" />
                    Bitir
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-center text-muted-foreground">
              Toplam meditasyon: {getTotalMeditationMinutes()} dk
            </p>
          </TabsContent>

          {/* Exercise */}
          <TabsContent value="exercise" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Toplam Süre</p>
                <p className="text-2xl font-bold">{getTotalExerciseMinutes()} dk</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Aktivite</p>
                <p className="text-2xl font-bold">{exerciseTypes.length} tür</p>
              </div>
            </div>

            <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Egzersiz Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Egzersiz Kaydet</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExercise} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Egzersiz Türü</Label>
                    <Select value={exerciseType} onValueChange={(v: ExerciseType) => setExerciseType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>
                            <span className="flex items-center gap-2">
                              <span>{t.emoji}</span>
                              {t.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Süre (dakika)</Label>
                    <Input
                      type="number"
                      value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(e.target.value)}
                      placeholder="30"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mesafe (km, isteğe bağlı)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={exerciseDistance}
                        onChange={(e) => setExerciseDistance(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kalori (isteğe bağlı)</Label>
                      <Input
                        type="number"
                        value={exerciseCalories}
                        onChange={(e) => setExerciseCalories(e.target.value)}
                        placeholder="300"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="share-exercise"
                      checked={shareExercise}
                      onCheckedChange={setShareExercise}
                    />
                    <Label htmlFor="share-exercise">Paylaş</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    Kaydet
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Mood */}
          <TabsContent value="mood" className="space-y-4">
            {todayMood ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Bugünkü ruh haliniz</p>
                <div className="text-6xl mb-2">
                  {moodTypes.find(m => m.value === todayMood.mood)?.emoji}
                </div>
                <p className="text-xl font-medium">
                  {moodTypes.find(m => m.value === todayMood.mood)?.label}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-center text-muted-foreground">Bugün kendinizi nasıl hissediyorsunuz?</p>
                <div className="grid grid-cols-5 gap-2">
                  {moodTypes.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => handleAddMood(mood.value)}
                      className={`p-3 rounded-lg transition-all hover:scale-110 ${mood.color}`}
                    >
                      <div className="text-2xl">{mood.emoji}</div>
                      <div className="text-xs mt-1">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mood Stats */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Duygu Durumu İstatistiği</p>
              <div className="flex gap-1 h-8">
                {Object.entries(moodStats).map(([mood, count]) => {
                  const total = Object.values(moodStats).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const moodInfo = moodTypes.find(m => m.value === mood);
                  if (count === 0) return null;
                  return (
                    <div
                      key={mood}
                      className="h-full flex items-center justify-center text-xs"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: moodInfo?.color.split(' ')[0].replace('bg-', '').replace('100', '500') || '#ccc'
                      }}
                      title={`${moodInfo?.label}: ${count}`}
                    >
                      {percentage > 15 && moodInfo?.emoji}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
