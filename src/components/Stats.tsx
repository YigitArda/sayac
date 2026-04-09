import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Clock, BookOpen, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Stats() {
  const { getDailyStats, getUserTimerSessions, getUserReadingSessions, getUserSleepEntries } = useData();
  const { user } = useAuth();

  const dailyStats = useMemo(() => getDailyStats(7), [getDailyStats]);
  
  const timerSessions = getUserTimerSessions();
  const readingSessions = getUserReadingSessions();
  const sleepEntries = getUserSleepEntries();

  // Category breakdown for work
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    timerSessions.forEach(session => {
      categories[session.category] = (categories[session.category] || 0) + session.duration;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value: Math.round(value / 60 * 10) / 10 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [timerSessions]);

  // Book reading stats
  const bookData = useMemo(() => {
    const books: Record<string, { title: string; pages: number; time: number }> = {};
    readingSessions.forEach(session => {
      if (!books[session.bookId]) {
        books[session.bookId] = { title: session.bookTitle, pages: 0, time: 0 };
      }
      books[session.bookId].pages += session.pagesRead;
      books[session.bookId].time += session.duration;
    });
    return Object.values(books)
      .map(b => ({ ...b, time: Math.round(b.time / 60 * 10) / 10 }))
      .sort((a, b) => b.pages - a.pages)
      .slice(0, 5);
  }, [readingSessions]);

  // Summary stats
  const totalWorkHours = Math.round(timerSessions.reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10;
  const totalReadingHours = Math.round(readingSessions.reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10;
  const avgSleep = sleepEntries.length > 0
    ? Math.round(sleepEntries.reduce((sum, s) => sum + s.hours, 0) / sleepEntries.length * 10) / 10
    : 0;

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">İstatistikleri görmek için giriş yapın</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          İstatistikler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Çalışma</p>
            <p className="text-xl font-bold text-blue-600">{totalWorkHours}s</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <BookOpen className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Okuma</p>
            <p className="text-xl font-bold text-green-600">{totalReadingHours}s</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Moon className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Uyku</p>
            <p className="text-xl font-bold text-purple-600">{avgSleep}s</p>
          </div>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Günlük</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="books">Kitaplar</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <h4 className="text-sm font-medium">Son 7 Gün Aktivite</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const label = name === 'workMinutes' ? 'Çalışma (dk)' :
                                    name === 'sleepHours' ? 'Uyku (saat)' :
                                    'Okuma (dk)';
                      return [value, label];
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('tr-TR');
                    }}
                  />
                  <Bar dataKey="workMinutes" fill="#3b82f6" name="Çalışma" />
                  <Bar dataKey="readingMinutes" fill="#10b981" name="Okuma" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <h4 className="text-sm font-medium">Çalışma Kategorileri</h4>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Henüz çalışma kaydı yok
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}s`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} saat`, 'Süre']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="books" className="space-y-4">
            <h4 className="text-sm font-medium">Kitap Okuma İstatistikleri</h4>
            {bookData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Henüz okuma kaydı yok
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="title" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        return name === 'pages' ? [`${value} sayfa`, 'Sayfa'] : [`${value} saat`, 'Süre'];
                      }}
                    />
                    <Bar dataKey="pages" fill="#8b5cf6" name="Sayfa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
