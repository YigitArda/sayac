import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen, Moon, Brain, Dumbbell, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { useWellness } from '@/context/WellnessContext';
import { useAuth } from '@/context/AuthContext';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export function Calendar() {
  const { user } = useAuth();
  const { getUserTimerSessions, getUserSleepEntries, getUserReadingSessions } = useData();
  const { getUserMeditationSessions, getUserExerciseEntries, getUserWaterEntries, getUserMoodEntries } = useWellness();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const timerSessions = getUserTimerSessions();
  const sleepEntries = getUserSleepEntries();
  const readingSessions = getUserReadingSessions();
  const meditationSessions = getUserMeditationSessions();
  const exerciseEntries = getUserExerciseEntries();
  const waterEntries = getUserWaterEntries();
  const moodEntries = getUserMoodEntries();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const getDayData = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return {
      work: timerSessions.filter(s => new Date(s.startedAt).toISOString().split('T')[0] === dateStr),
      sleep: sleepEntries.find(s => new Date(s.date).toISOString().split('T')[0] === dateStr),
      reading: readingSessions.filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr),
      meditation: meditationSessions.filter(s => new Date(s.completedAt).toISOString().split('T')[0] === dateStr),
      exercise: exerciseEntries.filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr),
      water: waterEntries.filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr),
      mood: moodEntries.find(s => new Date(s.date).toISOString().split('T')[0] === dateStr),
    };
  };

  const selectedDayData = selectedDate ? getDayData(selectedDate.getDate()) : null;

  const getActivityColor = (day: number) => {
    const data = getDayData(day);
    const hasActivity = data.work.length > 0 || data.sleep || data.reading.length > 0 || 
                       data.meditation.length > 0 || data.exercise.length > 0;
    
    if (!hasActivity) return '';
    
    const workMinutes = data.work.reduce((sum, s) => sum + s.duration, 0);
    if (workMinutes >= 240) return 'bg-green-500';
    if (workMinutes >= 120) return 'bg-blue-500';
    if (workMinutes >= 60) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Takvimi görmek için giriş yapın</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Aktivite Takvimi
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {MONTHS[month]} {year}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {/* Empty cells */}
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = selectedDate?.getDate() === day;
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-all hover:border-primary ${
                  isToday(day) ? 'ring-2 ring-primary ring-offset-1' : ''
                } ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white'}`}
              >
                <span className="text-sm font-medium">{day}</span>
                <div className={`w-2 h-2 rounded-full mt-1 ${getActivityColor(day)}`} />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span>&lt;1s</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>1-2s</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>2-4s</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>4s+</span>
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDayData && (
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">
              {selectedDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} Aktiviteleri
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {selectedDayData.work.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">
                    {selectedDayData.work.reduce((sum, s) => sum + s.duration, 0)} dk çalışma
                  </span>
                </div>
              )}
              
              {selectedDayData.reading.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span className="text-sm">
                    {selectedDayData.reading.reduce((sum, s) => sum + s.duration, 0)} dk okuma
                  </span>
                </div>
              )}
              
              {selectedDayData.sleep && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <Moon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">{selectedDayData.sleep.hours} saat uyku</span>
                </div>
              )}
              
              {selectedDayData.meditation.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                  <Brain className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">
                    {selectedDayData.meditation.reduce((sum, s) => sum + s.duration, 0)} dk meditasyon
                  </span>
                </div>
              )}
              
              {selectedDayData.exercise.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                  <Dumbbell className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">
                    {selectedDayData.exercise.reduce((sum, s) => sum + s.duration, 0)} dk egzersiz
                  </span>
                </div>
              )}
              
              {selectedDayData.water.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded-lg">
                  <Droplets className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm">
                    {selectedDayData.water.reduce((sum, s) => sum + s.amount, 0)} bardak su
                  </span>
                </div>
              )}
              
              {selectedDayData.mood && (
                <div className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg">
                  <span className="text-2xl">
                    {selectedDayData.mood.mood === 'excellent' ? '😄' :
                     selectedDayData.mood.mood === 'good' ? '🙂' :
                     selectedDayData.mood.mood === 'neutral' ? '😐' :
                     selectedDayData.mood.mood === 'bad' ? '😕' : '😢'}
                  </span>
                  <span className="text-sm">Ruh hali</span>
                </div>
              )}
            </div>
            
            {!selectedDayData.work.length && !selectedDayData.reading.length && 
             !selectedDayData.sleep && !selectedDayData.meditation.length && 
             !selectedDayData.exercise.length && !selectedDayData.water.length && 
             !selectedDayData.mood && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Bu gün için aktivite kaydı yok
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
