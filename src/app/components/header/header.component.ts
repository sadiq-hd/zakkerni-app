import { Component, OnInit, OnDestroy, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  
  // ================================
  // الحالة والإشارات
  // ================================
  
  // حالة القوائم والتحميل
  isMobileMenuOpen = signal(false);
  isLoading = signal(false);
  
  // الوقت والتاريخ الحالي
  currentTime = signal('');
  currentDate = signal('');
  
  private timeSubscription?: Subscription;
  private isBrowser: boolean;

  // Computed properties للإحصائيات
  private tasks = computed(() => this.taskService.getTasks()());

  constructor(
    private taskService: TaskService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.updateDateTime();
    if (this.isBrowser) {
      this.startTimeUpdates();
    }
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
  }

  // ================================
  // إدارة القوائم والتنقل
  // ================================

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(current => !current);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  // التنقل لصفحة إضافة المهام (للاستخدام المستقبلي)
  navigateToAddTask(): void {
    this.router.navigate(['/add-task']);
    this.closeMobileMenu();
  }

  // ================================
  // إحصائيات المهام
  // ================================

  getTodayCompletedTasks(): number {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return this.tasks().filter(task => {
        if (!task.completed) return false;
        // استخدام createdAt بدلاً من updatedAt
        const taskDate = new Date(task.createdAt);
        return taskDate >= today && taskDate < tomorrow;
      }).length;
    } catch {
      return 0;
    }
  }

  getPendingTasks(): number {
    try {
      return this.tasks().filter(task => !task.completed).length;
    } catch {
      return 0;
    }
  }

  getOverdueTasks(): number {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return this.tasks().filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) < today
      ).length;
    } catch {
      return 0;
    }
  }

  getTotalTasks(): number {
    try {
      return this.tasks().length;
    } catch {
      return 0;
    }
  }

  getCompletionPercentage(): number {
    try {
      const total = this.getTotalTasks();
      if (total === 0) return 0;
      const completed = this.tasks().filter(task => task.completed).length;
      return Math.round((completed / total) * 100);
    } catch {
      return 0;
    }
  }

  // ================================
  // إدارة الوقت والتاريخ
  // ================================

  private updateDateTime(): void {
    const now = new Date();
    
    // تحديث الوقت
    this.currentTime.set(now.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
    
    // تحديث التاريخ
    this.currentDate.set(now.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }

  private startTimeUpdates(): void {
    if (this.isBrowser) {
      this.timeSubscription = interval(1000).subscribe(() => {
        this.updateDateTime();
      });
    }
  }

  getCurrentTime(): string {
    return this.currentTime();
  }

  getCurrentDate(): string {
    return this.currentDate();
  }

  // ================================
  // رسائل الترحيب حسب الوقت
  // ================================

  getGreetingMessage(): string {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'صباح الخير';
    } else if (hour >= 12 && hour < 17) {
      return 'نهارك سعيد';
    } else if (hour >= 17 && hour < 21) {
      return 'مساء الخير';
    } else {
      return 'مساء الخير';
    }
  }

  // ================================
  // إدارة حالة التحميل
  // ================================

  showLoading(): void {
    this.isLoading.set(true);
  }

  hideLoading(): void {
    this.isLoading.set(false);
  }

  // ================================
  // دوال مساعدة للواجهة
  // ================================

  // فحص ما إذا كان المسار نشط
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  // تحديد أنماط عناصر التنقل
  getNavItemClass(route: string): string {
    const baseClasses = 'flex items-center px-4 py-2 rounded-xl text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30';
    const isActive = this.isRouteActive(route);
    
    if (isActive) {
      return `${baseClasses} bg-white/20 scale-105`;
    }
    return `${baseClasses} hover:bg-white/10`;
  }

  // ================================
  // إشعارات وتنبيهات
  // ================================

  hasUrgentTasks(): boolean {
    return this.getOverdueTasks() > 0;
  }

  getUrgentTasksMessage(): string {
    const overdue = this.getOverdueTasks();
    if (overdue > 0) {
      return `لديك ${overdue} مهام متأخرة تحتاج انتباه!`;
    }
    return '';
  }

  // ================================
  // تفاعلات المستخدم المتقدمة
  // ================================

  // بحث سريع (للاستخدام المستقبلي)
  onQuickSearch(searchTerm: string): void {
    if (searchTerm.trim()) {
      this.router.navigate(['/tasks'], { 
        queryParams: { search: searchTerm.trim() } 
      });
      this.closeMobileMenu();
    }
  }

  // إجراءات سريعة
  markAllAsCompleted(): void {
    const pendingTasks = this.tasks().filter(task => !task.completed);
    
    if (pendingTasks.length === 0) {
      return;
    }

    if (confirm(`هل تريد تمييز ${pendingTasks.length} مهمة كمكتملة؟`)) {
      this.showLoading();
      
      // محاكاة عملية التحديث
      setTimeout(() => {
        pendingTasks.forEach(task => {
          this.taskService.toggleTaskCompletion(task.id);
        });
        this.hideLoading();
      }, 1000);
    }
  }

  // تصدير المهام
  exportTasks(): void {
    this.showLoading();
    
    setTimeout(() => {
      try {
        const tasks = this.tasks();
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.hideLoading();
      } catch (error) {
        console.error('خطأ في تصدير المهام:', error);
        this.hideLoading();
      }
    }, 1500);
  }

  // مزامنة البيانات
  syncData(): void {
    this.showLoading();
    
    // محاكاة عملية المزامنة
    setTimeout(() => {
      this.hideLoading();
      console.log('تم تحديث البيانات بنجاح');
    }, 2000);
  }

  // ================================
  // إحصائيات متقدمة للهيدر
  // ================================

  getTasksForToday(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.tasks().filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    }).length;
  }

  getProductivityScore(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    
    const completed = this.tasks().filter(task => task.completed).length;
    const overdue = this.getOverdueTasks();
    
    let score = (completed / total) * 100;
    score -= (overdue / total) * 20; // خصم للمهام المتأخرة
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // ================================
  // دوال التحسين والأداء
  // ================================

  // تحسين الأداء للتتبع
  trackByIndex(index: number): number {
    return index;
  }

  // تحديث دوري للإحصائيات
  refreshStats(): void {
    // الإحصائيات تتحدث تلقائياً عبر computed signals
    console.log('تم تحديث الإحصائيات');
  }

  // ================================
  // إعدادات المظهر (للاستخدام المستقبلي)
  // ================================

  toggleTheme(): void {
    // يمكن إضافة تبديل المظهر لاحقاً
    console.log('تبديل المظهر');
  }

  // حفظ تفضيلات الهيدر
  saveHeaderPreferences(): void {
    const preferences = {
      showStats: true,
      showTime: true,
      compactMode: false
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('headerPreferences', JSON.stringify(preferences));
    }
  }

  // تحميل تفضيلات الهيدر
  loadHeaderPreferences(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('headerPreferences');
        if (saved) {
          const preferences = JSON.parse(saved);
          // تطبيق التفضيلات المحفوظة
          console.log('تم تحميل تفضيلات الهيدر:', preferences);
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل تفضيلات الهيدر:', error);
    }
  }
}