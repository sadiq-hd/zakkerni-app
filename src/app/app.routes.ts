import { Routes } from '@angular/router';

// استيراد المكونات
import { HomeComponent } from './components/home/home.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { AddTaskComponent } from './components/add-task/add-task.component';
import { TaskCounterComponent } from './components/task-counter/task-counter.component';

export const routes: Routes = [
  // الصفحة الرئيسية - الافتراضية
  {
    path: '',
    component: HomeComponent,
    title: 'الصفحة الرئيسية - ذكرني'
  },
  
  // صفحة إدارة المهام الشاملة
  {
    path: 'tasks',
    component: TasksComponent,
    title: 'إدارة المهام - ذكرني'
  },
  
  // صفحة إضافة مهمة جديدة
  {
    path: 'add-task',
    component: AddTaskComponent,
    title: 'إضافة مهمة جديدة - ذكرني'
  },
  
  // صفحة الإحصائيات والتحليلات
  {
    path: 'statistics',
    component: TaskCounterComponent,
    title: 'الإحصائيات والتحليلات - ذكرني'
  },
  
  // إعادة توجيه الصفحات غير الموجودة للصفحة الرئيسية
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

// ملاحظات للتطوير:
/*
بنية التطبيق النهائية:

📁 الصفحات الرئيسية:
├── / (HomeComponent) - الصفحة الرئيسية مع نظرة عامة
├── /tasks (TasksComponent) - إدارة شاملة للمهام مع فلاتر متقدمة
├── /add-task (AddTaskComponent) - نموذج تفصيلي لإضافة المهام
├── /statistics (TaskCounterComponent) - إحصائيات وتحليلات مفصلة
└── /** - إعادة توجيه للصفحة الرئيسية

🧩 المكونات الفرعية (تُستخدم داخل الصفحات):
├── TaskListComponent - قائمة عرض المهام (داخل TasksComponent)
├── TaskItemComponent - عنصر مهمة واحدة
└── HeaderComponent - هيدر التطبيق مع التنقل

⚡ مميزات كل صفحة:
├── Home: نظرة سريعة + إحصائيات بسيطة + مهام اليوم
├── Tasks: فلاتر متقدمة + إدارة شاملة + pagination
├── Add-Task: نموذج مفصل بجميع الخيارات
└── Statistics: تحليلات عميقة + رسوم بيانية + تقارير
*/