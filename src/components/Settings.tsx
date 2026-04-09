// import { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Volume2, VolumeX, Download, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme, ACCENT_COLORS } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useWellness } from '@/context/WellnessContext';
import { toast } from 'sonner';

const soundTypes = [
  { value: 'none', label: 'Kapalı', emoji: '🔇' },
  { value: 'white_noise', label: 'Beyaz Gürültü', emoji: '🌊' },
  { value: 'rain', label: 'Yağmur', emoji: '🌧️' },
  { value: 'ocean', label: 'Okyanus', emoji: '🌊' },
  { value: 'forest', label: 'Orman', emoji: '🌲' },
  { value: 'cafe', label: 'Kafe', emoji: '☕' },
  { value: 'lofi', label: 'Lo-Fi', emoji: '🎵' },
];

export function SettingsPanel() {
  const { theme, setThemeMode, setAccentColor, setFontSize, isDark, toggleDarkMode, sound, setSoundType, setSoundVolume, toggleSound } = useTheme();
  const { user } = useAuth();
  const { timerSessions, sleepEntries, readingSessions } = useData();
  const { meditationSessions, exerciseEntries, waterEntries, moodEntries } = useWellness();

  const handleExportData = () => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const exportData = {
      user,
      timerSessions: timerSessions.filter(s => s.userId === user.id),
      sleepEntries: sleepEntries.filter(s => s.userId === user.id),
      readingSessions: readingSessions.filter(s => s.userId === user.id),
      meditationSessions: meditationSessions.filter(s => s.userId === user.id),
      exerciseEntries: exerciseEntries.filter(s => s.userId === user.id),
      waterEntries: waterEntries.filter(s => s.userId === user.id),
      moodEntries: moodEntries.filter(s => s.userId === user.id),
      exportedAt: new Date(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focustrack-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Veriler dışa aktarıldı');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Ayarlar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Görünüm</TabsTrigger>
            <TabsTrigger value="sound">Ses</TabsTrigger>
            <TabsTrigger value="data">Veri</TabsTrigger>
          </TabsList>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            {/* Theme Mode */}
            <div className="space-y-3">
              <Label>Tema</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme.mode === 'light' ? 'default' : 'outline'}
                  className="gap-2"
                  onClick={() => setThemeMode('light')}
                >
                  <Sun className="w-4 h-4" />
                  Açık
                </Button>
                <Button
                  variant={theme.mode === 'dark' ? 'default' : 'outline'}
                  className="gap-2"
                  onClick={() => setThemeMode('dark')}
                >
                  <Moon className="w-4 h-4" />
                  Koyu
                </Button>
                <Button
                  variant={theme.mode === 'system' ? 'default' : 'outline'}
                  className="gap-2"
                  onClick={() => setThemeMode('system')}
                >
                  <Monitor className="w-4 h-4" />
                  Sistem
                </Button>
              </div>
            </div>

            {/* Quick Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div>
                  <p className="font-medium">{isDark ? 'Koyu Mod' : 'Açık Mod'}</p>
                  <p className="text-xs text-muted-foreground">Hızlı geçiş</p>
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
            </div>

            {/* Accent Color */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Ana Renk
              </Label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      theme.accentColor === color ? 'border-gray-800 scale-110 ring-2 ring-offset-2' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <Label>Yazı Boyutu</Label>
              <Select value={theme.fontSize} onValueChange={(v: any) => setFontSize(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Küçük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="large">Büyük</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Sound */}
          <TabsContent value="sound" className="space-y-6">
            {/* Sound Type */}
            <div className="space-y-3">
              <Label>Arka Plan Sesi</Label>
              <Select value={sound.type} onValueChange={(v: any) => setSoundType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {soundTypes.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-2">
                        <span>{s.emoji}</span>
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume */}
            <div className="space-y-3">
              <Label>Ses Seviyesi ({sound.volume}%)</Label>
              <div className="flex items-center gap-3">
                <VolumeX className="w-5 h-5 text-muted-foreground" />
                <Slider
                  value={[sound.volume]}
                  onValueChange={([v]) => setSoundVolume(v)}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Play/Pause */}
            {sound.type !== 'none' && (
              <Button
                variant={sound.isPlaying ? 'default' : 'outline'}
                className="w-full gap-2"
                onClick={toggleSound}
              >
                {sound.isPlaying ? '⏸️ Durdur' : '▶️ Oynat'}
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Arka plan sesleri odaklanmanıza yardımcı olur
            </p>
          </TabsContent>

          {/* Data */}
          <TabsContent value="data" className="space-y-6">
            {/* Export */}
            <div className="space-y-3">
              <Label>Veri Dışa Aktarma</Label>
              <p className="text-sm text-muted-foreground">
                Tüm verilerinizi JSON formatında indirin
              </p>
              <Button onClick={handleExportData} className="w-full gap-2">
                <Download className="w-4 h-4" />
                Verileri İndir
              </Button>
            </div>

            {/* Stats Summary */}
            <div className="space-y-3">
              <Label>Veri Özeti</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Çalışma Oturumu</p>
                  <p className="text-xl font-bold">{timerSessions.filter(s => s.userId === user?.id).length}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Uyku Kaydı</p>
                  <p className="text-xl font-bold">{sleepEntries.filter(s => s.userId === user?.id).length}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Okuma Oturumu</p>
                  <p className="text-xl font-bold">{readingSessions.filter(s => s.userId === user?.id).length}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Meditasyon</p>
                  <p className="text-xl font-bold">{meditationSessions.filter(s => s.userId === user?.id).length}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
