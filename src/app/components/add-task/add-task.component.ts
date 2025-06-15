import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AddTaskComponent {
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private taskService: TaskService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['medium'],
      dueDate: [null]
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      // إضافة المهمة
      this.taskService.addTask({
        ...this.taskForm.value,
        completed: false
      });
      
      // إعادة تعيين النموذج
      this.resetForm();
      
      // يمكنك إضافة إشعار نجاح هنا
      this.showSuccessMessage();
      
    } else {
      // تحديد جميع الحقول كقد تم اللمس لإظهار رسائل التحقق
      this.markAllFieldsAsTouched();
    }
  }

  resetForm() {
    this.taskForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: null
    });
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccessMessage() {
    // يمكنك استخدام مكتبة إشعارات مثل ngx-toastr
    // أو إنشاء إشعار مخصص
    console.log('تم إضافة المهمة بنجاح!');
  }

  // دوال مساعدة للتحقق من حالة الحقول
  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} مطلوب`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} يجب أن يكون ${field.errors['minlength'].requiredLength} أحرف على الأقل`;
      }
    }
    return '';
  }
}