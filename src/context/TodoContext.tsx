import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Todo, Project } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface TodoContextType {
  todos: Todo[];
  projects: Project[];
  addTodo: (todo: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'completed' | 'completedAt' | 'tags'>) => void;
  toggleTodo: (todoId: string) => void;
  deleteTodo: (todoId: string) => void;
  updateTodo: (todoId: string, updates: Partial<Todo>) => void;
  getTodosByProject: (projectId: string) => Todo[];
  getTodosByPriority: (priority: 'low' | 'medium' | 'high') => Todo[];
  getCompletedTodos: () => Todo[];
  getPendingTodos: () => Todo[];
  getTodayTodos: () => Todo[];
  
  addProject: (project: Omit<Project, 'id' | 'userId' | 'createdAt' | 'completedHours' | 'status'>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  getActiveProjects: () => Project[];
  addHoursToProject: (projectId: string, hours: number) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const TODOS_KEY = 'focustrack_todos';
const PROJECTS_KEY = 'focustrack_projects';

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const todosData = safeGetItem<Todo[]>(TODOS_KEY, []);
    const projectsData = safeGetItem<Project[]>(PROJECTS_KEY, []);
    
    setTodos(todosData);
    setProjects(projectsData);
  }, []);

  useEffect(() => {
    safeSetItem(TODOS_KEY, todos);
  }, [todos]);

  useEffect(() => {
    safeSetItem(PROJECTS_KEY, projects);
  }, [projects]);

  // Todo functions
  const addTodo = useCallback((todoData: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'completed' | 'completedAt' | 'tags'>) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const newTodo: Todo = {
      ...todoData,
      id: `todo_${Date.now()}`,
      userId: user.id,
      completed: false,
      tags: [],
      createdAt: new Date(),
    };

    setTodos(prev => [newTodo, ...prev]);
    toast.success('Görev eklendi');
  }, [user]);

  const toggleTodo = useCallback((todoId: string) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === todoId) {
        const completed = !todo.completed;
        if (completed) {
          toast.success('Görev tamamlandı! ✅');
        }
        return {
          ...todo,
          completed,
          completedAt: completed ? new Date() : undefined,
        };
      }
      return todo;
    }));
  }, []);

  const deleteTodo = useCallback((todoId: string) => {
    setTodos(prev => prev.filter(t => t.id !== todoId));
    toast.success('Görev silindi');
  }, []);

  const updateTodo = useCallback((todoId: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo =>
      todo.id === todoId ? { ...todo, ...updates } : todo
    ));
  }, []);

  const getTodosByProject = useCallback((projectId: string) => {
    if (!user) return [];
    return todos.filter(t => t.userId === user.id && t.projectId === projectId);
  }, [todos, user]);

  const getTodosByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    if (!user) return [];
    return todos.filter(t => t.userId === user.id && t.priority === priority && !t.completed);
  }, [todos, user]);

  const getCompletedTodos = useCallback(() => {
    if (!user) return [];
    return todos.filter(t => t.userId === user.id && t.completed);
  }, [todos, user]);

  const getPendingTodos = useCallback(() => {
    if (!user) return [];
    return todos.filter(t => t.userId === user.id && !t.completed);
  }, [todos, user]);

  const getTodayTodos = useCallback(() => {
    if (!user) return [];
    const today = new Date().toISOString().split('T')[0];
    return todos.filter(t => 
      t.userId === user.id && 
      !t.completed && 
      t.dueDate && 
      new Date(t.dueDate).toISOString().split('T')[0] === today
    );
  }, [todos, user]);

  // Project functions
  const addProject = useCallback((projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'completedHours' | 'status'>) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const newProject: Project = {
      ...projectData,
      id: `project_${Date.now()}`,
      userId: user.id,
      completedHours: 0,
      status: 'active',
      createdAt: new Date(),
    };

    setProjects(prev => [newProject, ...prev]);
    toast.success('Proje oluşturuldu');
  }, [user]);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, ...updates } : project
    ));
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    // Also delete associated todos
    setTodos(prev => prev.filter(t => t.projectId !== projectId));
    toast.success('Proje silindi');
  }, []);

  const getActiveProjects = useCallback(() => {
    if (!user) return [];
    return projects.filter(p => p.userId === user.id && p.status === 'active');
  }, [projects, user]);

  const addHoursToProject = useCallback((projectId: string, hours: number) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return { ...project, completedHours: project.completedHours + hours };
      }
      return project;
    }));
  }, []);

  return (
    <TodoContext.Provider value={{
      todos,
      projects,
      addTodo,
      toggleTodo,
      deleteTodo,
      updateTodo,
      getTodosByProject,
      getTodosByPriority,
      getCompletedTodos,
      getPendingTodos,
      getTodayTodos,
      addProject,
      updateProject,
      deleteProject,
      getActiveProjects,
      addHoursToProject,
    }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}
