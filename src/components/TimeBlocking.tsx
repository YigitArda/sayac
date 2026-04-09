import { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Check, Repeat, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTimeBlocking } from '@/context/TimeBlockingContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const HABIT_TARGETS = [
  { value: 21, label: '21 Gün (Başlangıç)' },
  { value: 66, label: '66 Gün (Ortalama)' },
  { value: 90, label: '90 Gün (Kalıcı)' },
];

export function TimeBlocking() {
  const {
    addTimeBlock,
    deleteTimeBlock,
    toggleTimeBlockComplete,
    getTodayTimeBlocks,
    routines,
    addRoutine,
    deleteRoutine,
    completeRoutine,
    getRoutineProgress,
    habits,
    addHabit,
    toggleHabitComplete,
    getHabitProgress,
    getHabitStreak,
  } = useTimeBlocking();
  const { isAuthenticated } = useAuth();

  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  
  // Form states
  const [blockTitle, setBlockTitle] = useState('');
  const [blockStart, setBlockStart] = useState('09:00');
  const [blockEnd, setBlockEnd] = useState('10:00');
  const [blockColor, setBlockColor] = useState('#3b82f6');
  
  const [routineName, setRoutineName] = useState('');
  const [routineType, setRoutineType] = useState<'morning' | 'evening' | 'custom'>('morning');
  
  const [habitName, setHabitName] = useState('');
  const [habitTarget, setHabitTarget] = useState(21);
  const [habitIcon, setHabitIcon] = useState('💪');

  const todayBlocks = getTodayTimeBlocks();

  const handleAddBlock = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    if (!blockTitle.trim()) {
      toast.error('Başlık gereklidir');
      return;
    }

    addTimeBlock({
      title: blockTitle,
      startTime: blockStart,
      endTime: blockEnd,
      dayOfWeek: selectedDay,
      color: blockColor,
      category: 'Çalışma',
      isRecurring: true,
    });

    setBlockTitle('');
    toast.success('Zaman bloğu eklendi');
  };

  const handleAddRoutine = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    if (!routineName.trim()) {
      toast.error('Rutin adı gereklidir');
      return;
    }

    addRoutine({
      name: routineName,
      type: routineType,
      tasks: [
        { id: `task_${Date.now()}`, title: 'Görev 1', duration: 10, isCompleted: false, order: 1 },
      ],
      isActive: true,
    });

    setRoutineName('');
    toast.success('Rutin oluşturuldu');
  };

  const handleAddHabit = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    if (!habitName.trim()) {
      toast.error('Alışkanlık adı gereklidir');
      return;
    }

    addHabit({
      name: habitName,
      icon: habitIcon,
      color: '#3b82f6',
      targetDays: habitTarget,
    });

    setHabitName('');
    toast.success('Alışkanlık oluşturuldu');
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const icons = ['💪', '📚', '💧', '🧘', '🏃', '😴', '🎯', '✍️', '🎨', '💻'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Zaman Yönetimi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="blocks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="blocks" className="gap-1">
              <Clock className="w-4 h-4" />
              Zaman Blokları
            </TabsTrigger>
            <TabsTrigger value="routines" className="gap-1">
              <Repeat className="w-4 h-4" />
              Rutinler
            </TabsTrigger>
            <TabsTrigger value="habits" className="gap-1">
              <Flame className="w-4 h-4" />
              Alışkanlıklar
            </TabsTrigger>
          </TabsList>

          {/* Time Blocks */}
          <TabsContent value="blocks" className="space-y-4">
            {/* Day Selector */}
            <div className="flex gap-1 overflow-x-auto pb-2">
              {DAYS.map((day, index) => (
                <Button
                  key={day}
                  variant={selectedDay === index ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDay(index)}
                  className="flex-shrink-0"
                >
                  {day}
                </Button>
              ))}
            </div>

            {/* Add Block */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Zaman Bloğu Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Zaman Bloğu Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Başlık</Label>
                    <Input
                      value={blockTitle}
                      onChange={(e) => setBlockTitle(e.target.value)}
                      placeholder="Örn: Derse Çalışma"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Başlangıç</Label>
                      <Input
                        type="time"
                        value={blockStart}
                        onChange={(e) => setBlockStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bitiş</Label>
                      <Input
                        type="time"
                        value={blockEnd}
                        onChange={(e) => setBlockEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Renk</Label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setBlockColor(c)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            blockColor === c ? 'border-gray-800' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddBlock} className="w-full">
                    Ekle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Today's Blocks */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Bugünün Blokları</h4>
              {todayBlocks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Bugün için zaman bloğu yok
                </p>
              ) : (
                <div className="space-y-2">
                  {todayBlocks.map((block) => (
                    <div
                      key={block.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                        block.isCompleted ? 'opacity-50' : ''
                      }`}
                      style={{ borderLeftColor: block.color, backgroundColor: `${block.color}10` }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={block.isCompleted}
                          onCheckedChange={() => toggleTimeBlockComplete(block.id)}
                        />
                        <div>
                          <p className={`font-medium ${block.isCompleted ? 'line-through' : ''}`}>
                            {block.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {block.startTime} - {block.endTime}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTimeBlock(block.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Routines */}
          <TabsContent value="routines" className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Rutin Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rutin Oluştur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>İsim</Label>
                    <Input
                      value={routineName}
                      onChange={(e) => setRoutineName(e.target.value)}
                      placeholder="Örn: Sabah Rutini"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tür</Label>
                    <Select value={routineType} onValueChange={(v: any) => setRoutineType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Sabah Rutini</SelectItem>
                        <SelectItem value="evening">Akşam Rutini</SelectItem>
                        <SelectItem value="custom">Özel Rutin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddRoutine} className="w-full">
                    Oluştur
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-2">
              {routines.map((routine) => (
                <div key={routine.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {routine.type === 'morning' ? '🌅' : routine.type === 'evening' ? '🌙' : '⚡'}
                      </span>
                      <span className="font-medium">{routine.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {routine.streak > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Flame className="w-3 h-3" />
                          {routine.streak}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => completeRoutine(routine.id)}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRoutine(routine.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={getRoutineProgress(routine.id)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {routine.tasks.length} görev
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Habits */}
          <TabsContent value="habits" className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Alışkanlık Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alışkanlık Oluştur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>İsim</Label>
                    <Input
                      value={habitName}
                      onChange={(e) => setHabitName(e.target.value)}
                      placeholder="Örn: Her Gün 30dk Kitap Oku"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hedef Gün</Label>
                    <Select value={habitTarget.toString()} onValueChange={(v) => setHabitTarget(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HABIT_TARGETS.map((t) => (
                          <SelectItem key={t.value} value={t.value.toString()}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>İkon</Label>
                    <div className="flex gap-2 flex-wrap">
                      {icons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setHabitIcon(icon)}
                          className={`w-10 h-10 rounded-lg border-2 text-xl ${
                            habitIcon === icon ? 'border-primary bg-primary/10' : 'border-transparent bg-muted'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddHabit} className="w-full">
                    Oluştur
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-2 gap-2">
              {habits.map((habit) => {
                const progress = getHabitProgress(habit.id);
                const streak = getHabitStreak(habit.id);
                const isCompletedToday = habit.completedDates.some(
                  (d) => new Date(d).toDateString() === new Date().toDateString()
                );

                return (
                  <div
                    key={habit.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isCompletedToday
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-transparent bg-muted'
                    }`}
                    onClick={() => toggleHabitComplete(habit.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{habit.icon}</span>
                      {streak > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {streak}
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm truncate">{habit.name}</p>
                    <div className="mt-2">
                      <Progress value={progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {habit.completedDates.length}/{habit.targetDays} gün
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
