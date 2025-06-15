import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';

@Component({
  selector: 'app-task-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-counter.component.html'
})
export class TaskCounterComponent implements OnInit {
  
  // Computed signal للحصول على المهام
  private tasks = computed(() => this.taskService.getTasks()());

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

  // ================================
  // النسب المئوية
  // ================================

  getCompletionPercentage(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    return Math.round((this.getCompletedTasks() / total) * 100);
  }

  getPendingPercentage(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    return Math.round((this.getPendingTasks() / total) * 100);
  }

  getOverduePercentage(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    return Math.round((this.getOverdueTasks() / total) * 100);
  }

  // ================================
  // إحصائيات الأولوية
  // ================================

  getHighPriorityTasks(): number {
    return this.tasks().filter(task => task.priority === 'high').length;
  }

  getMediumPriorityTasks(): number {
    return this.tasks().filter(task => task.priority === 'medium').length;
  }

  getLowPriorityTasks(): number {
    return this.tasks().filter(task => task.priority === 'low').length;
  }

  getHighPriorityPercentage(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    return Math.round((this.getHighPriorityTasks() / total) * 100);
  }

  getMediumPriorityPercentage(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    return Math.round((this.getMediumPriorityTasks() / total) * 100);
  }

  getLowPriorityPercentage(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    return Math.round((this.getLowPriorityTasks() / total) * 100);
  }

  // ================================
  // الإحصائيات الزمنية
  // ================================

  getTodayTasks(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.tasks().filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;
  }

