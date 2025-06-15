import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-item.component.html'
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  
  // Events للتفاعل مع المكون الأب
  @Output() toggleComplete = new EventEmitter<number>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<number>();
  @Output() duplicateTask = new EventEmitter<Task>();
  @Output() setReminder = new EventEmitter<Task>();
  
  // حالة توسع البطاقة
  isExpanded = signal(false);

  // Toggle expansion state
  toggleExpand(): void {
    this.isExpanded.update(current => !current);
  }

  // Event handlers
  onToggleComplete(): void {
    this.toggleComplete.emit(this.task.id);
  }

  onEdit(): void {
    this.editTask.emit(this.task);
  }

  onDelete(): void {
    this.deleteTask.emit(this.task.id);
  }

  onDuplicate(): void {
    this.duplicateTask.emit(this.task);
  }

  onSetReminder(): void {
    this.setReminder.emit(this.task);
  }

  // Utility methods
  getShortDescription(): string {
    if (!this.task.description) return '';
    return this.task.description.length > 100 
      ? this.task.description.substring(0, 100)
      : this.task.description;
  }

  isOverdue(): boolean {
    if (!this.task.dueDate || this.task.completed) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }

  getDueDateText(): string {
    if (!this.task.dueDate) return '';
    
    if (this.isOverdue()) {
      return 'متأخرة منذ';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'موعد الانتهاء اليوم';
    } else if (diffDays === 1) {
      return 'موعد الانتهاء غداً';
    } else if (diffDays > 0) {
      return 'موعد الانتهاء خلال';
    } else {
      return 'متأخرة منذ';
    }
  }

  getRelativeDate(date: Date): string {
    const targetDate = new Date(date);
    const today = new Date();
    
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays === 0) {
      if (diffHours === 0) {
        if (diffMinutes === 0) {
          return 'الآن';
        } else if (diffMinutes < 60) {
          return `منذ ${diffMinutes} دقيقة`;
        }
      } else if (diffHours < 24) {
        return `منذ ${diffHours} ساعة`;
      }
      return 'اليوم';
    } else if (diffDays === 1) {
      return 'أمس';
    } else if (diffDays < 7) {
      return `منذ ${diffDays} أيام`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
    }
  }

  // Styling methods
  getCheckboxClass(): string {
    if (this.task.completed) {
      return 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 shadow-lg';
    }
    return 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md';
  }

  getTitleClass(): string {
    if (this.task.completed) {
      return 'text-gray-500 line-through';
    }
    return 'text-gray-800 group-hover:text-blue-600';
  }

  getDescriptionClass(): string {
    if (this.task.completed) {
      return 'text-gray-400 line-through';
    }
    return 'text-gray-600';
  }

  getPriorityClass(): string {
    const baseClasses = 'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 hover:shadow-md';
    
    switch (this.task.priority) {
      case 'high':
        return `${baseClasses} bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200 hover:from-red-100 hover:to-red-200`;
      case 'medium':
        return `${baseClasses} bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200`;
      case 'low':
        return `${baseClasses} bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200 hover:from-green-100 hover:to-green-200`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200 hover:from-gray-100 hover:to-gray-200`;
    }
  }

  getPriorityDotClass(): string {
    switch (this.task.priority) {
      case 'high':
        return 'bg-red-500 shadow-red-300';
      case 'medium':
        return 'bg-yellow-500 shadow-yellow-300';
      case 'low':
        return 'bg-green-500 shadow-green-300';
      default:
        return 'bg-gray-500 shadow-gray-300';
    }
  }

  getPriorityLabel(): string {
    switch (this.task.priority) {
      case 'high':
        return 'عالية الأولوية';
      case 'medium':
        return 'متوسطة الأولوية';
      case 'low':
        return 'منخفضة الأولوية';
      default:
        return 'غير محددة';
    }
  }

  getPriorityStripeClass(): string {
    if (this.task.completed) {
      return 'bg-gradient-to-r from-green-400 to-green-600';
    }
    
    switch (this.task.priority) {
      case 'high':
        return 'bg-gradient-to-r from-red-400 to-red-600';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'low':
        return 'bg-gradient-to-r from-green-400 to-green-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  }

  getDueDateClass(): string {
    if (this.task.completed) {
      return 'bg-gray-100 text-gray-600 border-gray-200';
    }

    if (!this.task.dueDate) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'bg-red-100 text-red-800 border-red-200 animate-pulse'; // متأخر
    } else if (diffDays === 0) {
      return 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse'; // اليوم
    } else if (diffDays <= 3) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // قريب
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200'; // بعيد
    }
  }
}