import { useState } from 'react';
import { BookOpen, Plus, Clock, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
// import { format } from '@/lib/utils';

export function BookTracker() {
  const { books, addBook, addReadingSession, getUserReadingSessions } = useData();
  const { isAuthenticated } = useAuth();
  
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isReadingDialogOpen, setIsReadingDialogOpen] = useState(false);
  
  // New book form
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookPages, setNewBookPages] = useState('');
  
  // Reading session form
  const [selectedBookId, setSelectedBookId] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [readingDuration, setReadingDuration] = useState('');
  const [shareReading, setShareReading] = useState(true);

  const userReadingSessions = getUserReadingSessions();
  
  // Calculate total stats
  const totalPagesRead = userReadingSessions.reduce((sum, s) => sum + s.pagesRead, 0);
  const totalReadingTime = userReadingSessions.reduce((sum, s) => sum + s.duration, 0);

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    if (!newBookTitle.trim() || !newBookAuthor.trim()) {
      toast.error('Kitap adı ve yazar gereklidir');
      return;
    }

    const newBook = addBook({
      title: newBookTitle.trim(),
      author: newBookAuthor.trim(),
      totalPages: newBookPages ? parseInt(newBookPages) : undefined,
    });

    toast.success(`"${newBook.title}" eklendi!`);
    setIsBookDialogOpen(false);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookPages('');
    
    // Select the new book
    setSelectedBookId(newBook.id);
  };

  const handleAddReadingSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    if (!selectedBookId) {
      toast.error('Lütfen bir kitap seçin');
      return;
    }

    const pages = parseInt(pagesRead);
    const duration = parseInt(readingDuration);

    if (isNaN(pages) || pages <= 0) {
      toast.error('Geçerli bir sayfa sayısı girin');
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      toast.error('Geçerli bir süre girin (dakika)');
      return;
    }

    const book = books.find(b => b.id === selectedBookId);
    if (!book) return;

    addReadingSession({
      bookId: selectedBookId,
      bookTitle: book.title,
      bookAuthor: book.author,
      pagesRead: pages,
      duration,
      date: new Date(),
      isShared: shareReading,
    });

    toast.success('Okuma oturumu kaydedildi!');
    setIsReadingDialogOpen(false);
    setPagesRead('');
    setReadingDuration('');
  };

  // Get unique books the user has read
  const userBooks = Array.from(new Set(userReadingSessions.map(s => s.bookId)))
    .map(bookId => {
      const book = books.find(b => b.id === bookId);
      const sessions = userReadingSessions.filter(s => s.bookId === bookId);
      return {
        book,
        totalPages: sessions.reduce((sum, s) => sum + s.pagesRead, 0),
        totalTime: sessions.reduce((sum, s) => sum + s.duration, 0),
      };
    })
    .filter(item => item.book);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Kitap Takibi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Toplam Sayfa</p>
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              <BookMarked className="w-5 h-5 text-primary" />
              {totalPagesRead}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Okuma Süresi</p>
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-primary" />
              {Math.floor(totalReadingTime / 60)}s
            </p>
          </div>
        </div>

        {/* Books List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Okunan Kitaplar</h4>
          {userBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Henüz kitap kaydı yok
            </p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {userBooks.map(({ book, totalPages, totalTime }) => (
                <div key={book!.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{book!.title}</p>
                    <p className="text-xs text-muted-foreground">{book!.author}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{totalPages} sayfa</p>
                    <p className="text-xs text-muted-foreground">{Math.floor(totalTime / 60)}s {totalTime % 60}dk</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <Plus className="w-4 h-4" />
                Kitap Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Kitap Ekle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBook} className="space-y-4">
                <div className="space-y-2">
                  <Label>Kitap Adı</Label>
                  <Input
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    placeholder="Kitap adı"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yazar</Label>
                  <Input
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    placeholder="Yazar adı"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sayfa Sayısı (İsteğe Bağlı)</Label>
                  <Input
                    type="number"
                    value={newBookPages}
                    onChange={(e) => setNewBookPages(e.target.value)}
                    placeholder="300"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Kitap Ekle
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isReadingDialogOpen} onOpenChange={setIsReadingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-2">
                <BookOpen className="w-4 h-4" />
                Okuma Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Okuma Oturumu Ekle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddReadingSession} className="space-y-4">
                <div className="space-y-2">
                  <Label>Kitap</Label>
                  <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kitap seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map(book => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} - {book.author}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Okunan Sayfa</Label>
                    <Input
                      type="number"
                      value={pagesRead}
                      onChange={(e) => setPagesRead(e.target.value)}
                      placeholder="20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Süre (dakika)</Label>
                    <Input
                      type="number"
                      value={readingDuration}
                      onChange={(e) => setReadingDuration(e.target.value)}
                      placeholder="30"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="share-reading"
                    checked={shareReading}
                    onCheckedChange={setShareReading}
                  />
                  <Label htmlFor="share-reading">Paylaş</Label>
                </div>
                
                <Button type="submit" className="w-full">
                  Kaydet
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
