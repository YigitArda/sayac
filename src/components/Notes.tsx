import { useState, useRef } from 'react';
import { BookOpen, Lightbulb, Mic, Plus, Trash2, Search, Calendar, Heart } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNotes } from '@/context/NotesContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { format } from '@/lib/utils';

const MOODS = [
  { value: 'excellent', emoji: '😄', label: 'Harika' },
  { value: 'good', emoji: '🙂', label: 'İyi' },
  { value: 'neutral', emoji: '😐', label: 'Normal' },
  { value: 'bad', emoji: '😕', label: 'Kötü' },
  { value: 'terrible', emoji: '😢', label: 'Berbat' },
];

const IDEA_CATEGORIES = ['Genel', 'İş', 'Kişisel', 'Yaratıcı', 'Proje', 'Diğer'];

export function Notes() {
  const {
    dailyNotes,
    addDailyNote,
    deleteDailyNote,

    ideas,
    addIdea,
    deleteIdea,
    searchIdeas,
    voiceNotes,
    addVoiceNote,
    deleteVoiceNote,
  } = useNotes();
  const { isAuthenticated } = useAuth();

  const [noteContent, setNoteContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [isGratitude, setIsGratitude] = useState(false);
  
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaContent, setIdeaContent] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('Genel');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredIdeas = searchQuery ? searchIdeas(searchQuery) : ideas;

  const handleSaveNote = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    if (!noteContent.trim()) {
      toast.error('Not içeriği boş olamaz');
      return;
    }

    addDailyNote(noteContent, selectedMood, isGratitude);
    setNoteContent('');
    setSelectedMood(undefined);
  };

  const handleSaveIdea = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    if (!ideaTitle.trim()) {
      toast.error('Başlık gereklidir');
      return;
    }

    addIdea(ideaTitle, ideaContent, ideaCategory);
    setIdeaTitle('');
    setIdeaContent('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const title = `Sesli Not ${new Date().toLocaleTimeString()}`;
        addVoiceNote(title, audioBlob, recordingTime);
        setRecordingTime(0);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error('Mikrofon erişimi reddedildi');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Notlar & Fikirler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="gap-1">
              <Calendar className="w-4 h-4" />
              Günlük
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-1">
              <Lightbulb className="w-4 h-4" />
              Fikirler
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-1">
              <Mic className="w-4 h-4" />
              Sesli
            </TabsTrigger>
          </TabsList>

          {/* Daily Notes */}
          <TabsContent value="daily" className="space-y-4">
            <div className="space-y-3">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Bugün neler yaşadınız? Düşüncelerinizi yazın..."
                className="min-h-[100px]"
              />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ruh haliniz:</span>
                <div className="flex gap-1">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value === selectedMood ? undefined : mood.value)}
                      className={`text-xl p-1 rounded transition-all ${
                        selectedMood === mood.value ? 'bg-primary/20 scale-110' : 'hover:bg-muted'
                      }`}
                      title={mood.label}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="gratitude"
                  checked={isGratitude}
                  onChange={(e) => setIsGratitude(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="gratitude" className="text-sm flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Şükran günlüğü olarak kaydet
                </label>
              </div>

              <Button onClick={handleSaveNote} className="w-full">
                Kaydet
              </Button>
            </div>

            {/* Previous Notes */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Önceki Notlar</h4>
              {dailyNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz not yok
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dailyNotes.slice(0, 5).map((note) => (
                    <div key={note.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm line-clamp-2">{note.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(note.date), 'dd MMM')}
                            </span>
                            {note.mood && (
                              <span>
                                {MOODS.find(m => m.value === note.mood)?.emoji}
                              </span>
                            )}
                            {note.isGratitude && (
                              <Heart className="w-3 h-3 text-pink-500" />
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDailyNote(note.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Ideas */}
          <TabsContent value="ideas" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Fikir ara..."
                  className="pl-9"
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Fikir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Fikir</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Başlık</Label>
                      <Input
                        value={ideaTitle}
                        onChange={(e) => setIdeaTitle(e.target.value)}
                        placeholder="Fikir başlığı"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>İçerik</Label>
                      <Textarea
                        value={ideaContent}
                        onChange={(e) => setIdeaContent(e.target.value)}
                        placeholder="Fikrinizi detaylandırın..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select value={ideaCategory} onValueChange={setIdeaCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IDEA_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSaveIdea} className="w-full">
                      Kaydet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {filteredIdeas.map((idea) => (
                <div key={idea.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{idea.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{idea.content}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {idea.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteIdea(idea.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Voice Notes */}
          <TabsContent value="voice" className="space-y-4">
            <div className="text-center py-4">
              <Button
                variant={isRecording ? 'destructive' : 'default'}
                size="lg"
                className="rounded-full w-20 h-20"
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic className="w-8 h-8" />
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                {isRecording ? `Kaydediliyor... ${formatTime(recordingTime)}` : 'Kaydetmek için basın'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Sesli Notlar</h4>
              {voiceNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz sesli not yok
                </p>
              ) : (
                <div className="space-y-2">
                  {voiceNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mic className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{note.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(note.duration)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteVoiceNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
