import { useState, useMemo } from 'react';
import { FileText, TrendingUp, TrendingDown, Minus, Download, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';
import { useWellness } from '@/context/WellnessContext';
import { useAuth } from '@/context/AuthContext';
import { useSmartFeatures } from '@/context/SmartFeaturesContext';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { format } from '@/lib/utils';
import { toast } from 'sonner';

export function Reports() {
  const { user } = useAuth();
  const { getUserTimerSessions, getUserSleepEntries, getUserReadingSessions } = useData();
  const { getUserMeditationSessions, getUserExerciseEntries } = useWellness();
  const { getWeeklyProductivityScores } = useSmartFeatures();

  const [reportPeriod, setReportPeriod] = useState<'week' | 'month'>('week');
  const [comparisonPeriod, setComparisonPeriod] = useState<'last_week' | 'last_month'>('last_week');

  const timerSessions = getUserTimerSessions();
  const sleepEntries = getUserSleepEntries();
  const readingSessions = getUserReadingSessions();
  const meditationSessions = getUserMeditationSessions();
  const exerciseEntries = getUserExerciseEntries();
  const productivityScores = getWeeklyProductivityScores();

  // Calculate current period stats
  const currentStats = useMemo(() => {
    const days = reportPeriod === 'week' ? 7 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const periodWork = timerSessions
      .filter(s => new Date(s.startedAt) >= cutoffDate)
      .reduce((sum, s) => sum + s.duration, 0);

    const periodSleep = sleepEntries
      .filter(s => new Date(s.date) >= cutoffDate)
      .reduce((sum, s) => sum + s.hours, 0);

    const periodReading = readingSessions
      .filter(s => new Date(s.date) >= cutoffDate)
      .reduce((sum, s) => sum + s.duration, 0);

    const periodMeditation = meditationSessions
      .filter(s => new Date(s.completedAt) >= cutoffDate)
      .reduce((sum, s) => sum + s.duration, 0);

    const periodExercise = exerciseEntries
      .filter(s => new Date(s.date) >= cutoffDate)
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      workHours: periodWork / 60,
      sleepHours: periodSleep,
      readingHours: periodReading / 60,
      meditationMinutes: periodMeditation,
      exerciseMinutes: periodExercise,
      sessionCount: timerSessions.filter(s => new Date(s.startedAt) >= cutoffDate).length,
    };
  }, [timerSessions, sleepEntries, readingSessions, meditationSessions, exerciseEntries, reportPeriod]);

  // Calculate previous period stats
  const previousStats = useMemo(() => {
    const days = reportPeriod === 'week' ? 7 : 30;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days * 2);

    const periodWork = timerSessions
      .filter(s => {
        const date = new Date(s.startedAt);
        return date >= startDate && date < endDate;
      })
      .reduce((sum, s) => sum + s.duration, 0);

    const periodSleep = sleepEntries
      .filter(s => {
        const date = new Date(s.date);
        return date >= startDate && date < endDate;
      })
      .reduce((sum, s) => sum + s.hours, 0);

    return {
      workHours: periodWork / 60,
      sleepHours: periodSleep,
    };
  }, [timerSessions, sleepEntries, reportPeriod]);

  // Calculate changes
  const changes = useMemo(() => {
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      workHoursChange: calcChange(currentStats.workHours, previousStats.workHours),
      sleepHoursChange: calcChange(currentStats.sleepHours, previousStats.sleepHours),
    };
  }, [currentStats, previousStats]);

  // Weekly trend data
  const weeklyTrendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayWork = timerSessions
        .filter(s => new Date(s.startedAt).toISOString().split('T')[0] === dateStr)
        .reduce((sum, s) => sum + s.duration, 0) / 60;

      const score = productivityScores.find(
        s => new Date(s.date).toISOString().split('T')[0] === dateStr
      );

      data.push({
        day: format(date, 'dd MMM'),
        workHours: Math.round(dayWork * 10) / 10,
        productivity: score?.overallScore || 0,
      });
    }
    return data;
  }, [timerSessions, productivityScores]);

  // Radar chart data
  const radarData = useMemo(() => [
    { subject: 'Çalışma', A: Math.min(100, (currentStats.workHours / 20) * 100), fullMark: 100 },
    { subject: 'Uyku', A: Math.min(100, (currentStats.sleepHours / 56) * 100), fullMark: 100 },
    { subject: 'Okuma', A: Math.min(100, (currentStats.readingHours / 5) * 100), fullMark: 100 },
    { subject: 'Meditasyon', A: Math.min(100, (currentStats.meditationMinutes / 70) * 100), fullMark: 100 },
    { subject: 'Egzersiz', A: Math.min(100, (currentStats.exerciseMinutes / 150) * 100), fullMark: 100 },
  ], [currentStats]);

  const getChangeIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 5) return 'text-green-500';
    if (change < -5) return 'text-red-500';
    return 'text-yellow-500';
  };

  const handleExportPDF = () => {
    toast.success('PDF raporu indiriliyor... (Demo)');
  };

  const handleExportCSV = () => {
    if (!user) return;

    const csvData = [
      ['Tarih', 'Çalışma (dk)', 'Kategori', 'Açıklama'],
      ...timerSessions.map(s => [
        format(new Date(s.startedAt), 'yyyy-MM-dd'),
        s.duration.toString(),
        s.category,
        s.description || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focustrack-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('CSV raporu indirildi');
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Raporları görmek için giriş yapın</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Raporlar & Analizler
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period Selector */}
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={(v: any) => setReportPeriod(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Bu Hafta</SelectItem>
              <SelectItem value="month">Bu Ay</SelectItem>
            </SelectContent>
          </Select>
          <Select value={comparisonPeriod} onValueChange={(v: any) => setComparisonPeriod(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_week">Geçen Hafta</SelectItem>
              <SelectItem value="last_month">Geçen Ay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Özet</TabsTrigger>
            <TabsTrigger value="trends">Trendler</TabsTrigger>
            <TabsTrigger value="comparison">Karşılaştırma</TabsTrigger>
          </TabsList>

          {/* Summary */}
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Toplam Çalışma</p>
                <p className="text-2xl font-bold">{currentStats.workHours.toFixed(1)}s</p>
                <div className="flex items-center gap-1 mt-1">
                  {getChangeIcon(changes.workHoursChange)}
                  <span className={`text-xs ${getChangeColor(changes.workHoursChange)}`}>
                    %{Math.abs(changes.workHoursChange).toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Toplam Uyku</p>
                <p className="text-2xl font-bold">{currentStats.sleepHours.toFixed(1)}s</p>
                <div className="flex items-center gap-1 mt-1">
                  {getChangeIcon(changes.sleepHoursChange)}
                  <span className={`text-xs ${getChangeColor(changes.sleepHoursChange)}`}>
                    %{Math.abs(changes.sleepHoursChange).toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Okuma</p>
                <p className="text-2xl font-bold">{currentStats.readingHours.toFixed(1)}s</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Oturum Sayısı</p>
                <p className="text-2xl font-bold">{currentStats.sessionCount}</p>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Bu Dönem"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="workHours"
                    stroke="#3b82f6"
                    name="Çalışma (saat)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="productivity"
                    stroke="#10b981"
                    name="Verimlilik"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Ort. Çalışma</p>
                <p className="text-lg font-bold">
                  {(currentStats.workHours / 7).toFixed(1)}s/gün
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Ort. Uyku</p>
                <p className="text-lg font-bold">
                  {(currentStats.sleepHours / 7).toFixed(1)}s/gün
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Verimlilik</p>
                <p className="text-lg font-bold">
                  {productivityScores.length > 0
                    ? Math.round(productivityScores.reduce((a, b) => a + b.overallScore, 0) / productivityScores.length)
                    : 0}
                  /100
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Comparison */}
          <TabsContent value="comparison" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Çalışma Saati</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{previousStats.workHours.toFixed(1)}s</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">{currentStats.workHours.toFixed(1)}s</span>
                  <Badge className={changes.workHoursChange >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                    {changes.workHoursChange >= 0 ? '+' : ''}{changes.workHoursChange.toFixed(0)}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Uyku Saati</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{previousStats.sleepHours.toFixed(1)}s</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">{currentStats.sleepHours.toFixed(1)}s</span>
                  <Badge className={changes.sleepHoursChange >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                    {changes.sleepHoursChange >= 0 ? '+' : ''}{changes.sleepHoursChange.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <p className="text-sm font-medium mb-2">📊 Analiz</p>
              <p className="text-sm text-muted-foreground">
                {changes.workHoursChange > 10
                  ? 'Harika! Çalışma süreniz önemli ölçüde arttı. 🎉'
                  : changes.workHoursChange < -10
                  ? 'Çalışma süreniz azalmış. Hedeflerinizi gözden geçirmeyi düşünün.'
                  : 'Çalışma süreniz stabil. İyi gidiyorsunuz!'}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
