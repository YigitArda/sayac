import { Clock, Target, TrendingUp, Flame, Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/context/DataContext';
import { useWellness } from '@/context/WellnessContext';
import { useGoals } from '@/context/GoalsContext';
import { useAuth } from '@/context/AuthContext';
import { useSmartFeatures } from '@/context/SmartFeaturesContext';
import { useStreak, getStreakMessage } from '@/hooks/useStreak';
import { format } from '@/lib/utils';

export function Dashboard() {
  const { user } = useAuth();
  const { getUserTimerSessions } = useData();
  const { getTodayWaterIntake } = useWellness();
  const { getActiveGoals } = useGoals();
  const { getTodayProductivityScore } = useSmartFeatures();

  if (!user) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-medium">Hoş Geldiniz! 👋</p>
          <p className="text-sm opacity-80 mt-1">Başlamak için giriş yapın</p>
        </CardContent>
      </Card>
    );
  }

  const today = new Date().toDateString();
  const timerSessions = getUserTimerSessions();
  
  // Use real streak calculation
  const { currentStreak, longestStreak } = useStreak(timerSessions);
  
  // Today's stats
  const todayWorkMinutes = timerSessions
    .filter(s => new Date(s.startedAt).toDateString() === today)
    .reduce((sum, s) => sum + s.duration, 0);
  
  const todayWorkHours = (todayWorkMinutes / 60).toFixed(1);
  const waterIntake = getTodayWaterIntake();
  const activeGoals = getActiveGoals();
  const completedGoalsToday = activeGoals.filter(g => g.currentValue >= g.targetValue).length;
  const productivity = getTodayProductivityScore();
  
  const streak = currentStreak;

  const stats = [
    {
      icon: Clock,
      label: 'Bugün',
      value: `${todayWorkHours}s`,
      subtext: 'çalışma',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Droplets,
      label: 'Su',
      value: `${waterIntake}`,
      subtext: 'bardak',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
    {
      icon: Target,
      label: 'Hedef',
      value: `${completedGoalsToday}/${activeGoals.length}`,
      subtext: 'tamamlandı',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${streak}`,
      subtext: 'gün',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Card */}
      <Card className="w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          
          <div className="relative z-10">
            <p className="text-sm opacity-80">{format(new Date(), 'EEEE, d MMMM')}</p>
            <p className="text-2xl font-bold mt-1">Merhaba, {user.name.split(' ')[0]}! 👋</p>
            <p className="text-sm opacity-80 mt-2">
              {getStreakMessage(currentStreak)}
              {longestStreak > currentStreak && currentStreak > 0 && (
                <span className="block text-xs mt-1 opacity-70">
                  En uzun streak: {longestStreak} gün 🔥
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer active:scale-95">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Productivity Score */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium">Verimlilik</span>
            </div>
            <span className={`text-2xl font-bold ${
              productivity.overallScore >= 70 ? 'text-green-500' :
              productivity.overallScore >= 40 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {productivity.overallScore}
            </span>
          </div>
          <Progress value={productivity.overallScore} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Çalışma: {productivity.workScore}</span>
            <span>Tutarlılık: {productivity.consistencyScore}</span>
            <span>Denge: {productivity.balanceScore}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
