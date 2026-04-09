import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DailyNote, Idea, VoiceNote } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface NotesContextType {
  // Daily Notes
  dailyNotes: DailyNote[];
  addDailyNote: (content: string, mood?: string, isGratitude?: boolean) => void;
  updateDailyNote: (id: string, updates: Partial<DailyNote>) => void;
  deleteDailyNote: (id: string) => void;
  getTodayNote: () => DailyNote | undefined;
  getNotesByDate: (date: Date) => DailyNote[];
  
  // Ideas
  ideas: Idea[];
  addIdea: (title: string, content: string, category?: string) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  getIdeasByCategory: (category: string) => Idea[];
  searchIdeas: (query: string) => Idea[];
  
  // Voice Notes
  voiceNotes: VoiceNote[];
  addVoiceNote: (title: string, audioBlob: Blob, duration: number) => void;
  deleteVoiceNote: (id: string) => void;
  getVoiceNoteUrl: (id: string) => string | null;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const DAILY_NOTES_KEY = 'focustrack_daily_notes';
const IDEAS_KEY = 'focustrack_ideas';
const VOICE_NOTES_KEY = 'focustrack_voice_notes';

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);

  // Load data
  useEffect(() => {
    const notesData = safeGetItem<DailyNote[]>(DAILY_NOTES_KEY, []);
    const ideasData = safeGetItem<Idea[]>(IDEAS_KEY, []);
    const voiceData = safeGetItem<VoiceNote[]>(VOICE_NOTES_KEY, []);

    setDailyNotes(notesData);
    setIdeas(ideasData);
    setVoiceNotes(voiceData);
  }, []);

  // Save data
  useEffect(() => {
    safeSetItem(DAILY_NOTES_KEY, dailyNotes);
  }, [dailyNotes]);

  useEffect(() => {
    safeSetItem(IDEAS_KEY, ideas);
  }, [ideas]);

  useEffect(() => {
    safeSetItem(VOICE_NOTES_KEY, voiceNotes);
  }, [voiceNotes]);

  // Daily Note functions
  const addDailyNote = useCallback((content: string, mood?: string, isGratitude: boolean = false) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const today = new Date().toDateString();
    const existingNote = dailyNotes.find(n => 
      n.userId === user.id && 
      new Date(n.date).toDateString() === today &&
      n.isGratitude === isGratitude
    );

    if (existingNote) {
      // Update existing note
      setDailyNotes(prev => prev.map(n => 
        n.id === existingNote.id 
          ? { ...n, content, mood: mood as any, updatedAt: new Date() }
          : n
      ));
      toast.success(isGratitude ? 'Şükran günlüğü güncellendi' : 'Not güncellendi');
    } else {
      // Create new note
      const newNote: DailyNote = {
        id: `note_${Date.now()}`,
        userId: user.id,
        date: new Date(),
        content,
        mood: mood as any,
        tags: [],
        isGratitude,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDailyNotes(prev => [newNote, ...prev]);
      toast.success(isGratitude ? 'Şükran günlüğü eklendi' : 'Not eklendi');
    }
  }, [user, dailyNotes]);

  const updateDailyNote = useCallback((id: string, updates: Partial<DailyNote>) => {
    setDailyNotes(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
    ));
  }, []);

  const deleteDailyNote = useCallback((id: string) => {
    setDailyNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Not silindi');
  }, []);

  const getTodayNote = useCallback(() => {
    if (!user) return undefined;
    const today = new Date().toDateString();
    return dailyNotes.find(n => 
      n.userId === user.id && 
      new Date(n.date).toDateString() === today &&
      !n.isGratitude
    );
  }, [dailyNotes, user]);

  const getNotesByDate = useCallback((date: Date) => {
    if (!user) return [];
    const dateStr = date.toDateString();
    return dailyNotes.filter(n => 
      n.userId === user.id && 
      new Date(n.date).toDateString() === dateStr
    );
  }, [dailyNotes, user]);

  // Idea functions
  const addIdea = useCallback((title: string, content: string, category: string = 'Genel') => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const newIdea: Idea = {
      id: `idea_${Date.now()}`,
      userId: user.id,
      title,
      content,
      category,
      tags: [],
      isVoiceNote: false,
      createdAt: new Date(),
    };

    setIdeas(prev => [newIdea, ...prev]);
    toast.success('Fikir kaydedildi 💡');
  }, [user]);

  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const deleteIdea = useCallback((id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
    toast.success('Fikir silindi');
  }, []);

  const getIdeasByCategory = useCallback((category: string) => {
    if (!user) return [];
    return ideas.filter(i => i.userId === user.id && i.category === category);
  }, [ideas, user]);

  const searchIdeas = useCallback((query: string) => {
    if (!user) return [];
    const lowerQuery = query.toLowerCase();
    return ideas.filter(i => 
      i.userId === user.id &&
      (i.title.toLowerCase().includes(lowerQuery) ||
       i.content.toLowerCase().includes(lowerQuery) ||
       i.tags.some(t => t.toLowerCase().includes(lowerQuery)))
    );
  }, [ideas, user]);

  // Voice Note functions
  const addVoiceNote = useCallback(async (title: string, audioBlob: Blob, duration: number) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    try {
      const audioBase64 = await blobToBase64(audioBlob);
      
      const newVoiceNote: VoiceNote = {
        id: `voice_${Date.now()}`,
        userId: user.id,
        title,
        audioBlob: audioBlob, // Store blob for playback
        duration,
        createdAt: new Date(),
      };

      // Store in localStorage with base64
      const voiceNoteData = {
        ...newVoiceNote,
        audioBlob: audioBase64,
      };

      setVoiceNotes(prev => [...prev, voiceNoteData as unknown as VoiceNote]);
      toast.success('Sesli not kaydedildi 🎙️');
    } catch (error) {
      toast.error('Sesli not kaydedilemedi');
    }
  }, [user]);

  const deleteVoiceNote = useCallback((id: string) => {
    setVoiceNotes(prev => prev.filter(v => v.id !== id));
    toast.success('Sesli not silindi');
  }, []);

  const getVoiceNoteUrl = useCallback((id: string) => {
    const note = voiceNotes.find(v => v.id === id);
    if (!note) return null;
    
    // Create URL from blob
    if (note.audioBlob instanceof Blob) {
      return URL.createObjectURL(note.audioBlob);
    }
    return null;
  }, [voiceNotes]);

  return (
    <NotesContext.Provider value={{
      dailyNotes,
      addDailyNote,
      updateDailyNote,
      deleteDailyNote,
      getTodayNote,
      getNotesByDate,
      ideas,
      addIdea,
      updateIdea,
      deleteIdea,
      getIdeasByCategory,
      searchIdeas,
      voiceNotes,
      addVoiceNote,
      deleteVoiceNote,
      getVoiceNoteUrl,
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
