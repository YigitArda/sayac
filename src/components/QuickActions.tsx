import { useState } from 'react';
import { Play, Plus, Moon, BookOpen, Droplets, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTimer } from '@/hooks/useTimer';
import { useData } from '@/context/DataContext';
import { useWellness } from '@/context/WellnessContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  hidden?: boolean;
  onClose?: () => void;
}

export function QuickActions({ hidden = false, onClose }: QuickActionsProps) {
  const { isAuthenticated } = useAuth();
  const { isRunning, start, stop, elapsedTime } = useTimer();
  const { addTimerSession } = useData();
  const { addWaterEntry } = useWellness();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);

  if (hidden) return null;

  const handleStartWork = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    start();
    setShowTimerDialog(true);
    toast.success('Çalışma başladı! 💪');
  };

  const handleStopWork = () => {
    const durationMinutes = Math.floor(elapsedTime / 60);
    if (durationMinutes >= 1) {
      addTimerSession({
        duration: durationMinutes,
        category: 'Çalışma',
        startedAt: new Date(Date.now() - elapsedTime * 1000),
        endedAt: new Date(),
        isShared: false,
      });
      toast.success(`${durationMinutes} dk çalışma kaydedildi!`);
    }
    stop();
    setShowTimerDialog(false);
  };

  const handleAddWater = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    addWaterEntry(1);
  };

  const handleAction = (callback: () => void) => {
    callback();
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      icon: isRunning ? <Check className="w-6 h-6" /> : <Play className="w-6 h-6" />,
      label: isRunning ? 'Bitir' : 'Başlat',
      color: isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
      onClick: isRunning ? handleStopWork : handleStartWork,
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      label: 'Su',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: handleAddWater,
    },
    {
      icon: <Moon className="w-6 h-6" />,
      label: 'Uyku',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => toast.info('Uyku ekranına gidin'),
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: 'Kitap',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => toast.info('Kitap ekranına gidin'),
    },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            isOpen ? 'bg-red-500 rotate-45' : 'bg-primary'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </Button>

        {/* Quick Actions Menu */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action.onClick)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg transition-all duration-200 active:scale-95 ${action.color}`}
                style={{
                  animation: `slideIn 0.2s ease-out ${index * 0.05}s both`,
                }}
              >
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timer Dialog */}
      <Dialog open={showTimerDialog} onOpenChange={setShowTimerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Çalışıyorsunuz...</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="text-6xl font-mono font-bold text-primary mb-4">
              {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:
              {(elapsedTime % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-muted-foreground">Odaklanın, başarı yakın!</p>
          </div>
          <Button onClick={handleStopWork} variant="destructive" className="w-full">
            Çalışmayı Bitir
          </Button>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
