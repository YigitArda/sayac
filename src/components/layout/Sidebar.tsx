import { 
  Home, Clock, Target, Brain, BarChart3, User, 
  BookOpen, Moon, Zap, Calendar, Settings, Heart,
  StickyNote, Sparkles, Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile?: boolean;
}

const menuItems = [
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

export function Sidebar({ activeTab, onTabChange, isMobile }: SidebarProps) {
  if (isMobile) {
    return (
      <div className="flex overflow-x-auto pb-2 gap-1 px-2">
        {menuItems.slice(0, 7).map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all',
              activeTab === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <aside className="w-64 h-screen sticky top-0 border-r bg-background overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Timer className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">FocusTrack</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left',
                activeTab === item.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
