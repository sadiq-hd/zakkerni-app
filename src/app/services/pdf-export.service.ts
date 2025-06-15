import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Task } from '../models/task';

export interface PdfExportOptions {
  title?: string;
  includeStats?: boolean;
  includeCompletedTasks?: boolean;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  language?: 'ar' | 'en';
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() {}

  // ================================
  // الطرق الأصلية (محسنة)
  // ================================

  /**
   * تصدير المهام إلى PDF - محسن للعربية
   */
  async exportTasksToPDF(
    tasks: Task[], 
    stats: TaskStats, 
    options: PdfExportOptions = {}
  ): Promise<void> {
    try {
      const {
        title = 'تقرير المهام - ذكرني',
        includeStats = true,
        includeCompletedTasks = true,
        orientation = 'portrait',
        format = 'a4',
        language = 'ar'
      } = options;

      // فلترة المهام
      const filteredTasks = includeCompletedTasks 
        ? tasks 
        : tasks.filter(task => !task.completed);

      // إنشاء HTML للتصدير
      const htmlContent = this.generateArabicPdfHTML(filteredTasks, stats, title, includeStats);
      
      // تصدير HTML كـ PDF
      await this.exportHTMLContentToPDF(htmlContent, `${title}_${new Date().toISOString().split('T')[0]}.pdf`);

      console.log(`تم تصدير ${filteredTasks.length} مهمة بنجاح`);

    } catch (error) {
      console.error('خطأ في تصدير PDF:', error);
      throw new Error('فشل في تصدير PDF: ' + error);
    }
  }

