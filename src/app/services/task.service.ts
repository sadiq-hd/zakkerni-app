import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks = signal<Task[]>([]);
  private nextId = 1;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // استرجاع المهام من التخزين المحلي عند بدء التطبيق (فقط في المتصفح)
    if (this.isBrowser) {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        
        // تحديد nextId بناءً على أكبر معرف موجود
        if (parsedTasks.length > 0) {
          this.nextId = Math.max(...parsedTasks.map((task: Task) => task.id)) + 1;
        }
        
        this.tasks.set(parsedTasks);
      }
    }
  }

  // الحصول على جميع المهام
  getTasks() {
    return this.tasks;
  }

  // إضافة مهمة جديدة
  addTask(task: Omit<Task, 'id' | 'createdAt'>): void {
    const newTask: Task = {
      ...task,
      id: this.nextId++,
      createdAt: new Date()
    };
    
    this.tasks.update(currentTasks => [...currentTasks, newTask]);
    this.saveTasksToLocalStorage();
  }

  // تحديث مهمة موجودة
  updateTask(updatedTask: Task): void {
    this.tasks.update(currentTasks => 
      currentTasks.map(task => 
        task.id === updatedTask.id ? { ...updatedTask } : task
      )
    );
    this.saveTasksToLocalStorage();
  }

  // حذف مهمة
  deleteTask(id: number): void {
    this.tasks.update(currentTasks => 
      currentTasks.filter(task => task.id !== id)
    );
    this.saveTasksToLocalStorage();
  }

  // تبديل حالة اكتمال المهمة
  toggleTaskCompletion(id: number): void {
    this.tasks.update(currentTasks => 
      currentTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    this.saveTasksToLocalStorage();
  }

  // تصفية المهام حسب الحالة
  getFilteredTasks(filter: 'all' | 'active' | 'completed') {
    return this.tasks().filter(task => {
      if (filter === 'all') return true;
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });
  }

  // حفظ المهام في التخزين المحلي (فقط في المتصفح)
  private saveTasksToLocalStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem('tasks', JSON.stringify(this.tasks()));
    }
  }
}