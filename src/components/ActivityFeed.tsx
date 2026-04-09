import { useState } from 'react';
import { Heart, MessageCircle, Clock, BookOpen, Moon, Share2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { Activity, TimerSession, ReadingSession } from '@/types';
import { format } from '@/lib/utils';

function ActivityItem({ activity }: { activity: Activity }) {
  const { likeActivity } = useData();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(activity.likes);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Beğenmek için giriş yapın');
      return;
    }
    
    if (!liked) {
      likeActivity(activity.id);
      setLikeCount(prev => prev + 1);
      setLiked(true);
    }
  };

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'timer':
        return <Clock className="w-4 h-4" />;
      case 'reading':
        return <BookOpen className="w-4 h-4" />;
      case 'sleep':
        return <Moon className="w-4 h-4" />;
      default:
        return <Share2 className="w-4 h-4" />;
    }
  };

  const getActivityContent = () => {
    switch (activity.type) {
      case 'timer': {
        const data = activity.data as TimerSession;
        return (
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{data.duration} dakika</span> çalışma yaptı
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{data.category}</Badge>
              {data.description && (
                <span className="text-xs text-muted-foreground truncate">{data.description}</span>
              )}
            </div>
          </div>
        );
      }
      case 'reading': {
        const data = activity.data as ReadingSession;
        return (
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{data.pagesRead} sayfa</span> okudu
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{data.bookTitle}</Badge>
              <span className="text-xs text-muted-foreground">{data.duration} dk</span>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'timer':
        return 'bg-blue-100 text-blue-600';
      case 'reading':
        return 'bg-green-100 text-green-600';
      case 'sleep':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="w-10 h-10">
        <AvatarImage src={activity.userAvatar} />
        <AvatarFallback>{activity.userName[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{activity.userName}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(activity.createdAt), 'dd MMM HH:mm')}
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <div className={`p-1.5 rounded-full ${getActivityColor()}`}>
            {getActivityIcon()}
          </div>
          <div className="flex-1">
            {getActivityContent()}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 h-7 ${liked ? 'text-red-500' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
          </Button>
          
          <Button variant="ghost" size="sm" className="gap-1 h-7">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Yorum</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const { getSharedActivities } = useData();
  const activities = getSharedActivities();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Topluluk Akışı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Henüz paylaşılan aktivite yok
            </p>
          ) : (
            activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
