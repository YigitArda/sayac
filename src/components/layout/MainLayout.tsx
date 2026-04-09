import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Dashboard } from '@/components/Dashboard';
import { Timer } from '@/components/Timer';
import { SharedTimer } from '@/components/SharedTimer';
import { Goals } from '@/components/Goals';
import { TodoList } from '@/components/TodoList';
import { Wellness } from '@/components/Wellness';
import { Stats } from '@/components/Stats';
import { BookTracker } from '@/components/BookTracker';
import { SleepTracker } from '@/components/SleepTracker';
import { Calendar } from '@/components/Calendar';
import { Notes } from '@/components/Notes';
import { SmartFeatures } from '@/components/SmartFeatures';
import { CoupleFeed } from '@/components/CoupleFeed';
import { Auth } from '@/components/Auth';
import { SettingsPanel } from '@/components/Settings';
import { QuickActions } from '@/components/QuickActions';
import { FocusMode } from '@/components/FocusMode';
import { Reports } from '@/components/Reports';
import { TimeBlocking } from '@/components/TimeBlocking';
import { DailyQuote } from '@/components/DailyQuote';
import { DailyTodos } from '@/components/DailyTodos';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <Dashboard />
            <DailyQuote />
            <DailyTodos />
            <SmartFeatures />
            <TimeBlocking />
          </div>
        );
      case 'timer':
        return (
          <div className="space-y-4">
            <SharedTimer />
            <Timer />
            <FocusMode />
            <SleepTracker />
            <BookTracker />
          </div>
        );
      case 'goals':
        return (
          <div className="space-y-4">
            <Goals />
          </div>
        );
      case 'todos':
        return (
          <div className="space-y-4">
            <TodoList />
          </div>
        );
      case 'wellness':
        return (
          <div className="space-y-4">
            <Wellness />
          </div>
        );
      case 'stats':
        return (
          <div className="space-y-4">
            <Stats />
            <Reports />
          </div>
        );
      case 'books':
        return (
          <div className="space-y-4">
            <BookTracker />
          </div>
        );
      case 'sleep':
        return (
          <div className="space-y-4">
            <SleepTracker />
          </div>
        );
      case 'calendar':
        return (
          <div className="space-y-4">
            <Calendar />
          </div>
        );
      case 'notes':
        return (
          <div className="space-y-4">
            <Notes />
          </div>
        );
      case 'smart':
        return (
          <div className="space-y-4">
            <SmartFeatures />
          </div>
        );
      case 'couple':
        return (
          <div className="space-y-4">
            <CoupleFeed />
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-4">
            <Auth />
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-4">
            <SettingsPanel />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-lg">FocusTrack</span>
          </div>
        </header>

        <main className="p-4 pb-32">
          {renderContent()}
        </main>

        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onQuickAdd={() => setQuickAddOpen(true)}
        />
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hızlı Ekle</DialogTitle>
          </DialogHeader>
          <QuickActions onClose={() => setQuickAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
