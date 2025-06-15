import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';

interface FilterOption {
  value: 'all' | 'active' | 'completed';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit {
  // Signals for reactive state management
  private tasks = computed(() => this.taskService.getTasks()());
  private currentFilter = signal<'all' | 'active' | 'completed'>('all');
  searchTerm = '';
  
  // Filter options
  filters: FilterOption[] = [
    { 
      value: 'all', 
      label: 'الكل', 
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    { 
      value: 'active', 
      label: 'نشطة', 
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    { 
      value: 'completed', 
      label: 'مكتملة', 
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    // أي عمليات تهيئة إضافية
  }

  // Computed property for filtered tasks
  get filteredTasks(): Task[] {
    let filtered = this.taskService.getFilteredTasks(this.currentFilter());
    
    // تطبيق البحث
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }

  // Filter methods
  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.currentFilter.set(filter);
  }

  onSearch(): void {
    // البحث يتم تلقائياً عبر getter filteredTasks
  }

  // Task actions
  toggleTaskCompletion(taskId: number): void {
    this.taskService.toggleTaskCompletion(taskId);
  }

  editTask(task: Task): void {
    // يمكن إضافة منطق التعديل هنا
    // مثل فتح modal أو الانتقال لصفحة التعديل
    console.log('تعديل المهمة:', task);
  }

  deleteTask(taskId: number): void {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      this.taskService.deleteTask(taskId);
    }
  }

  // Utility methods for statistics
  getTotalTasks(): number {
    return this.tasks().length;
  }

  getCompletedTasks(): number {
    return this.tasks().filter(task => task.completed).length;
  }

  getRemainingTasks(): number {
    return this.tasks().filter(task => !task.completed).length;
  }

  getOverdueTasks(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.tasks().filter(task => 
      !task.completed && 
      task.dueDate && 
      new Date(task.dueDate) < today
    ).length;
  }

  getCompletionPercentage(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    return Math.round((this.getCompletedTasks() / total) * 100);
  }

  getFilterCount(filter: 'all' | 'active' | 'completed'): number {
    return this.taskService.getFilteredTasks(filter).length;
  }

  // Styling methods
  getFilterButtonClass(filter: 'all' | 'active' | 'completed'): string {
    const isActive = this.currentFilter() === filter;
    const baseClasses = 'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg transform scale-105 focus:ring-blue-500`;
    }
    return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300`;
  }

  getCheckboxClass(completed: boolean): string {
    if (completed) {
      return 'bg-green-500 border-green-500';
    }
    return 'bg-white border-gray-300 hover:border-blue-400';
  }

  getTitleClass(completed: boolean): string {
    if (completed) {
      return 'text-gray-500 line-through';
    }
    return 'text-gray-800';
  }

  getDescriptionClass(completed: boolean): string {
    if (completed) {
      return 'text-gray-400 line-through';
    }
    return 'text-gray-600';
  }

  getPriorityClass(priority: 'low' | 'medium' | 'high'): string {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
    
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  }

  getPriorityDotClass(priority: 'low' | 'medium' | 'high'): string {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  }

  getPriorityLabel(priority: 'low' | 'medium' | 'high'): string {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return 'غير محدد';
    }
  }

  getDueDateClass(dueDate: Date, completed: boolean): string {
    if (completed) {
      return 'bg-gray-100 text-gray-600 border border-gray-200';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'bg-red-100 text-red-800 border border-red-200'; // متأخر
    } else if (diffDays === 0) {
      return 'bg-orange-100 text-orange-800 border border-orange-200'; // اليوم
    } else if (diffDays <= 3) {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200'; // قريب
    } else {
      return 'bg-blue-100 text-blue-800 border border-blue-200'; // بعيد
    }
  }

  // Date formatting
  formatDate(date: Date): string {
    const taskDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // تحقق من التاريخ
    if (this.isSameDay(taskDate, today)) {
      return 'اليوم';
    } else if (this.isSameDay(taskDate, yesterday)) {
      return 'أمس';
    } else {
      return taskDate.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Empty state messages
  getEmptyStateMessage(): string {
    switch (this.currentFilter()) {
      case 'active':
        return 'لا توجد مهام نشطة';
      case 'completed':
        return 'لا توجد مهام مكتملة';
      default:
        return this.searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد مهام بعد';
    }
  }

  getEmptyStateSubMessage(): string {
    switch (this.currentFilter()) {
      case 'active':
        return 'جميع المهام مكتملة! أحسنت العمل 🎉';
      case 'completed':
        return 'لم تكمل أي مهمة بعد، ابدأ بإنجاز مهامك';
      default:
        return this.searchTerm ? 'جرب البحث بكلمات أخرى' : 'ابدأ بإضافة مهمة جديدة';
    }
  }

  // Track by function for better performance
  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }
}