// src/app/services/export-helper.service.ts
import { Injectable } from '@angular/core';
import { Task } from '../models/task';
import { TaskStats } from '../interfaces/pdf-export.interface';

@Injectable({
  providedIn: 'root'
})
export class ExportHelperService {

  /**
   * إنشاء HTML للطباعة بالعربية
   */
  generateArabicPrintHTML(tasks: Task[], stats: TaskStats, completionPercentage: number): string {
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
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Noto Sans Arabic', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #2d3748;
            line-height: 1.6;
            padding: 20px;
            min-height: 100vh;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .header .emoji {
            font-size: 3rem;
            margin-bottom: 15px;
            display: block;
          }
          
          .content { padding: 40px 30px; }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background: linear-gradient(135deg, var(--bg-color), var(--bg-color-dark));
            color: white;
            padding: 25px 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }
          
          .stat-card.total { --bg-color: #4299e1; --bg-color-dark: #3182ce; }
          .stat-card.completed { --bg-color: #48bb78; --bg-color-dark: #38a169; }
          .stat-card.pending { --bg-color: #ed8936; --bg-color-dark: #dd6b20; }
          .stat-card.overdue { --bg-color: #f56565; --bg-color-dark: #e53e3e; }
          
          .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
            font-weight: 500;
          }
          
          .completion-rate {
            background: #f7fafc;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            margin-top: 20px;
          }
          
          .progress-bar {
            background: #e2e8f0;
            height: 12px;
            border-radius: 25px;
            overflow: hidden;
            margin-bottom: 10px;
          }
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 25px;
            width: ${completionPercentage}%;
          }
          
          .task-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border-right: 5px solid var(--border-color);
          }
          
          .task-item.completed { --border-color: #48bb78; }
          .task-item.pending { --border-color: #ed8936; }
          .task-item.overdue { --border-color: #f56565; }
          
          .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }
          
          .task-number {
            background: var(--border-color);
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.9rem;
            margin-left: 15px;
          }
          
          .task-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d3748;
            flex: 1;
          }
          
          .task-title.completed {
            text-decoration: line-through;
            opacity: 0.7;
          }
          
          .task-status {
            background: var(--border-color);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
          }
          
          .task-description {
            color: #718096;
            font-size: 0.95rem;
            margin-bottom: 12px;
            line-height: 1.5;
          }
          
          .task-meta {
            display: flex;
            gap: 20px;
            font-size: 0.85rem;
            color: #a0aec0;
          }
          
          .task-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .priority-high { color: #f56565; font-weight: 600; }
          .priority-medium { color: #ed8936; font-weight: 600; }
          .priority-low { color: #48bb78; font-weight: 600; }
          
          .footer {
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            color: #718096;
            border-top: 1px solid #e2e8f0;
          }
          
          @media print {
            body { background: white !important; padding: 0 !important; }
            .container { box-shadow: none !important; border-radius: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <span class="emoji">📋</span>
            <h1>تقرير المهام</h1>
            <p>${today}</p>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Stats Section -->
            <div class="stats-section">
              <h2 style="font-size: 1.5rem; font-weight: 600; color: #4a5568; margin-bottom: 20px; text-align: center;">📊 الإحصائيات السريعة</h2>
              <div class="stats-grid">
                <div class="stat-card total">
                  <div class="stat-number">${stats.total}</div>
                  <div class="stat-label">إجمالي المهام</div>
                </div>
                <div class="stat-card completed">
                  <div class="stat-number">${stats.completed}</div>
                  <div class="stat-label">مهام مكتملة</div>
                </div>
                <div class="stat-card pending">
                  <div class="stat-number">${stats.pending}</div>
                  <div class="stat-label">قيد التنفيذ</div>
                </div>
                <div class="stat-card overdue">
                  <div class="stat-number">${stats.overdue}</div>
                  <div class="stat-label">متأخرة</div>
                </div>
              </div>
              
              <div class="completion-rate">
                <h3 style="color: #4a5568; margin-bottom: 15px; font-size: 1.2rem;">📈 معدل الإنجاز</h3>
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <div style="font-weight: 600; color: #667eea; font-size: 1.1rem;">${completionPercentage}%</div>
              </div>
            </div>
            
            <!-- Tasks Section -->
            <div class="tasks-section">
              <h2 style="font-size: 1.8rem; font-weight: 600; color: #2d3748; margin-bottom: 25px; text-align: center;">📝 قائمة المهام (${tasks.length} مهمة)</h2>
              
              ${tasks.map((task: Task, index: number) => `
                <div class="task-item ${this.getTaskStatusClass(task)}">
                  <div class="task-header">
                    <div style="display: flex; align-items: center; flex: 1;">
                      <div class="task-number">${index + 1}</div>
                      <div class="task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
                    </div>
                    <div class="task-status">
                      ${this.getStatusLabel(task)}
                    </div>
                  </div>
                  
                  ${task.description ? `
                    <div class="task-description">${task.description}</div>
                  ` : ''}
                  
                  <div class="task-meta">
                    <span class="priority-${task.priority}">
                      ${this.getPriorityIcon(task.priority)} ${this.getPriorityLabel(task.priority)}
                    </span>
                    <span>
                      📅 ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA') : 'بدون تاريخ'}
                    </span>
                    <span>
                      🕒 ${new Date(task.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p style="color: #667eea; font-weight: 600; font-size: 1.1rem;">تم إنشاء هذا التقرير بواسطة تطبيق ذكرني ✨</p>
            <p>منظم مهامك الذكي • عدد المهام: ${tasks.length}</p>
            <p style="font-size: 0.8rem; margin-top: 15px;">
              تم الإنشاء في: ${new Date().toLocaleString('ar-SA')}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ================================
  // دوال مساعدة
  // ================================

  getTaskStatusClass(task: Task): string {
    if (task.completed) return 'completed';
    if (this.isTaskOverdue(task)) return 'overdue';
    return 'pending';
  }

  getStatusLabel(task: Task): string {
    if (task.completed) return 'مكتملة';
    if (this.isTaskOverdue(task)) return 'متأخرة';
    return 'قيد التنفيذ';
  }

  getPriorityIcon(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  }

  private isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }
}