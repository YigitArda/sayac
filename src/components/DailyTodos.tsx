import { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface DailyTodo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'focustrack_daily_todos';

export function DailyTodos() {
  const [todos, setTodos] = useState<DailyTodo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load todos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTodos(parsed);
      } catch (e) {
        console.error('Failed to parse todos', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const addTodo = () => {
    if (!newTodo.trim()) {
      toast.error('Lütfen bir şey yazın');
      return;
    }

    const todo: DailyTodo = {
      id: `todo_${Date.now()}`,
      text: newTodo.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo('');
    toast.success('Eklendi!');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span>Günlük Yapılacaklar</span>
          </div>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              {completedCount}/{totalCount}
            </span>
          )}
        </CardTitle>
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add new todo */}
        <div className="flex gap-2">
          <Input
            placeholder="Bugün ne yapacaksın?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addTodo} size="icon" className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Todo list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {todos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Henüz yapılacak bir şey yok 📝
            </p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all group ${
                  todo.completed ? 'bg-muted/50' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  className="shrink-0"
                />
                <span
                  className={`flex-1 text-sm transition-all ${
                    todo.completed
                      ? 'line-through text-muted-foreground'
                      : 'text-foreground'
                  }`}
                >
                  {todo.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Clear completed button */}
        {completedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTodos(prev => prev.filter(t => !t.completed));
              toast.success('Tamamlananlar temizlendi');
            }}
            className="w-full text-xs text-muted-foreground"
          >
            Tamamlananları Temizle ({completedCount})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