  /**
   * تصدير عنصر HTML إلى PDF - محسن
   */
  async exportHtmlElementToPDF(
    elementId: string, 
    filename: string = 'document.pdf'
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`العنصر ${elementId} غير موجود`);
      }

      await this.convertElementToPDF(element, filename);

    } catch (error) {
      console.error('خطأ في تصدير HTML:', error);
      throw error;
    }
  }

  /**
   * تصدير تقرير مفصل للمهام
   */
  async exportDetailedReport(
    tasks: Task[], 
    stats: TaskStats,
    filters?: any
  ): Promise<void> {
    try {
      // إنشاء HTML مفصل
      const htmlContent = this.generateDetailedReportHTML(tasks, stats, filters);
      
      // تصدير HTML كـ PDF
      await this.exportHTMLContentToPDF(htmlContent, `تقرير_مفصل_${new Date().toISOString().split('T')[0]}.pdf`);

      console.log('تم إنشاء التقرير المفصل بنجاح');

    } catch (error) {
      console.error('خطأ في إنشاء التقرير المفصل:', error);
      throw error;
    }
  }

  // ================================
  // الحلول البديلة الجديدة
  // ================================

  /**
   * طباعة مباشرة من المتصفح - أفضل دعم للعربية
   */
  printTasksReport(tasks: Task[], stats: TaskStats): void {
    const printContent = this.generatePrintableHTML(tasks, stats);
    
    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('يرجى السماح للنوافذ المنبثقة لتتمكن من الطباعة');
      return;
    }
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // انتظار تحميل المحتوى ثم الطباعة
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // لا نغلق النافذة تلقائياً، ندع المستخدم يتحكم
      }, 500);
    };
  }

  /**
   * تصدير كملف HTML يمكن طباعته أو تحويله لاحقاً
   */
  exportAsHTML(tasks: Task[], stats: TaskStats): void {
    const htmlContent = this.generateStandaloneHTML(tasks, stats);
    
    // إنشاء ملف HTML للتحميل
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_المهام_${new Date().toISOString().split('T')[0]}.html`;
    
    // تحميل الملف
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // تنظيف الذاكرة
    window.URL.revokeObjectURL(url);
  }

  /**
   * تصدير البيانات كملف CSV
   */
  exportAsCSV(tasks: Task[]): void {
    const headers = ['الرقم', 'عنوان المهمة', 'الوصف', 'الأولوية', 'الحالة', 'تاريخ الاستحقاق', 'تاريخ الإنشاء'];
    
    const csvData = tasks.map((task, index) => [
      index + 1,
      `"${task.title}"`,
      `"${task.description || 'لا يوجد'}"`,
      this.getPriorityLabel(task.priority),
      this.getStatusLabel(task),
      task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA') : 'غير محدد',
      new Date(task.createdAt).toLocaleDateString('ar-SA')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // إضافة BOM للدعم العربي في Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `بيانات_المهام_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }

  /**
   * نسخ تقرير نصي للحافظة
   */
  async copyReportToClipboard(tasks: Task[], stats: TaskStats): Promise<void> {
    const textReport = this.generateTextReport(tasks, stats);
    
    try {
      await navigator.clipboard.writeText(textReport);
      alert('تم نسخ التقرير إلى الحافظة! يمكنك لصقه في أي برنامج نصوص وطباعته.');
    } catch (error) {
      // fallback للمتصفحات القديمة
      const textArea = document.createElement('textarea');
      textArea.value = textReport;
      textArea.style.cssText = 'position: fixed; left: -9999px;';
      
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        alert('تم نسخ التقرير إلى الحافظة!');
      } catch (err) {
        alert('لم يتمكن من نسخ التقرير. جرب طريقة أخرى.');
      }
      
      document.body.removeChild(textArea);
    }
  }

  // ================================
  // دوال توليد المحتوى الأصلية
  // ================================

  /**
   * تحويل عنصر HTML إلى PDF
   */
  private async convertElementToPDF(element: HTMLElement, filename: string): Promise<void> {
    // إعدادات html2canvas محسنة للعربية
    const canvas = await html2canvas(element, {
      scale: 2, // جودة عالية
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      allowTaint: true,
      foreignObjectRendering: true // مهم للنصوص العربية
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // إنشاء PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // عرض A4
    const pageHeight = 295; // ارتفاع A4
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // إضافة الصفحة الأولى
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // إضافة صفحات إضافية إذا لزم الأمر
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  }

  /**
   * تصدير محتوى HTML كـ PDF
   */
  private async exportHTMLContentToPDF(htmlContent: string, filename: string): Promise<void> {
    // إنشاء عنصر مؤقت
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 800px;
      background: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      direction: rtl;
    `;
    
    document.body.appendChild(tempDiv);

    try {
      await this.convertElementToPDF(tempDiv, filename);
    } finally {
      // تنظيف العنصر المؤقت
      document.body.removeChild(tempDiv);
    }
  }

  // ================================
  // دوال توليد المحتوى للطرق البديلة
  // ================================

  private generatePrintableHTML(tasks: Task[], stats: TaskStats): string {
    const today = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير المهام - ذكرني</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Cairo', 'Segoe UI', sans-serif;
            line-height: 1.8;
            color: #2d3748;
            background: white;
            padding: 20px;
          }
          
          .container { max-width: 800px; margin: 0 auto; }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            border-bottom: 3px solid #3182ce;
          }
          
          .header h1 {
            font-size: 28px;
            color: #2d3748;
            margin-bottom: 10px;
            font-weight: 700;
          }
          
          .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f7fafc;
            border-radius: 8px;
          }
          
          .stat-item {
            text-align: center;
            padding: 15px;
            border-radius: 6px;
            background: white;
            border: 2px solid #e2e8f0;
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .stat-label { font-size: 12px; color: #718096; }
          
          .tasks-section h2 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #2d3748;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
          }
          
          .task-item {
            padding: 15px;
            margin-bottom: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            border-right: 4px solid var(--task-color);
          }
          
          .task-item.completed { --task-color: #48bb78; }
          .task-item.pending { --task-color: #ed8936; }
          .task-item.overdue { --task-color: #f56565; }
          
          .task-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
          }
          
          .task-title.completed { 
            text-decoration: line-through; 
            opacity: 0.7; 
          }
          
          .task-details {
            font-size: 13px;
            color: #718096;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            padding: 15px;
            background: #f7fafc;
            border-radius: 6px;
            font-size: 12px;
            color: #718096;
          }
          
          @media print {
            body { 
              padding: 0; 
              font-size: 12px;
            }
            
            .container { 
              max-width: none; 
              margin: 0;
            }
            
            .stats { 
              display: block; 
            }
            
            .stat-item { 
              display: inline-block; 
              width: 23%; 
              margin: 1%;
            }
            
            .task-item { 
              page-break-inside: avoid; 
              margin-bottom: 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 تقرير المهام - ذكرني</h1>
            <p style="color: #718096; margin-top: 10px;">${today}</p>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <div class="stat-number" style="color: #3182ce;">${stats.total}</div>
              <div class="stat-label">إجمالي المهام</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" style="color: #48bb78;">${stats.completed}</div>
              <div class="stat-label">مهام مكتملة</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" style="color: #ed8936;">${stats.pending}</div>
              <div class="stat-label">قيد التنفيذ</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" style="color: #f56565;">${stats.overdue}</div>
              <div class="stat-label">متأخرة</div>
            </div>
          </div>
          
          <div class="tasks-section">
            <h2>📝 قائمة المهام (${tasks.length} مهمة)</h2>
            
            ${tasks.map((task, index) => `
              <div class="task-item ${this.getTaskClass(task)}">
                <div class="task-title ${task.completed ? 'completed' : ''}">${index + 1}. ${task.title}</div>
                ${task.description ? `<p style="margin: 8px 0; color: #4a5568; font-size: 14px;">${task.description}</p>` : ''}
                <div class="task-details">
                  <span>🔥 ${this.getPriorityLabel(task.priority)}</span>
                  <span>📅 ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA') : 'بدون تاريخ'}</span>
                  <span>🕒 ${new Date(task.createdAt).toLocaleDateString('ar-SA')}</span>
                  <span>📊 ${this.getStatusLabel(task)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p><strong>تم إنشاء هذا التقرير بواسطة تطبيق ذكرني ✨</strong></p>
            <p>منظم مهامك الذكي • ${tasks.length} مهمة • ${new Date().toLocaleString('ar-SA')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateStandaloneHTML(tasks: Task[], stats: TaskStats): string {
    // نفس المحتوى لكن مع CSS مضمن بالكامل لضمان العمل في أي مكان
    return this.generatePrintableHTML(tasks, stats);
  }

  private generateTextReport(tasks: Task[], stats: TaskStats): string {
    const today = new Date().toLocaleDateString('ar-SA');
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    
    let report = `
📋 تقرير المهام - تطبيق ذكرني
═══════════════════════════════════════

📅 تاريخ التقرير: ${today}

📊 الإحصائيات السريعة:
──────────────────────
• إجمالي المهام: ${stats.total}
• المهام المكتملة: ${stats.completed}
• المهام قيد التنفيذ: ${stats.pending}  
• المهام المتأخرة: ${stats.overdue}
• معدل الإنجاز: ${completionRate}%

📝 قائمة المهام (${tasks.length} مهمة):
═══════════════════════════════════════

`;

    tasks.forEach((task, index) => {
      const status = this.getStatusLabel(task);
      const priority = this.getPriorityLabel(task.priority);
      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA') : 'غير محدد';
      
      report += `${index + 1}. ${task.title}\n`;
      if (task.description) {
        report += `   الوصف: ${task.description}\n`;
      }
      report += `   الحالة: ${status} | الأولوية: ${priority} | الاستحقاق: ${dueDate}\n`;
      report += `   ─────────────────────────────────────\n\n`;
    });

    report += `
✨ تم إنشاء هذا التقرير بواسطة تطبيق ذكرني
🕒 وقت الإنشاء: ${new Date().toLocaleString('ar-SA')}
`;

    return report;
  }

  // ================================
  // دوال HTML الأصلية (محتفظ بها)
  // ================================

  private generateArabicPdfHTML(tasks: Task[], stats: TaskStats, title: string, includeStats: boolean): string {
    // نفس الكود الأصلي موجود هنا...
    // (تم الاحتفاظ بالكود الأصلي كما هو)
    const today = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return `
      <div style="padding: 40px; background: white; font-family: 'Segoe UI', 'Cairo', 'Amiri', sans-serif; direction: rtl; color: #333; line-height: 1.6;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
          <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
          <h1 style="font-size: 32px; margin: 0; font-weight: 700;">${title}</h1>
          <p style="margin: 10px 0; font-size: 16px; opacity: 0.9;">${today}</p>
        </div>

        ${includeStats ? `
        <!-- Stats Section -->
        <div style="margin-bottom: 40px;">
          <h2 style="color: #4a5568; margin-bottom: 20px; text-align: center; font-size: 24px;">📊 الإحصائيات السريعة</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #4299e1, #3182ce); color: white; padding: 20px; border-radius: 12px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; margin-bottom: 5px;">${stats.total}</div>
              <div style="font-size: 14px; opacity: 0.9;">إجمالي المهام</div>
            </div>
            <div style="background: linear-gradient(135deg, #48bb78, #38a169); color: white; padding: 20px; border-radius: 12px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; margin-bottom: 5px;">${stats.completed}</div>
              <div style="font-size: 14px; opacity: 0.9;">مهام مكتملة</div>
            </div>
            <div style="background: linear-gradient(135deg, #ed8936, #dd6b20); color: white; padding: 20px; border-radius: 12px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; margin-bottom: 5px;">${stats.pending}</div>
              <div style="font-size: 14px; opacity: 0.9;">قيد التنفيذ</div>
            </div>
            <div style="background: linear-gradient(135deg, #f56565, #e53e3e); color: white; padding: 20px; border-radius: 12px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; margin-bottom: 5px;">${stats.overdue}</div>
              <div style="font-size: 14px; opacity: 0.9;">متأخرة</div>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center;">
            <h3 style="color: #4a5568; margin-bottom: 15px; font-size: 18px;">📈 معدل الإنجاز</h3>
            <div style="background: #e2e8f0; height: 12px; border-radius: 25px; overflow: hidden; margin-bottom: 10px;">
              <div style="height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 25px; width: ${completionPercentage}%;"></div>
            </div>
            <div style="font-weight: 600; color: #667eea; font-size: 18px;">${completionPercentage}%</div>
          </div>
        </div>
        ` : ''}

        <!-- Tasks Section -->
        <div>
          <h2 style="color: #2d3748; margin-bottom: 25px; text-align: center; font-size: 24px;">📝 قائمة المهام (${tasks.length} مهمة)</h2>
          
          ${tasks.map((task: Task, index: number) => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 15px; border-right: 5px solid ${this.getTaskBorderColor(task)};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; flex: 1;">
                  <div style="background: ${this.getTaskBorderColor(task)}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-left: 15px;">
                    ${index + 1}
                  </div>
                  <div style="flex: 1;">
                    <h3 style="margin: 0; font-size: 18px; color: #2d3748; ${task.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${task.title}</h3>
                    ${task.description ? `<p style="margin: 8px 0; color: #718096; font-size: 14px; line-height: 1.5;">${task.description}</p>` : ''}
                  </div>
                </div>
                <div style="text-align: center; min-width: 100px;">
                  <span style="background: ${this.getTaskBorderColor(task)}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ${this.getStatusLabel(task)}
                  </span>
                </div>
              </div>
              
              <div style="display: flex; gap: 20px; font-size: 13px; color: #a0aec0; margin-right: 45px;">
                <span style="display: flex; align-items: center; gap: 5px;">
                  ${this.getPriorityIcon(task.priority)} 
                  <span style="color: ${this.getPriorityColor(task.priority)}; font-weight: 600;">${this.getPriorityLabel(task.priority)}</span>
                </span>
                <span style="display: flex; align-items: center; gap: 5px;">
                  📅 ${task.dueDate ? this.formatDate(task.dueDate) : 'بدون تاريخ'}
                </span>
                <span style="display: flex; align-items: center; gap: 5px;">
                  🕒 ${this.formatDate(task.createdAt)}
                </span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding: 30px; background: #f1f5f9; border-radius: 12px; color: #64748b;">
          <p style="margin: 0; color: #667eea; font-weight: 600; font-size: 18px;">تم إنشاء هذا التقرير بواسطة تطبيق ذكرني ✨</p>
          <p style="margin: 10px 0;">منظم مهامك الذكي • عدد المهام: ${tasks.length}</p>
          <p style="font-size: 12px; margin-top: 15px;">
            تم الإنشاء في: ${new Date().toLocaleString('ar-SA')}
          </p>
        </div>
      </div>
    `;
  }

  private generateDetailedReportHTML(tasks: Task[], stats: TaskStats, filters?: any): string {
    // نفس الكود الأصلي للتقرير المفصل...
    const today = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    // تحليل الأولوية
    const priorityCounts = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    // تحليل المهام المتأخرة
    const overdueTasks = tasks.filter(t => !t.completed && this.isTaskOverdue(t));

    return `
      <div style="padding: 40px; background: white; font-family: 'Segoe UI', 'Cairo', 'Amiri', sans-serif; direction: rtl; color: #333; line-height: 1.6;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border-radius: 15px;">
          <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
          <h1 style="font-size: 32px; margin: 0; font-weight: 700;">التقرير المفصل - إدارة المهام</h1>
          <p style="margin: 10px 0; font-size: 16px; opacity: 0.9;">${today}</p>
        </div>

        <!-- معلومات عامة -->
        <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
          <h2 style="color: #374151; margin-bottom: 15px; font-size: 20px;">📋 معلومات عامة</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <strong>إجمالي المهام:</strong> ${stats.total}
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <strong>معدل الإنجاز:</strong> ${completionPercentage}%
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <strong>المهام المتأخرة:</strong> ${overdueTasks.length}
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <strong>تاريخ التقرير:</strong> ${today}
            </div>
          </div>
        </div>

        <!-- تحليل الأولوية -->
        <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
          <h2 style="color: #374151; margin-bottom: 15px; font-size: 20px;">🔥 توزيع المهام حسب الأولوية</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px; border-radius: 10px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">${priorityCounts.high}</div>
              <div>أولوية عالية</div>
            </div>
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; border-radius: 10px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">${priorityCounts.medium}</div>
              <div>أولوية متوسطة</div>
            </div>
            <div style="background: linear-gradient(135deg, #10b981, #047857); color: white; padding: 20px; border-radius: 10px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">${priorityCounts.low}</div>
              <div>أولوية منخفضة</div>
            </div>
          </div>
        </div>

        <!-- قائمة المهام المفصلة -->
        <div>
          <h2 style="color: #2d3748; margin-bottom: 25px; text-align: center; font-size: 24px;">📝 تفاصيل المهام الكاملة</h2>
          
          ${tasks.map((task: Task, index: number) => `
            <div style="background: white; border: 2px solid ${this.getTaskBorderColor(task)}; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div style="display: flex; align-items: center;">
                  <div style="background: ${this.getTaskBorderColor(task)}; color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; margin-left: 15px;">
                    ${index + 1}
                  </div>
                  <h3 style="margin: 0; font-size: 20px; color: #1f2937; ${task.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${task.title}</h3>
                </div>
                <span style="background: ${this.getTaskBorderColor(task)}; color: white; padding: 8px 16px; border-radius: 25px; font-size: 14px; font-weight: 600;">
                  ${this.getStatusLabel(task)}
                </span>
              </div>
              
              ${task.description ? `
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <strong style="color: #374151;">الوصف:</strong>
                  <p style="margin: 5px 0 0 0; color: #6b7280; line-height: 1.6;">${task.description}</p>
                </div>
              ` : ''}
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                <div style="background: #f3f4f6; padding: 12px; border-radius: 8px;">
                  <strong style="color: #374151;">الأولوية:</strong>
                  <div style="color: ${this.getPriorityColor(task.priority)}; font-weight: 600; margin-top: 5px;">
                    ${this.getPriorityIcon(task.priority)} ${this.getPriorityLabel(task.priority)}
                  </div>
                </div>
                
                <div style="background: #f3f4f6; padding: 12px; border-radius: 8px;">
                  <strong style="color: #374151;">تاريخ الاستحقاق:</strong>
                  <div style="color: #6b7280; margin-top: 5px;">
                    📅 ${task.dueDate ? this.formatDate(task.dueDate) : 'غير محدد'}
                  </div>
                </div>
                
                <div style="background: #f3f4f6; padding: 12px; border-radius: 8px;">
                  <strong style="color: #374151;">تاريخ الإنشاء:</strong>
                  <div style="color: #6b7280; margin-top: 5px;">
                    🕒 ${this.formatDate(task.createdAt)}
                  </div>
                </div>
                
                <div style="background: #f3f4f6; padding: 12px; border-radius: 8px;">
                  <strong style="color: #374151;">الحالة:</strong>
                  <div style="color: ${this.getTaskBorderColor(task)}; font-weight: 600; margin-top: 5px;">
                    ${this.getDetailedStatusLabel(task)}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border-radius: 15px; color: #64748b;">
          <p style="margin: 0; color: #6366f1; font-weight: 700; font-size: 20px;">✨ تطبيق ذكرني - منظم مهامك الذكي ✨</p>
          <p style="margin: 15px 0; font-size: 16px;">تقرير شامل ومفصل • ${tasks.length} مهمة • معدل إنجاز ${completionPercentage}%</p>
        </div>
      </div>
    `;
  }

  // ================================
  // دوال مساعدة
  // ================================

  private getTaskClass(task: Task): string {
    if (task.completed) return 'completed';
    if (this.isTaskOverdue(task)) return 'overdue';
    return 'pending';
  }

  private getTaskBorderColor(task: Task): string {
    if (task.completed) return '#10b981';
    if (this.isTaskOverdue(task)) return '#ef4444';
    return '#f59e0b';
  }

  private getStatusLabel(task: Task): string {
    if (task.completed) return 'مكتملة ✓';
    if (this.isTaskOverdue(task)) return 'متأخرة ⚠';
    return 'قيد التنفيذ ○';
  }

  private getDetailedStatusLabel(task: Task): string {
    if (task.completed) return '✅ مهمة مكتملة بنجاح';
    if (this.isTaskOverdue(task)) return '🚨 مهمة متأخرة - تتطلب اهتماماً عاجلاً';
    return '⏳ مهمة قيد التنفيذ';
  }

  private getPriorityIcon(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  private getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  }

  private getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }

  private isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = task.dueDate instanceof Date ? 
      new Date(task.dueDate) : 
      new Date(task.dueDate);
    
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  private formatDate(date: Date | string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}