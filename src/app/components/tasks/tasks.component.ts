import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskListComponent } from '../task-list/task-list.component';
import { TaskService } from '../../services/task.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { NotificationService } from '../../services/notification.service.service';
import { ExportHelperService } from '../../services/export-helper.service';
import { Task } from '../../models/task';
import { PdfExportOptions, TaskStats } from '../../interfaces/pdf-export.interface';

interface TaskFilters {
  status: 'all' | 'pending' | 'completed' | 'overdue';
  priority: 'all' | 'high' | 'medium' | 'low';
  dueDate: 'all' | 'today' | 'tomorrow' | 'this-week' | 'no-date';
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TaskListComponent],
  templateUrl: './tasks.component.html'
})
export class TasksComponent implements OnInit, OnDestroy {
  
  // ================================
  // الحالة والإشارات
  // ================================
  
  showAdvancedFilter = signal(false);
  viewMode = signal<'list' | 'grid'>('list');
  
  filters: TaskFilters = {
    status: 'all',
    priority: 'all',
    dueDate: 'all'
  };
  
  sortBy = 'created-desc';
  currentPage = 1;
  itemsPerPage = 10;
  
  // البيانات المحسوبة
  private allTasks = computed(() => this.taskService.getTasks()());
  private filteredTasks = computed(() => this.applyTaskFilters());

  constructor(
    private taskService: TaskService,
    private pdfExportService: PdfExportService,
    private notificationService: NotificationService,
    private exportHelper: ExportHelperService
  ) {}

  ngOnInit(): void {
    this.loadViewPreferences();
  }

  ngOnDestroy(): void {
    this.saveViewPreferences();
  }

  // ================================
  // إدارة الفلاتر
  // ================================

  toggleAdvancedFilter(): void {
    this.showAdvancedFilter.update(current => !current);
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.filteredTasks();
  }

  clearFilters(): void {
    this.filters = { status: 'all', priority: 'all', dueDate: 'all' };
    this.sortBy = 'created-desc';
    this.currentPage = 1;
  }

  // ================================
  // منطق الفلترة والترتيب
  // ================================

  private applyTaskFilters(): Task[] {
    let filtered = [...this.allTasks()];

    // فلتر الحالة
    if (this.filters.status !== 'all') {
      switch (this.filters.status) {
        case 'completed':
          filtered = filtered.filter(task => task.completed);
          break;
        case 'pending':
          filtered = filtered.filter(task => !task.completed && !this.isTaskOverdue(task));
          break;
        case 'overdue':
          filtered = filtered.filter(task => !task.completed && this.isTaskOverdue(task));
          break;
      }
    }

    // فلتر الأولوية
    if (this.filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === this.filters.priority);
    }

    // فلتر التاريخ
    if (this.filters.dueDate !== 'all') {
      filtered = this.filterByDueDate(filtered, this.filters.dueDate);
    }

