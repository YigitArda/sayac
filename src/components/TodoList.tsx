import { useState } from 'react';
import { CheckCircle2, Plus, Trash2, Calendar, Flag, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTodo } from '@/context/TodoContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { format } from '@/lib/utils';
import type { Todo } from '@/types';

const priorities = [
  { value: 'low', label: 'Düşük', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'Orta', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'Yüksek', color: 'bg-red-100 text-red-700' },
];

export function TodoList() {
  const { 
    projects, 
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    addProject,
    getPendingTodos,
    getCompletedTodos,
    getTodayTodos 
  } = useTodo();
  const { isAuthenticated } = useAuth();
  
  const [isTodoDialogOpen, setIsTodoDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  
  // Todo form
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [todoPriority, setTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [todoDueDate, setTodoDueDate] = useState('');
  const [todoProject, setTodoProject] = useState('');
  
  // Project form
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectColor, setProjectColor] = useState('#3b82f6');

  const pendingTodos = getPendingTodos();
  const completedTodos = getCompletedTodos();
  const todayTodos = getTodayTodos();

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    if (!todoTitle.trim()) {
      toast.error('Görev adı gereklidir');
      return;
    }

    addTodo({
      title: todoTitle.trim(),
      description: todoDescription.trim() || undefined,
      priority: todoPriority,
      dueDate: todoDueDate ? new Date(todoDueDate) : undefined,
      projectId: todoProject || undefined,
    });

    setIsTodoDialogOpen(false);
    setTodoTitle('');
    setTodoDescription('');
    setTodoDueDate('');
    setTodoProject('');
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    if (!projectName.trim()) {
      toast.error('Proje adı gereklidir');
      return;
    }

    addProject({
      name: projectName.trim(),
      description: projectDescription.trim() || undefined,
      color: projectColor,
    });

    setIsProjectDialogOpen(false);
    setProjectName('');
    setProjectDescription('');
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || '';
  };

  const getProjectById = (projectId?: string) => {
    return projects.find(p => p.id === projectId);
  };

  const TodoItem = ({ todo }: { todo: Todo }) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
      todo.completed ? 'bg-muted/50' : 'bg-muted'
    }`}>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => toggleTodo(todo.id)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${todo.completed ? 'line-through opacity-60' : ''}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{todo.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge className={`text-xs ${getPriorityColor(todo.priority)}`}>
            <Flag className="w-3 h-3 mr-1" />
            {priorities.find(p => p.value === todo.priority)?.label}
          </Badge>
          {todo.projectId && (
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ borderColor: getProjectById(todo.projectId)?.color }}
            >
              <Folder className="w-3 h-3 mr-1" />
              {getProjectById(todo.projectId)?.name}
            </Badge>
          )}
          {todo.dueDate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(todo.dueDate), 'dd MMM')}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => deleteTodo(todo.id)}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Görevler & Projeler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Dialog open={isTodoDialogOpen} onOpenChange={setIsTodoDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-2">
                <Plus className="w-4 h-4" />
                Görev
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Görev</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTodo} className="space-y-4">
                <div className="space-y-2">
                  <Label>Görev Adı</Label>
                  <Input
                    value={todoTitle}
                    onChange={(e) => setTodoTitle(e.target.value)}
                    placeholder="Ne yapmanız gerekiyor?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Input
                    value={todoDescription}
                    onChange={(e) => setTodoDescription(e.target.value)}
                    placeholder="Detaylar..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Öncelik</Label>
                    <Select value={todoPriority} onValueChange={(v: any) => setTodoPriority(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Son Tarih</Label>
                    <Input
                      type="date"
                      value={todoDueDate}
                      onChange={(e) => setTodoDueDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Proje (İsteğe Bağlı)</Label>
                  <Select value={todoProject} onValueChange={setTodoProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Proje seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Görev Ekle
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Folder className="w-4 h-4" />
                Proje
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Proje</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div className="space-y-2">
                  <Label>Proje Adı</Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Proje adı"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Input
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Detaylar..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Renk</Label>
                  <div className="flex gap-2 flex-wrap">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'].map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          projectColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setProjectColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Proje Oluştur
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Projeler ({projects.length})</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className="flex-shrink-0 p-3 rounded-lg border min-w-[150px]"
                  style={{ borderLeftColor: project.color, borderLeftWidth: '4px' }}
                >
                  <p className="font-medium text-sm">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getPendingTodos().filter(t => t.projectId === project.id).length} görev
                  </p>
                  {project.targetHours && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs">
                        <span>{project.completedHours.toFixed(1)}s</span>
                        <span>{project.targetHours}s</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((project.completedHours / project.targetHours) * 100, 100)}%`,
                            backgroundColor: project.color 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Bekleyen ({pendingTodos.length})
            </TabsTrigger>
            <TabsTrigger value="today">
              Bugün ({todayTodos.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Tamamlanan ({completedTodos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-2 max-h-64 overflow-y-auto">
            {pendingTodos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Bekleyen görev yok 🎉
              </p>
            ) : (
              pendingTodos.map(todo => <TodoItem key={todo.id} todo={todo} />)
            )}
          </TabsContent>

          <TabsContent value="today" className="space-y-2 max-h-64 overflow-y-auto">
            {todayTodos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Bugün için görev yok
              </p>
            ) : (
              todayTodos.map(todo => <TodoItem key={todo.id} todo={todo} />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-2 max-h-64 overflow-y-auto">
            {completedTodos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Henüz tamamlanan görev yok
              </p>
            ) : (
              completedTodos.slice(0, 10).map(todo => <TodoItem key={todo.id} todo={todo} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
