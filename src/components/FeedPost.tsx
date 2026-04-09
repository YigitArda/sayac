import { Clock, Image as ImageIcon, MessageSquare, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCouple } from '@/context/CoupleContext';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime } from '@/lib/utils';
import type { FeedPost as FeedPostType } from '@/types/couple';

interface FeedPostProps {
  post: FeedPostType;
  onDelete?: () => void;
}

const reactions = ['❤️', '🔥', '👏', '💪'] as const;

export function FeedPost({ post, onDelete }: FeedPostProps) {
  const { user } = useAuth();
  const { addReaction } = useCouple();
  const isMyPost = user?.id === post.userId;

  const renderContent = () => {
    switch (post.type) {
      case 'work':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Çalışma Oturumu</span>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-2xl font-bold">{Math.floor((post.content.duration || 0) / 60)}s {post.content.duration! % 60}dk</p>
              <p className="text-sm text-muted-foreground">{post.content.category}</p>
              {post.content.description && (
                <p className="text-sm mt-1">{post.content.description}</p>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-500">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Not</span>
            </div>
            <p className="text-lg whitespace-pre-wrap">{post.content.text}</p>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-500">
              <ImageIcon className="w-5 h-5" />
              <span className="font-medium">Fotoğraf</span>
            </div>
            {post.content.imageUrl && (
              <img 
                src={post.content.imageUrl} 
                alt={post.content.caption || 'Paylaşılan fotoğraf'}
                className="w-full rounded-lg object-cover max-h-80"
              />
            )}
            {post.content.caption && (
              <p className="text-muted-foreground">{post.content.caption}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`w-full ${isMyPost ? 'border-blue-200 dark:border-blue-800' : 'border-pink-200 dark:border-pink-800'}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.userAvatar ? (
              <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full" />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMyPost ? 'bg-blue-100 dark:bg-blue-900' : 'bg-pink-100 dark:bg-pink-900'}`}>
                <span className={`font-medium ${isMyPost ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'}`}>
                  {post.userName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium">{isMyPost ? 'Sen' : post.userName}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(new Date(post.createdAt))}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isMyPost && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
              {isMyPost ? 'Sen' : 'Partnerin'}
            </span>
          </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Reactions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {!isMyPost && reactions.map((reaction) => (
              <Button
                key={reaction}
                variant="ghost"
                size="sm"
                className={`text-lg ${post.partnerReaction === reaction ? 'bg-pink-100 dark:bg-pink-900' : ''}`}
                onClick={() => addReaction(post.id, reaction)}
              >
                {reaction}
              </Button>
            ))}
            {isMyPost && (
              <span className="text-sm text-muted-foreground">
                {post.partnerReaction ? `Partnerin: ${post.partnerReaction}` : 'Henüz reaksiyon yok'}
              </span>
            )}
          </div>
          {post.partnerReaction && !isMyPost && (
            <span className="text-lg">{post.partnerReaction}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