    // تطبيق الترتيب
    return this.sortTasks(filtered);
  }

  private filterByDueDate(tasks: Task[], filter: string): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === tomorrow.getTime();
        });
      case 'this-week':
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate <= weekEnd;
        });
      case 'no-date':
        return tasks.filter(task => !task.dueDate);
      default:
        return tasks;
    }
  }

  private sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      switch (this.sortBy) {
        case 'created-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority-desc':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'due-date-asc':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title, 'ar');
        default:
          return 0;
      }
    });
  }

  private isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  // ================================
  // إحصائيات المهام
  // ================================

  getTaskStats(): TaskStats {
    const tasks = this.allTasks();
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      pending: tasks.filter(task => !task.completed && !this.isTaskOverdue(task)).length,
      overdue: tasks.filter(task => !task.completed && this.isTaskOverdue(task)).length
    };
  }

  getCompletionPercentage(): number {
    const stats = this.getTaskStats();
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }

  // ================================
  // خصائص العرض
  // ================================

  get filteredTasksCount(): number {
    return this.filteredTasks().length;
  }

  get totalTasksCount(): number {
    return this.allTasks().length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTasksCount / this.itemsPerPage);
  }

  get getFilteredTasks(): Task[] {
    return this.filteredTasks();
  }

  get hasVisibleTasks(): boolean {
    return this.filteredTasksCount > 0;
  }

  get hasAnyTasks(): boolean {
    return this.totalTasksCount > 0;
  }

  // ================================
  // إدارة طرق العرض
  // ================================

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  getViewModeClass(mode: 'list' | 'grid'): string {
    const isActive = this.viewMode() === mode;
    return isActive 
      ? 'bg-blue-600 text-white shadow-md'
      : 'text-gray-600 hover:bg-gray-200';
  }

  getFilterButtonClass(): string {
    return this.showAdvancedFilter() 
      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      : 'bg-blue-100 text-blue-600 hover:bg-blue-200 focus:ring-blue-300';
  }

  // ================================
  // إدارة التصفح (Pagination)
  // ================================

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }

  getPageButtonClass(page: number): string {
    return page === this.currentPage
      ? 'bg-blue-600 text-white shadow-md'
      : 'bg-white text-gray-700 hover:bg-gray-50';
  }

  // ================================
  // تصدير PDF
  // ================================

  async exportTasksToPDF(): Promise<void> {
    try {
      const tasks = this.filteredTasks();
      
      if (tasks.length === 0) {
        this.notificationService.showAlert('لا توجد مهام للتصدير', 'warning');
        return;
      }

      const stats = this.getTaskStats();
      const options: PdfExportOptions = {
        title: 'تقرير المهام - ذكرني',
        includeStats: true,
        includeCompletedTasks: true,
        orientation: 'portrait',
        format: 'a4',
        language: 'ar'
      };

      const loadingToast = this.notificationService.showLoadingToast(`جاري تصدير ${tasks.length} مهمة...`);

      try {
        await this.pdfExportService.exportTasksToPDF(tasks, stats, options);
        this.notificationService.hideToast(loadingToast);
        this.notificationService.showSuccessToast(`تم تصدير ${tasks.length} مهمة بنجاح إلى PDF`);
      } catch (error) {
        this.notificationService.hideToast(loadingToast);
        throw error;
      }

    } catch (error) {
      console.error('خطأ في تصدير PDF:', error);
      this.notificationService.showErrorToast('حدث خطأ أثناء تصدير PDF');
    }
  }

  async exportDetailedReport(): Promise<void> {
    try {
      const tasks = this.allTasks();
      const stats = this.getTaskStats();
      
      if (tasks.length === 0) {
        this.notificationService.showAlert('لا توجد مهام لإنشاء تقرير مفصل', 'warning');
        return;
      }

      const loadingToast = this.notificationService.showLoadingToast('جاري إنشاء التقرير المفصل...');

      try {
        await this.pdfExportService.exportDetailedReport(tasks, stats, this.filters);
        this.notificationService.hideToast(loadingToast);
        this.notificationService.showSuccessToast('تم إنشاء التقرير المفصل بنجاح');
      } catch (error) {
        this.notificationService.hideToast(loadingToast);
        throw error;
      }

    } catch (error) {
      console.error('خطأ في إنشاء التقرير المفصل:', error);
      this.notificationService.showErrorToast('حدث خطأ أثناء إنشاء التقرير المفصل');
    }
  }

  async exportHtmlToPdf(): Promise<void> {
    try {
      const tasks = this.filteredTasks();
      const stats = this.getTaskStats();
      
      if (tasks.length === 0) {
        this.notificationService.showAlert('لا توجد مهام للتصدير', 'warning');
        return;
      }

      const loadingToast = this.notificationService.showLoadingToast('جاري تصدير العرض الحالي...');

      try {
        const completionPercentage = this.getCompletionPercentage();
        const htmlContent = this.exportHelper.generateArabicPrintHTML(tasks, stats, completionPercentage);
        
        // إنشاء عنصر HTML مؤقت للتصدير
        const exportElement = document.createElement('div');
        exportElement.id = 'temp-export-element';
        exportElement.innerHTML = htmlContent;
        exportElement.style.cssText = 'position: absolute; left: -9999px; top: -9999px;';
        document.body.appendChild(exportElement);

        await this.pdfExportService.exportHtmlElementToPDF(
          'temp-export-element', 
          `مهام_${new Date().toISOString().split('T')[0]}.pdf`
        );
        
        // إزالة العنصر المؤقت
        document.body.removeChild(exportElement);
        this.notificationService.hideToast(loadingToast);
        this.notificationService.showSuccessToast('تم تصدير العرض الحالي إلى PDF');
      } catch (error) {
        this.notificationService.hideToast(loadingToast);
        throw error;
      }

    } catch (error) {
      console.error('خطأ في تصدير HTML:', error);
      this.notificationService.showErrorToast('حدث خطأ أثناء تصدير العرض');
    }
  }

  async showExportOptions(): Promise<void> {
    const selectedType = await this.notificationService.showExportOptions();
    
    if (!selectedType) return;

    const tasks = this.filteredTasks();
    const stats = this.getTaskStats();

    switch (selectedType) {
      case 'print':
        // طباعة مباشرة من المتصفح (الأفضل للعربية)
        this.pdfExportService.printTasksReport(tasks, stats);
        break;
      case 'html':
        // تصدير HTML للحفظ والطباعة اليدوية
        this.pdfExportService.exportAsHTML(tasks, stats);
        this.notificationService.showSuccessToast('تم تحميل التقرير كملف HTML. يمكنك طباعته من المتصفح.');
        break;
      case 'csv':
        // تصدير بيانات CSV
        this.pdfExportService.exportAsCSV(tasks);
        this.notificationService.showSuccessToast('تم تحميل بيانات المهام كملف CSV.');
        break;
      case 'copy':
        // نسخ للحافظة
        await this.pdfExportService.copyReportToClipboard(tasks, stats);
        break;
      default:
        this.previewExport();
        break;
    }
  }

  // ================================
  // طرق تصدير إضافية
  // ================================

  exportAsHTML(): void {
    const tasks = this.filteredTasks();
    const stats = this.getTaskStats();
    
    if (tasks.length === 0) {
      this.notificationService.showAlert('لا توجد مهام للتصدير', 'warning');
      return;
    }

    this.pdfExportService.exportAsHTML(tasks, stats);
    this.notificationService.showSuccessToast('تم تحميل التقرير كملف HTML. يمكنك طباعته من المتصفح.');
  }

  exportAsCSV(): void {
    const tasks = this.filteredTasks();
    
    if (tasks.length === 0) {
      this.notificationService.showAlert('لا توجد مهام للتصدير', 'warning');
      return;
    }

    this.pdfExportService.exportAsCSV(tasks);
    this.notificationService.showSuccessToast('تم تحميل بيانات المهام كملف CSV.');
  }

  async copyToClipboard(): Promise<void> {
    const tasks = this.filteredTasks();
    const stats = this.getTaskStats();
    
    if (tasks.length === 0) {
      this.notificationService.showAlert('لا توجد مهام للنسخ', 'warning');
      return;
    }

    await this.pdfExportService.copyReportToClipboard(tasks, stats);
  }

  printDirectly(): void {
    const tasks = this.filteredTasks();
    const stats = this.getTaskStats();
    
    if (tasks.length === 0) {
      this.notificationService.showAlert('لا توجد مهام للطباعة', 'warning');
      return;
    }

    this.pdfExportService.printTasksReport(tasks, stats);
  }

  previewExport(): void {
    const tasks = this.filteredTasks();
    const stats = this.getTaskStats();
    
    if (tasks.length === 0) {
      this.notificationService.showAlert('لا توجد مهام للمعاينة', 'warning');
      return;
    }

    // إنشاء نافذة معاينة
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (previewWindow) {
      const completionPercentage = this.getCompletionPercentage();
      const previewContent = this.exportHelper.generateArabicPrintHTML(tasks, stats, completionPercentage);
      previewWindow.document.write(previewContent);
      previewWindow.document.close();
    }
  }

  // ================================
  // الإجراءات السريعة
  // ================================

  refreshTasks(): void {
    console.log('تم تحديث المهام');
    // يمكن إضافة منطق إعادة التحميل من الخادم هنا
  }

  markAllCompleted(): void {
    const pendingTasks = this.filteredTasks().filter(task => !task.completed);
    
    if (pendingTasks.length === 0) {
      this.notificationService.showAlert('لا توجد مهام معلقة لتمييزها كمكتملة', 'warning');
      return;
    }

    if (confirm(`هل تريد تمييز ${pendingTasks.length} مهمة كمكتملة؟`)) {
      pendingTasks.forEach(task => {
        this.taskService.toggleTaskCompletion(task.id);
      });
      this.notificationService.showSuccessToast(`تم تمييز ${pendingTasks.length} مهمة كمكتملة`);
    }
  }

  deleteCompletedTasks(): void {
    const completedTasks = this.allTasks().filter(task => task.completed);
    
    if (completedTasks.length === 0) {
      this.notificationService.showAlert('لا توجد مهام مكتملة للحذف', 'warning');
      return;
    }

    if (confirm(`هل تريد حذف ${completedTasks.length} مهمة مكتملة نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      completedTasks.forEach(task => {
        this.taskService.deleteTask(task.id);
      });
      this.notificationService.showSuccessToast(`تم حذف ${completedTasks.length} مهمة مكتملة`);
    }
  }

  // ================================
  // دوال مساعدة للقوالب
  // ================================

  getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
    return this.exportHelper.getPriorityLabel(priority);
  }

  getStatusLabel(task: Task): string {
    return this.exportHelper.getStatusLabel(task);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  hasActiveFilters(): boolean {
    return this.filters.status !== 'all' || 
           this.filters.priority !== 'all' || 
           this.filters.dueDate !== 'all' ||
           this.sortBy !== 'created-desc';
  }

  // ================================
  // إعدادات العرض المحفوظة
  // ================================

  saveViewPreferences(): void {
    const preferences = {
      viewMode: this.viewMode(),
      itemsPerPage: this.itemsPerPage,
      sortBy: this.sortBy,
      showAdvancedFilter: this.showAdvancedFilter(),
      filters: this.filters
    };
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('taskViewPreferences', JSON.stringify(preferences));
    }
  }

  loadViewPreferences(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('taskViewPreferences');
        if (saved) {
          const preferences = JSON.parse(saved);
          this.viewMode.set(preferences.viewMode || 'list');
          this.itemsPerPage = preferences.itemsPerPage || 10;
          this.sortBy = preferences.sortBy || 'created-desc';
          this.showAdvancedFilter.set(preferences.showAdvancedFilter || false);
          this.filters = preferences.filters || {
            status: 'all',
            priority: 'all',
            dueDate: 'all'
          };
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل إعدادات العرض:', error);
    }
  }

  // ================================
  // تحسين الأداء
  // ================================

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }

  trackByPageNumber(index: number, page: number | string): number | string {
    return page;
  }
}