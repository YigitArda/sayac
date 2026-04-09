import { useState, useEffect } from 'react';
import { Brain, Lightbulb, Clock, Zap, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSmartFeatures } from '@/context/SmartFeaturesContext';
import { useTimer } from '@/hooks/useTimer';
import { toast } from 'sonner';

export function SmartFeatures() {
  const {
    breakReminders,
    toggleBreakReminder,
    deleteBreakReminder,
    shouldSuggestBreak,
    getBestWorkHours,
    getDailyPrediction,
    getTodayProductivityScore,
    getSmartSuggestions,
  } = useSmartFeatures();
  
  const { isRunning, elapsedTime } = useTimer();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);

  // Check for break suggestions
  useEffect(() => {
    if (isRunning) {
      const workMinutes = Math.floor(elapsedTime / 60);
      const breakReminder = shouldSuggestBreak(workMinutes);
      
      if (breakReminder && !showBreakSuggestion) {
        setShowBreakSuggestion(true);
        toast.info(
          <div className="space-y-2">
            <p className="font-medium">☕ Mola Zamanı!</p>
            <p>{breakReminder.workDuration} dakikadır çalışıyorsunuz.</p>
            <p>{breakReminder.breakDuration} dakika mola vermeyi düşünün.</p>
          </div>,
          { duration: 10000 }
        );
      }
    }
  }, [isRunning, elapsedTime, shouldSuggestBreak, showBreakSuggestion]);

  // Update suggestions periodically
  useEffect(() => {
    setSuggestions(getSmartSuggestions());
    const interval = setInterval(() => {
      setSuggestions(getSmartSuggestions());
    }, 60000);
    return () => clearInterval(interval);
  }, [getSmartSuggestions]);

  const prediction = getDailyPrediction();
  const productivity = getTodayProductivityScore();
  const bestHours = getBestWorkHours();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Gelişmeli';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Akıllı Asistan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions" className="text-xs">Öneriler</TabsTrigger>
            <TabsTrigger value="prediction" className="text-xs">Tahminler</TabsTrigger>
            <TabsTrigger value="score" className="text-xs">Puan</TabsTrigger>
            <TabsTrigger value="hours" className="text-xs">Saatler</TabsTrigger>
          </TabsList>

          {/* Smart Suggestions */}
          <TabsContent value="suggestions" className="space-y-3">
            {suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Daha fazla veri toplandıkça akıllı öneriler görünecek
              </p>
            ) : (
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-100 dark:border-purple-800"
                  >
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Break Reminders */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                Mola Hatırlatıcıları
              </h4>
              <div className="space-y-2">
                {breakReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <span className="text-sm">
                      Her {reminder.workDuration} dk çalışmada {reminder.breakDuration} dk mola
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBreakReminder(reminder.id)}
                      >
                        {reminder.isEnabled ? '🟢' : '⚪'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBreakReminder(reminder.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Predictions */}
          <TabsContent value="prediction" className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-1">Bugünkü Tahmin</p>
              <p className="text-3xl font-bold">{Math.round(prediction.predictedWorkMinutes / 60 * 10) / 10}s</p>
              <p className="text-xs text-muted-foreground">
                Güven: %{prediction.confidence}
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm flex items-start gap-2">
                <Lightbulb className="w-4 h-4 mt-0.5 text-blue-500" />
                {prediction.suggestion}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Hedef</p>
                <p className="text-lg font-medium">4s</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Kalan</p>
                <p className="text-lg font-medium">
                  {Math.max(0, 240 - prediction.predictedWorkMinutes)}dk
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Productivity Score */}
          <TabsContent value="score" className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">Bugünkü Verimlilik Puanı</p>
              <p className={`text-5xl font-bold ${getScoreColor(productivity.overallScore)}`}>
                {productivity.overallScore}
              </p>
              <Badge className="mt-2">{getScoreLabel(productivity.overallScore)}</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Çalışma</span>
                  <span>{productivity.workScore}/100</span>
                </div>
                <Progress value={productivity.workScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tutarlılık</span>
                  <span>{productivity.consistencyScore}/100</span>
                </div>
                <Progress value={productivity.consistencyScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Odak</span>
                  <span>{productivity.focusScore}/100</span>
                </div>
                <Progress value={productivity.focusScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Denge</span>
                  <span>{productivity.balanceScore}/100</span>
                </div>
                <Progress value={productivity.balanceScore} className="h-2" />
              </div>
            </div>
          </TabsContent>

          {/* Optimal Hours */}
          <TabsContent value="hours" className="space-y-4">
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">En Verimli Saatleriniz</p>
            </div>
            
            {bestHours.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Daha fazla çalışma verisi toplandıkça optimal saatler görünecek
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {bestHours.map((hour) => (
                  <Badge
                    key={hour}
                    variant="secondary"
                    className="text-lg py-2 px-4"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {hour.toString().padStart(2, '0')}:00
                  </Badge>
                ))}
              </div>
            )}

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <p className="text-sm flex items-start gap-2">
                <Zap className="w-4 h-4 mt-0.5 text-green-500" />
                Bu saatlerde çalışmaya odaklanırsanız verimliliğiniz artar!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
