import { useState } from 'react';
import { Target, Plus, Trophy, TrendingUp, Calendar, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGoals } from '@/context/GoalsContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { format } from '@/lib/utils';

const goalCategories = [
  { value: 'work', label: 'Çalışma', unit: 'saat', icon: '💼' },
  { value: 'reading', label: 'Okuma', unit: 'saat', icon: '📚' },
  { value: 'sleep', label: 'Uyku', unit: 'saat', icon: '😴' },
  { value: 'meditation', label: 'Meditasyon', unit: 'dakika', icon: '🧘' },
  { value: 'exercise', label: 'Egzersiz', unit: 'dakika', icon: '💪' },
  { value: 'water', label: 'Su', unit: 'bardak', icon: '💧' },
];

const goalTypes = [
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
];

export function Goals() {
  const { badges, userBadges, addGoal, deleteGoal, getActiveGoals, getCompletedGoals } = useGoals();
  const { isAuthenticated } = useAuth();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [category, setCategory] = useState<'work' | 'sleep' | 'reading' | 'meditation' | 'exercise' | 'water'>('work');
  const [targetValue, setTargetValue] = useState('');

  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    if (!title.trim() || !targetValue) {
      toast.error('Tüm alanları doldurun');
      return;
    }

    const target = parseFloat(targetValue);
    if (isNaN(target) || target <= 0) {
      toast.error('Geçerli bir hedef değeri girin');
      return;
    }

    const categoryInfo = goalCategories.find(c => c.value === category);
    
    // Calculate end date based on goal type
    const endDate = new Date();
    if (type === 'daily') endDate.setDate(endDate.getDate() + 1);
    else if (type === 'weekly') endDate.setDate(endDate.getDate() + 7);
    else if (type === 'monthly') endDate.setMonth(endDate.getMonth() + 1);

    addGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      category,
      targetValue: target,
      unit: categoryInfo?.unit || '',
      startDate: new Date(),
      endDate,
      isActive: true,
    });

    setIsDialogOpen(false);
    setTitle('');
    setDescription('');
    setTargetValue('');
  };

  const getCategoryInfo = (cat: string) => goalCategories.find(c => c.value === cat);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Hedefler & Rozetler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Hedefler
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Trophy className="w-4 h-4" />
              Rozetler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            {/* Add Goal Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Hedef
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Hedef Oluştur</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hedef Adı</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Günlük 2 saat çalışma"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Açıklama (İsteğe Bağlı)</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detaylar..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {goalCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <span className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                {cat.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Süre</Label>
                      <Select value={type} onValueChange={(v: any) => setType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {goalTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hedef Değer ({getCategoryInfo(category)?.unit})</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder="Örn: 2"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Hedef Oluştur
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Active Goals */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Aktif Hedefler ({activeGoals.length})</h4>
              {activeGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz aktif hedef yok
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeGoals.map((goal) => {
                    const catInfo = getCategoryInfo(goal.category);
                    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                    
                    return (
                      <div key={goal.id} className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{catInfo?.icon}</span>
                            <div>
                              <p className="font-medium text-sm">{goal.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => deleteGoal(goal.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(goal.endDate), 'dd MMM')}'e kadar
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {goal.type === 'daily' ? 'Günlük' : goal.type === 'weekly' ? 'Haftalık' : 'Aylık'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Tamamlanan ({completedGoals.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {completedGoals.slice(0, 3).map((goal) => {
                    const catInfo = getCategoryInfo(goal.category);
                    return (
                      <div key={goal.id} className="p-2 bg-green-50 rounded-lg flex items-center gap-2">
                        <span>{catInfo?.icon}</span>
                        <span className="text-sm line-through opacity-60">{goal.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {badges.map((badge) => {
                const hasBadge = userBadges.some(ub => ub.badgeId === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      hasBadge 
                        ? 'border-transparent bg-gradient-to-br opacity-100' 
                        : 'border-dashed border-gray-200 opacity-50 grayscale'
                    }`}
                    style={hasBadge ? { background: `linear-gradient(135deg, ${badge.color}20, ${badge.color}40)` } : {}}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {userBadges.length} / {badges.length} rozet kazanıldı
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
