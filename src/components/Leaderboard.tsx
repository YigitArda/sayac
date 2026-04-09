import { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSocial } from '@/context/SocialContext';
import { useAuth } from '@/context/AuthContext';

export function Leaderboard() {
  const { getLeaderboard, getUserRank } = useSocial();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  const leaderboard = getLeaderboard(period);
  const userRank = user ? getUserRank(user.id) : 0;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center font-medium text-sm">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-100 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Liderlik Tablosu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period Selector */}
        <Tabs value={period} onValueChange={(v: any) => setPeriod(v)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Haftalık</TabsTrigger>
            <TabsTrigger value="monthly">Aylık</TabsTrigger>
            <TabsTrigger value="allTime">Tüm Zamanlar</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* User's Rank */}
        {user && userRank > 0 && (
          <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Sizin Sıranız</p>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">#{userRank}</p>
              <p className="text-xs text-muted-foreground">sıra</p>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                entry.userId === user?.id ? 'ring-2 ring-primary ring-offset-2' : ''
              } ${getRankStyle(entry.rank)}`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              
              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.userAvatar} />
                <AvatarFallback>{entry.userName[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{entry.userName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {entry.workHours}s çalışma
                  </span>
                  <span>•</span>
                  <span>{entry.readingHours}s okuma</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold">{entry.score.toLocaleString()}</p>
                <Badge variant="secondary" className="text-xs">
                  🔥 {entry.streak} gün
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center">
          Puanlar çalışma, okuma ve streak sürelerine göre hesaplanır
        </p>
      </CardContent>
    </Card>
  );
}
