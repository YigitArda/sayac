import { useState } from 'react';
import { 
  Home, Clock, Plus, BarChart3, User, Menu,
  Target, Brain, BookOpen, Moon, Calendar, Settings,
  Heart, StickyNote, Sparkles, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onQuickAdd: () => void;
}

const quickTabs = [
  { id: 'dashboard', icon: Home, label: 'Ana Sayfa' },
  { id: 'couple', icon: Heart, label: 'Bizim Akış' },
  { id: 'timer', icon: Clock, label: 'Sayaç' },
  { id: 'profile', icon: User, label: 'Profil' },
];

const allTabs = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
  { id: 'couple', label: 'Bizim Akış', icon: Heart },
  { id: 'timer', label: 'Sayaç', icon: Clock },
  { id: 'goals', label: 'Hedefler', icon: Target },
  { id: 'todos', label: 'Görevler', icon: Zap },
  { id: 'wellness', label: 'Wellness', icon: Brain },
  { id: 'stats', label: 'İstatistik', icon: BarChart3 },
  { id: 'books', label: 'Kitaplar', icon: BookOpen },
  { id: 'sleep', label: 'Uyku', icon: Moon },
  { id: 'calendar', label: 'Takvim', icon: Calendar },
  { id: 'notes', label: 'Notlar', icon: StickyNote },
  { id: 'smart', label: 'Akıllı Özellikler', icon: Sparkles },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export function MobileNav({ activeTab, onTabChange, onQuickAdd }: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Floating Quick Add Button */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg z-40"
        onClick={onQuickAdd}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 pb-safe">
        <div className="flex items-center justify-around py-2">
          {quickTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <tab.icon className={cn(
                'w-5 h-5',
                activeTab === tab.id && 'fill-current'
              )} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}

          {/* Menu Button */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground">
                <Menu className="w-5 h-5" />
                <span className="text-[10px]">Menü</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Menü</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 space-y-1">
                {allTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left',
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
