// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  /**
   * عرض رسالة تحميل
   */
  showLoadingToast(message: string): HTMLElement {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite;"></div>
        <span>${message}</span>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(toast);
    
    // إظهار الرسالة
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    return toast;
  }

  /**
   * عرض رسالة نجاح
   */
  showSuccessToast(message: string): void {
    this.showToast(message, 'success');
  }

  /**
   * عرض رسالة خطأ
   */
  showErrorToast(message: string): void {
    this.showToast(message, 'error');
  }

  /**
   * عرض رسالة عامة
   */
  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // إظهار الرسالة
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // إخفاء الرسالة بعد 3 ثواني
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  /**
   * إخفاء رسالة محددة
   */
  hideToast(toast: HTMLElement): void {
    if (document.body.contains(toast)) {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }
  }

  /**
   * عرض تنبيه بسيط
   */
  showAlert(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    // يمكن استبدالها بمكون Alert مخصص لاحقاً
    alert(message);
  }

  /**
   * عرض نافذة خيارات التصدير
   */
  async showExportOptions(): Promise<string | null> {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    modal.innerHTML = `
      <div style="background: white; border-radius: 16px; padding: 30px; max-width: 500px; width: 90%; direction: rtl; font-family: Arial;">
        <h3 style="margin: 0 0 20px 0; color: #374151; text-align: center;">📄 خيارات التصدير</h3>
        
        <div style="display: grid; gap: 15px;">
          <button class="export-option" data-type="simple" style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 8px; background: #f9fafb; cursor: pointer; text-align: right;">
            <div style="font-weight: bold; color: #374151;">📋 تصدير بسيط</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">قائمة المهام مع الإحصائيات الأساسية</div>
          </button>
          
          <button class="export-option" data-type="detailed" style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 8px; background: #f9fafb; cursor: pointer; text-align: right;">
            <div style="font-weight: bold; color: #374151;">📊 تقرير مفصل</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">تحليل شامل مع الرسوم البيانية</div>
          </button>
          
          <button class="export-option" data-type="preview" style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 8px; background: #f9fafb; cursor: pointer; text-align: right;">
            <div style="font-weight: bold; color: #374151;">👁️ معاينة التقرير</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">عرض التقرير قبل التصدير</div>
          </button>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 25px; justify-content: center;">
          <button id="export-confirm" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">تصدير</button>
          <button id="export-cancel" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">إلغاء</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    let selectedType: string | null = null;
    
    // إضافة مستمعي الأحداث
    modal.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.export-option') as HTMLButtonElement;
      
      if (button) {
        // إزالة التحديد السابق
        modal.querySelectorAll('.export-option').forEach(btn => {
          (btn as HTMLElement).style.border = '2px solid #e5e7eb';
          (btn as HTMLElement).style.background = '#f9fafb';
        });
        
        // إضافة التحديد الجديد
        button.style.border = '2px solid #3b82f6';
        button.style.background = '#eff6ff';
        
        selectedType = button.getAttribute('data-type');
      }
    });
    
    return new Promise((resolve) => {
      const confirmBtn = modal.querySelector('#export-confirm') as HTMLElement;
      const cancelBtn = modal.querySelector('#export-cancel') as HTMLElement;
      
      confirmBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        if (selectedType) {
          resolve(selectedType);
        } else {
          this.showAlert('يرجى اختيار نوع التصدير', 'warning');
          resolve(null);
        }
      });
      
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(null);
      });
      
      // إغلاق عند النقر خارج النافذة
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve(null);
        }
      });
    });
  }
}