import { useState, useRef } from 'react';
import { Heart, Plus, Image as ImageIcon, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCouple } from '@/context/CoupleContext';
import { useAuth } from '@/context/AuthContext';
import { FeedPost } from './FeedPost';
import { toast } from 'sonner';

export function CoupleFeed() {
  const { posts, stats, addPost, deletePost } = useCouple();
  const { user, isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Fotoğraf 5MB\'dan küçük olmalı');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextSubmit = () => {
    if (!textContent.trim()) {
      toast.error('Bir şeyler yazın');
      return;
    }
    addPost({
      type: 'text',
      content: { text: textContent },
    });
    setTextContent('');
    setDialogOpen(false);
  };

  const handleImageSubmit = () => {
    if (!selectedImage) {
      toast.error('Bir fotoğraf seçin');
      return;
    }
    addPost({
      type: 'image',
      content: { 
        imageUrl: selectedImage,
        caption: imageCaption,
      },
    });
    setSelectedImage(null);
    setImageCaption('');
    setDialogOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <Heart className="w-12 h-12 mx-auto text-pink-400 mb-4" />
          <p className="text-muted-foreground">Paylaşımları görmek için giriş yapın</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 fill-white" />
            <h2 className="text-2xl font-bold">Bizim Akış</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{stats.postsCount}</p>
              <p className="text-sm opacity-80">Paylaşım</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{Math.round(stats.totalWorkHoursTogether)}s</p>
              <p className="text-sm opacity-80">Toplam Çalışma</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.reactionsReceived}</p>
              <p className="text-sm opacity-80">Reaksiyon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Post Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Yeni Paylaşım
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Paylaşım</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">
                <MessageSquare className="w-4 h-4 mr-2" />
                Yazı
              </TabsTrigger>
              <TabsTrigger value="image">
                <ImageIcon className="w-4 h-4 mr-2" />
                Fotoğraf
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <Textarea
                placeholder="Ne paylaşmak istersin?"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={4}
              />
              <Button onClick={handleTextSubmit} className="w-full">
                Paylaş
              </Button>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {selectedImage ? (
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-8 h-8 mr-2" />
                  Fotoğraf Seç
                </Button>
              )}

              <Input
                placeholder="Açıklama (isteğe bağlı)"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
              />

              <Button 
                onClick={handleImageSubmit} 
                className="w-full"
                disabled={!selectedImage}
              >
                Paylaş
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Feed Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz paylaşım yok</p>
              <p className="text-sm text-muted-foreground mt-1">
                İlk paylaşımı sen yap! 💕
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <FeedPost 
              key={post.id} 
              post={post} 
              onDelete={post.userId === user?.id ? () => deletePost(post.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
