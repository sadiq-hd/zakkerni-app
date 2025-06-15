import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  
  // Computed للحصول على المهام
  private tasks = computed(() => this.taskService.getTasks()());
  
  // نصائح يومية
  private dailyTips = [
    'قسم المهام الكبيرة إلى مهام صغيرة قابلة للتنفيذ',
    'ابدأ بأصعب المهام في بداية اليوم عندما تكون طاقتك في أوجها',
    'خذ استراحة قصيرة كل 25 دقيقة لتحافظ على تركيزك',
    'رتب أولوياتك باستخدام مصفوفة الأهمية والإلحاح',
    'اكتب مهامك في المساء للاستعداد لليوم التالي',
    'استخدم قاعدة الدقيقتين: إذا كانت المهمة تستغرق أقل من دقيقتين، اعملها فوراً',
    'حدد 3 مهام رئيسية فقط لكل يوم لتجنب التشتت',
    'احتفل بإنجازاتك الصغيرة لتحافظ على دافعيتك'
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    // أي عمليات تهيئة إضافية
  }

  // ================================
  // الإحصائيات الأساسية
  // ================================

  getTotalTasks(): number {
    return this.tasks().length;
  }

  getCompletedTasks(): number {
    return this.tasks().filter(task => task.completed).length;
  }

  getPendingTasks(): number {
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

  // ================================
  // المهام الحديثة
  // ================================

  getRecentTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // الحصول على مهام اليوم والغد
    const todayAndTomorrowTasks = this.tasks().filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });

    // إذا لم توجد مهام لليوم، اعرض آخر المهام المضافة
    if (todayAndTomorrowTasks.length === 0) {
      return this.tasks()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    }

    // ترتيب حسب الأولوية ثم التاريخ
    return todayAndTomorrowTasks
      .sort((a, b) => {
        // ترتيب حسب الأولوية أولاً
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // ثم حسب تاريخ الاستحقاق
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        
        return 0;
      })
      .slice(0, 5);
  }

  // ================================
  // دوال التصميم والعرض
  // ================================

  getTaskPriorityDot(priority: 'high' | 'medium' | 'low'): string {
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

  getTaskStatusIcon(task: Task): string {
    if (task.completed) {
      return 'text-green-500';
    }
    
    if (task.dueDate && this.isTaskOverdue(task)) {
      return 'text-red-500';
    }
    
    return 'text-blue-500';
  }

  getTaskTimeLeft(task: Task): string {
    if (task.completed) {
      return 'مكتملة ✓';
    }

    if (!task.dueDate) {
      return 'بدون موعد محدد';
    }

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `متأخر ${Math.abs(diffDays)} يوم`;
    } else if (diffDays === 0) {
      return 'اليوم';
    } else if (diffDays === 1) {
      return 'غداً';
    } else if (diffDays <= 7) {
      return `خلال ${diffDays} أيام`;
    } else {
      return `خلال ${Math.ceil(diffDays / 7)} أسبوع`;
    }
  }

  // ================================
  // النصائح اليومية
  // ================================

  getDailyTip(): string {
    // استخدام التاريخ لاختيار نصيحة ثابتة لليوم
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const tipIndex = dayOfYear % this.dailyTips.length;
    
    return this.dailyTips[tipIndex];
  }

  // ================================
  // دوال مساعدة
  // ================================

  private isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }}