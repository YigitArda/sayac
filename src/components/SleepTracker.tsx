import { useState } from 'react';
import { Moon, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { format } from '@/lib/utils';

const sleepQualities = [
  { value: 'poor', label: 'Kötü', color: 'text-red-500' },
  { value: 'fair', label: 'Orta', color: 'text-yellow-500' },
  { value: 'good', label: 'İyi', color: 'text-blue-500' },
  { value: 'excellent', label: 'Mükemmel', color: 'text-green-500' },
];

export function SleepTracker() {
  const { addSleepEntry, getUserSleepEntries } = useData();
  const { isAuthenticated } = useAuth();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hours, setHours] = useState('7');
  const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [notes, setNotes] = useState('');

  const userSleepEntries = getUserSleepEntries();
  
  // Calculate average sleep
  const avgSleep = userSleepEntries.length > 0
    ? (userSleepEntries.reduce((sum, entry) => sum + entry.hours, 0) / userSleepEntries.length).toFixed(1)
    : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      toast.error('Geçerli bir uyku saati girin (0-24)');
      return;
    }

    addSleepEntry({
      date: new Date(date),
      hours: hoursNum,
      quality,
      notes: notes || undefined,
    });

    toast.success('Uyku kaydı eklendi!');
    setIsDialogOpen(false);
    setHours('7');
    setNotes('');
  };

  const getQualityLabel = (q: string) => sleepQualities.find(sq => sq.value === q)?.label || q;
  const getQualityColor = (q: string) => sleepQualities.find(sq => sq.value === q)?.color || '';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Uyku Takibi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Ortalama Uyku</p>
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5 text-primary" />
              {avgSleep} saat
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Toplam Kayıt</p>
            <p className="text-2xl font-bold">{userSleepEntries.length}</p>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Son Kayıtlar</h4>
          {userSleepEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Henüz uyku kaydı yok
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {userSleepEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{entry.hours} saat</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${getQualityColor(entry.quality)}`}>
                    {getQualityLabel(entry.quality)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Uyku Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uyku Kaydı Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tarih</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Uyku Süresi (saat)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="7.5"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Uyku Kalitesi</Label>
                <Select value={quality} onValueChange={(v: any) => setQuality(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sleepQualities.map(sq => (
                      <SelectItem key={sq.value} value={sq.value}>{sq.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Notlar (İsteğe Bağlı)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Rüya gördüm, vs..."
                />
              </div>
              
              <Button type="submit" className="w-full">
                Kaydet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
