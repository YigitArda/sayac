import { useState } from 'react';
import { Clock, BarChart3, Target, Brain, Home, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

// Components
import { Timer } from '@/components/Timer';
import { SleepTracker } from '@/components/SleepTracker';
import { BookTracker } from '@/components/BookTracker';
import { Stats } from '@/components/Stats';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Auth } from '@/components/Auth';
import { Goals } from '@/components/Goals';
import { TodoList } from '@/components/TodoList';
import { Wellness } from '@/components/Wellness';
import { Leaderboard } from '@/components/Leaderboard';
import { Calendar } from '@/components/Calendar';
import { SettingsPanel } from '@/components/Settings';
import { FocusMode } from '@/components/FocusMode';
import { SmartFeatures } from '@/components/SmartFeatures';
import { TimeBlocking } from '@/components/TimeBlocking';
import { Notes } from '@/components/Notes';
import { Reports } from '@/components/Reports';
import { DailyQuote } from '@/components/DailyQuote';
import { DailyTodos } from '@/components/DailyTodos';
import { Dashboard } from '@/components/Dashboard';
import { QuickActions } from '@/components/QuickActions';

// Contexts
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { GoalsProvider } from '@/context/GoalsContext';
import { TodoProvider } from '@/context/TodoContext';
import { WellnessProvider } from '@/context/WellnessContext';
import { SocialProvider } from '@/context/SocialContext';
import { SmartFeaturesProvider } from '@/context/SmartFeaturesContext';
import { TimeBlockingProvider } from '@/context/TimeBlockingContext';
import { NotesProvider } from '@/context/NotesContext';

function AppContent() {
  const [mobileTab, setMobileTab] = useState('home');

  // Mobile Views
  const renderMobileView = () => {
    switch (mobileTab) {
      case 'home':
        return (
          <div className="space-y-4 pb-24">
            <Dashboard />
            <DailyQuote />
            <DailyTodos />
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setMobileTab('timer')}>
                <Clock className="w-6 h-6" />
                <span className="text-sm">Sayaç</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setMobileTab('goals')}>
                <Target className="w-6 h-6" />
                <span className="text-sm">Hedefler</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setMobileTab('wellness')}>
                <Brain className="w-6 h-6" />
                <span className="text-sm">Wellness</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setMobileTab('stats')}>
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">İstatistik</span>
              </Button>
            </div>
            <SmartFeatures />
            <TimeBlocking />
            <Notes />
            <Leaderboard />
          </div>
        );
      case 'timer':
        return (
          <div className="space-y-4 pb-24">
            <Button variant="ghost" onClick={() => setMobileTab('home')} className="mb-2">← Geri</Button>
            <Timer />
            <FocusMode />
            <SleepTracker />
            <BookTracker />
          </div>
        );
      case 'goals':
        return (
          <div className="space-y-4 pb-24">
            <Button variant="ghost" onClick={() => setMobileTab('home')} className="mb-2">← Geri</Button>
            <Goals />
            <TodoList />
          </div>
        );
      case 'wellness':
        return (
          <div className="space-y-4 pb-24">
            <Button variant="ghost" onClick={() => setMobileTab('home')} className="mb-2">← Geri</Button>
            <Wellness />
          </div>
        );
      case 'stats':
        return (
          <div className="space-y-4 pb-24">
            <Button variant="ghost" onClick={() => setMobileTab('home')} className="mb-2">← Geri</Button>
            <Stats />
            <Reports />
            <Calendar />
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-4 pb-24">
            <Auth />
            <ActivityFeed />
            <SettingsPanel />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FocusTrack
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          <div className="col-span-3 space-y-4">
            <Dashboard />
            <DailyQuote />
            <DailyTodos />
            <Auth />
          </div>
          <div className="col-span-6 space-y-4">
            <Timer />
            <FocusMode />
            <div className="grid grid-cols-2 gap-4">
              <Goals />
              <TodoList />
            </div>
            <Wellness />
            <SmartFeatures />
            <Stats />
            <Reports />
          </div>
          <div className="col-span-3 space-y-4">
            <Leaderboard />
            <ActivityFeed />
            <SettingsPanel />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {renderMobileView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 z-50 lg:hidden pb-safe">
        <div className="flex items-center justify-around py-2">
          {[
            { id: 'home', icon: Home, label: 'Ana Sayfa' },
            { id: 'timer', icon: Clock, label: 'Sayaç' },
            { id: 'goals', icon: Target, label: 'Hedefler' },
            { id: 'stats', icon: BarChart3, label: 'İstatistik' },
            { id: 'profile', icon: User, label: 'Profil' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMobileTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                mobileTab === item.id ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Quick Actions - Hide on profile tab */}
      <QuickActions hidden={mobileTab === 'profile'} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <GoalsProvider>
            <TodoProvider>
              <WellnessProvider>
                <SocialProvider>
                  <SmartFeaturesProvider>
                    <TimeBlockingProvider>
                      <NotesProvider>
                        <AppContent />
                        <Toaster position="top-center" />
                      </NotesProvider>
                    </TimeBlockingProvider>
                  </SmartFeaturesProvider>
                </SocialProvider>
              </WellnessProvider>
            </TodoProvider>
          </GoalsProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