  getWeekTasks(): number {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return this.tasks().filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= startOfWeek && dueDate <= endOfWeek;
    }).length;
  }

  getTasksWithoutDueDate(): number {
    return this.tasks().filter(task => !task.dueDate).length;
  }

  // ================================
  // الرسائل التحفيزية
  // ================================

  getMotivationalMessage(): string {
    const completionRate = this.getCompletionPercentage();
    const total = this.getTotalTasks();
    const overdue = this.getOverdueTasks();

    if (total === 0) {
      return 'ابدأ رحلتك الإنتاجية اليوم!';
    }

    if (overdue > 0) {
      return `لديك ${overdue} مهام متأخرة، حان وقت العمل!`;
    }

    if (completionRate === 100) {
      return '🎉 رائع! أكملت جميع مهامك!';
    } else if (completionRate >= 80) {
      return '⭐ أداء ممتاز! تقترب من الانتهاء!';
    } else if (completionRate >= 60) {
      return '💪 أحسنت! استمر في التقدم!';
    } else if (completionRate >= 40) {
      return '🚀 بداية جيدة، واصل العمل!';
    } else if (completionRate >= 20) {
      return '📈 انطلقت في الطريق الصحيح!';
    } else if (completionRate > 0) {
      return '🌟 بداية ممتازة، استمر!';
    } else {
      return '💡 حان وقت البدء في إنجاز المهام!';
    }
  }

  getMotivationalMessageType(): 'excellent' | 'good' | 'start' | 'warning' {
    const completionRate = this.getCompletionPercentage();
    const overdue = this.getOverdueTasks();

    if (overdue > 0) {
      return 'warning';
    }

    if (completionRate >= 80) {
      return 'excellent';
    } else if (completionRate >= 40) {
      return 'good';
    } else {
      return 'start';
    }
  }

  // ================================
  // دوال مساعدة للتحليل المتقدم
  // ================================

  getProductivityScore(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;

    const completed = this.getCompletedTasks();
    const overdue = this.getOverdueTasks();
    const highPriority = this.getHighPriorityTasks();
    const completedHighPriority = this.tasks().filter(
      task => task.completed && task.priority === 'high'
    ).length;

    // حساب النقاط
    let score = (completed / total) * 100; // النسبة الأساسية
    score -= (overdue / total) * 30; // خصم للمهام المتأخرة
    score += (completedHighPriority / Math.max(highPriority, 1)) * 20; // مكافأة للمهام عالية الأولوية

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  getAverageTasksPerDay(): number {
    const tasks = this.tasks();
    if (tasks.length === 0) return 0;

    // حساب عدد الأيام منذ أول مهمة
    const oldestTask = tasks.reduce((oldest, task) => 
      new Date(task.createdAt) < new Date(oldest.createdAt) ? task : oldest
    );

    const daysSinceStart = Math.max(1, 
      Math.ceil((Date.now() - new Date(oldestTask.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    );

    return Math.round((tasks.length / daysSinceStart) * 10) / 10;
  }

  getCompletionStreak(): number {
    const tasks = this.tasks().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    let streak = 0;
    for (const task of tasks) {
      if (task.completed) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // ================================
  // تحليل الأداء الأسبوعي
  // ================================

  getWeeklyCompletion(): { week: string; completed: number; total: number }[] {
    const weeks: { week: string; completed: number; total: number }[] = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekTasks = this.tasks().filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const weekLabel = i === 0 ? 'هذا الأسبوع' : 
                       i === 1 ? 'الأسبوع الماضي' : 
                       `منذ ${i} أسابيع`;

      weeks.push({
        week: weekLabel,
        completed: weekTasks.filter(task => task.completed).length,
        total: weekTasks.length
      });
    }

    return weeks;
  }

  // ================================
  // دوال للرسوم البيانية
  // ================================

  getPriorityDistribution(): { name: string; value: number; color: string }[] {
    return [
      { 
        name: 'عالية', 
        value: this.getHighPriorityTasks(), 
        color: '#ef4444' 
      },
      { 
        name: 'متوسطة', 
        value: this.getMediumPriorityTasks(), 
        color: '#f59e0b' 
      },
      { 
        name: 'منخفضة', 
        value: this.getLowPriorityTasks(), 
        color: '#10b981' 
      }
    ];
  }

  getStatusDistribution(): { name: string; value: number; color: string }[] {
    return [
      { 
        name: 'مكتملة', 
        value: this.getCompletedTasks(), 
        color: '#10b981' 
      },
      { 
        name: 'قيد التنفيذ', 
        value: this.getPendingTasks() - this.getOverdueTasks(), 
        color: '#3b82f6' 
      },
      { 
        name: 'متأخرة', 
        value: this.getOverdueTasks(), 
        color: '#ef4444' 
      }
    ];
  }

  // ================================
  // دوال للتصدير والتقارير
  // ================================

  getTasksReport(): any {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.getTotalTasks(),
        completed: this.getCompletedTasks(),
        pending: this.getPendingTasks(),
        overdue: this.getOverdueTasks(),
        completionRate: this.getCompletionPercentage()
      },
      priorities: {
        high: this.getHighPriorityTasks(),
        medium: this.getMediumPriorityTasks(),
        low: this.getLowPriorityTasks()
      },
      timeAnalysis: {
        today: this.getTodayTasks(),
        thisWeek: this.getWeekTasks(),
        withoutDueDate: this.getTasksWithoutDueDate()
      },
      performance: {
        productivityScore: this.getProductivityScore(),
        averageTasksPerDay: this.getAverageTasksPerDay(),
        completionStreak: this.getCompletionStreak()
      }
    };
  }

  // ================================
  // دوال مساعدة إضافية
  // ================================

  /**
   * حساب معدل الإنتاجية لفترة زمنية محددة
   */
  getProductivityForPeriod(days: number): number {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const periodTasks = this.tasks().filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });

    if (periodTasks.length === 0) return 0;
    
    const completed = periodTasks.filter(task => task.completed).length;
    return Math.round((completed / periodTasks.length) * 100);
  }

  /**
   * الحصول على أكثر يوم إنتاجية في الأسبوع
   */
  getMostProductiveDay(): string {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayStats: { [key: number]: { completed: number; total: number } } = {};

    // تهيئة الإحصائيات
    for (let i = 0; i < 7; i++) {
      dayStats[i] = { completed: 0, total: 0 };
    }

    // حساب الإحصائيات لكل يوم
    this.tasks().forEach(task => {
      const dayOfWeek = new Date(task.createdAt).getDay();
      dayStats[dayOfWeek].total++;
      if (task.completed) {
        dayStats[dayOfWeek].completed++;
      }
    });

    // العثور على اليوم الأكثر إنتاجية
    let mostProductiveDay = 0;
    let highestProductivity = 0;

    for (let i = 0; i < 7; i++) {
      if (dayStats[i].total > 0) {
        const productivity = dayStats[i].completed / dayStats[i].total;
        if (productivity > highestProductivity) {
          highestProductivity = productivity;
          mostProductiveDay = i;
        }
      }
    }

    return days[mostProductiveDay];
  }

  /**
   * التحقق من وجود مهام تحتاج انتباه
   */
  hasTasksNeedingAttention(): boolean {
    return this.getOverdueTasks() > 0 || this.getHighPriorityTasks() > 0;
  }

  /**
   * الحصول على تقدير الوقت المتبقي لإنهاء جميع المهام
   */
  getEstimatedTimeToComplete(): string {
    const pendingTasks = this.getPendingTasks();
    const averagePerDay = this.getAverageTasksPerDay();
    
    if (averagePerDay === 0 || pendingTasks === 0) {
      return 'غير محدد';
    }

    const daysNeeded = Math.ceil(pendingTasks / averagePerDay);
    
    if (daysNeeded === 1) {
      return 'يوم واحد';
    } else if (daysNeeded < 7) {
      return `${daysNeeded} أيام`;
    } else if (daysNeeded < 30) {
      const weeks = Math.ceil(daysNeeded / 7);
      return weeks === 1 ? 'أسبوع واحد' : `${weeks} أسابيع`;
    } else {
      const months = Math.ceil(daysNeeded / 30);
      return months === 1 ? 'شهر واحد' : `${months} أشهر`;
    }
  }

  /**
   * الحصول على اقتراحات للتحسين
   */
  getImprovementSuggestions(): string[] {
    const suggestions: string[] = [];
    const completionRate = this.getCompletionPercentage();
    const overdue = this.getOverdueTasks();
    const highPriority = this.getHighPriorityTasks();

    if (completionRate < 30) {
      suggestions.push('ركز على إنجاز المهام البسيطة أولاً لزيادة الدافعية');
    }

    if (overdue > 0) {
      suggestions.push('أعط الأولوية للمهام المتأخرة لتجنب تراكمها');
    }

    if (highPriority > 5) {
      suggestions.push('قسم المهام عالية الأولوية إلى مهام أصغر');
    }

    if (this.getTasksWithoutDueDate() > this.getTotalTasks() * 0.3) {
      suggestions.push('حدد تواريخ استحقاق للمهام لتحسين التنظيم');
    }

    if (suggestions.length === 0) {
      suggestions.push('أداؤك ممتاز! استمر في الحفاظ على هذا المستوى');
    }

    return suggestions;
  }
}