// ملف واجهات تصدير PDF - src/app/interfaces/pdf-export.interface.ts

/**
 * خيارات تصدير PDF الأساسية
 */
export interface PdfExportOptions {
  title?: string;
  includeStats?: boolean;
  includeCompletedTasks?: boolean;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  language?: 'ar' | 'en';
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
}

/**
 * خيارات تصدير PDF المتقدمة
 */
export interface AdvancedPdfExportOptions extends PdfExportOptions {
  // إعدادات الجودة
  imageScale?: number;
  compressionLevel?: number;
  
  // إعدادات المحتوى
  maxTasksPerPage?: number;
  maxDescriptionLength?: number;
  includePriorityAnalysis?: boolean;
  includeStatusAnalysis?: boolean;
  includeTimeAnalysis?: boolean;
  
  // إعدادات المظهر
  colorScheme?: 'default' | 'dark' | 'light' | 'custom';
  customColors?: CustomColorScheme;
  enablePageNumbers?: boolean;
  enableFooter?: boolean;
  enableHeader?: boolean;
  
  // إعدادات الفلترة
  filterByPriority?: ('high' | 'medium' | 'low')[];
  filterByStatus?: ('completed' | 'pending' | 'overdue')[];
  filterByDateRange?: DateRange;
  
  // إعدادات التخطيط
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  lineSpacing?: number;
  sectionSpacing?: number;
}

/**
 * نطاق تاريخي للفلترة
 */
export interface DateRange {
  startDate?: Date | string;
  endDate?: Date | string;
}

/**
 * مخطط ألوان مخصص
 */
export interface CustomColorScheme {
  primary?: [number, number, number];
  secondary?: [number, number, number];
  success?: [number, number, number];
  warning?: [number, number, number];
  danger?: [number, number, number];
  background?: [number, number, number];
  text?: [number, number, number];
  border?: [number, number, number];
}

/**
 * إحصائيات المهام
 */
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate?: number;
  averageCompletionTime?: number;
  totalWorkingDays?: number;
}

/**
 * إحصائيات مفصلة للمهام
 */
export interface DetailedTaskStats extends TaskStats {
  // توزيع حسب الأولوية
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  
  // توزيع حسب الفترة الزمنية
  timeDistribution: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    older: number;
  };
  
  // إحصائيات الإنتاجية
  productivity: {
    tasksCompletedToday: number;
    tasksCompletedThisWeek: number;
    tasksCompletedThisMonth: number;
    averageTasksPerDay: number;
  };
  
  // أطول المهام
  longestTasks: TaskSummary[];
  
  // أكثر المهام تأخيراً
  mostOverdueTasks: TaskSummary[];
}

/**
 * ملخص المهمة للإحصائيات
 */
export interface TaskSummary {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  daysOverdue?: number;
  estimatedDuration?: number;
  actualDuration?: number;
}

/**
 * تقدم عملية التصدير
 */
export interface ExportProgress {
  current: number;
  total: number;
  percentage: number;
  message: string;
  stage: ExportStage;
  estimatedTimeRemaining?: number;
}

/**
 * مراحل عملية التصدير
 */
export type ExportStage = 
  | 'initializing'
  | 'processing_tasks'
  | 'generating_stats'
  | 'creating_pdf'
  | 'adding_content'
  | 'finalizing'
  | 'completed'
  | 'error';

/**
 * نتيجة عملية التصدير
 */
export interface ExportResult {
  success: boolean;
  filename?: string;
  fileSize?: number;
  taskCount: number;
  pageCount: number;
  exportTime: number;
  error?: string;
  warnings?: string[];
}

/**
 * إعدادات تصدير HTML
 */
export interface HtmlExportOptions {
  elementId: string;
  filename?: string;
  width?: number;
  height?: number;
  scale?: number;
  useCORS?: boolean;
  backgroundColor?: string;
  removeElements?: string[];
  addWatermark?: boolean;
  watermarkText?: string;
}

/**
 * خيارات الطباعة
 */
export interface PrintOptions {
  title?: string;
  showPrintDialog?: boolean;
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  pageSize?: 'A4' | 'Letter' | 'A3' | 'A5';
  orientation?: 'portrait' | 'landscape';
  scale?: number;
}

/**
 * معلومات الصفحة
 */
export interface PageInfo {
  pageNumber: number;
  totalPages: number;
  contentHeight: number;
  remainingHeight: number;
  isLastPage: boolean;
}

/**
 * إعدادات الخط
 */
export interface FontSettings {
  family: string;
  size: number;
  style?: 'normal' | 'bold' | 'italic';
  color?: [number, number, number];
  align?: 'left' | 'center' | 'right';
}

/**
 * عنصر محتوى PDF
 */
export interface PdfContent {
  type: 'text' | 'image' | 'table' | 'chart' | 'divider';
  data: any;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  style?: {
    font?: FontSettings;
    background?: [number, number, number];
    border?: {
      width: number;
      color: [number, number, number];
      style?: 'solid' | 'dashed' | 'dotted';
    };
    padding?: number;
    margin?: number;
  };
}

/**
 * قالب PDF
 */
export interface PdfTemplate {
  name: string;
  description: string;
  orientation: 'portrait' | 'landscape';
  format: 'a4' | 'letter';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  header?: PdfContent[];
  footer?: PdfContent[];
  sections: PdfSection[];
  styles: {
    [key: string]: any;
  };
}

/**
 * قسم في PDF
 */
export interface PdfSection {
  name: string;
  title?: string;
  content: PdfContent[];
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
  visible?: boolean;
  condition?: (data: any) => boolean;
}

/**
 * بيانات التصدير
 */
export interface ExportData {
  tasks: any[];
  stats: TaskStats | DetailedTaskStats;
  filters?: any;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
  organization?: {
    name?: string;
    logo?: string;
    address?: string;
  };
  generatedAt: Date;
  generatedBy: string;
}

/**
 * خيارات المعاينة
 */
export interface PreviewOptions {
  width?: number;
  height?: number;
  zoom?: number;
  showControls?: boolean;
  allowDownload?: boolean;
  allowPrint?: boolean;
}

/**
 * حدث تصدير
 */
export interface ExportEvent {
  type: 'start' | 'progress' | 'complete' | 'error' | 'cancel';
  data?: any;
  timestamp: Date;
}

/**
 * مستمع أحداث التصدير
 */
export interface ExportEventListener {
  onStart?: (event: ExportEvent) => void;
  onProgress?: (progress: ExportProgress) => void;
  onComplete?: (result: ExportResult) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

/**
 * خيارات التخزين المؤقت
 */
export interface CacheOptions {
  enabled: boolean;
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in MB
  key?: string;
}

/**
 * إعدادات الأمان
 */
export interface SecuritySettings {
  password?: string;
  permissions?: {
    print?: boolean;
    copy?: boolean;
    modify?: boolean;
    annotate?: boolean;
  };
  watermark?: {
    text: string;
    opacity: number;
    rotation: number;
    fontSize: number;
    color: [number, number, number];
  };
}

/**
 * معلومات ملف PDF
 */
export interface PdfFileInfo {
  name: string;
  size: number;
  pages: number;
  createdAt: Date;
  modifiedAt: Date;
  author?: string;
  title?: string;
  subject?: string;
  keywords?: string[];
  version: string;
}

/**
 * خيارات التحسين
 */
export interface OptimizationOptions {
  compressImages?: boolean;
  optimizeFonts?: boolean;
  removeUnusedObjects?: boolean;
  linearize?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'maximum';
}

/**
 * إعدادات التصدير المجمعة
 */
export interface BatchExportOptions {
  tasks: any[][];
  options: PdfExportOptions[];
  outputFormat: 'separate' | 'combined';
  naming: {
    prefix?: string;
    suffix?: string;
    includeDate?: boolean;
    includeIndex?: boolean;
  };
  compression?: boolean;
  maxFileSize?: number; // في MB
}

/**
 * نتيجة التصدير المجمع
 */
export interface BatchExportResult {
  success: boolean;
  files: ExportResult[];
  totalTime: number;
  totalSize: number;
  errors: string[];
  warnings: string[];
}

// ===============================
// Types & Enums
// ===============================

/**
 * أنواع التقارير المتاحة
 */
export type ReportType = 
  | 'simple'
  | 'detailed'
  | 'summary'
  | 'analytics'
  | 'custom';

/**
 * تنسيقات التصدير المدعومة
 */
export type ExportFormat = 'pdf' | 'html' | 'image' | 'json';

/**
 * أحجام الصفحات المدعومة
 */
export type PageSize = 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'tabloid';

/**
 * اتجاهات الصفحة
 */
export type PageOrientation = 'portrait' | 'landscape';

/**
 * لغات الواجهة المدعومة
 */
export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'es';

/**
 * مستويات الجودة
 */
export type QualityLevel = 'draft' | 'normal' | 'high' | 'print';

/**
 * أنماط الخطوط
 */
export type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';

/**
 * محاذاة النص
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * أنواع المحتوى
 */
export type ContentType = 'text' | 'image' | 'table' | 'chart' | 'qrcode' | 'barcode';

// ===============================
// Utility Types
// ===============================

/**
 * جعل كل خصائص Interface اختيارية
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * جعل خصائص محددة مطلوبة
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * استخلاص نوع القيم من Interface
 */
export type ValueOf<T> = T[keyof T];

// ===============================
// Constants
// ===============================

/**
 * ثوابت PDF
 */
export const PDF_CONSTANTS = {
  MAX_FILE_SIZE: 50, // MB
  MAX_PAGES: 100,
  MAX_TASKS_PER_EXPORT: 1000,
  DEFAULT_TIMEOUT: 30000, // ms
  CACHE_DURATION: 3600000, // 1 hour in ms
  
  SUPPORTED_FORMATS: ['a4', 'letter', 'a3', 'a5'] as const,
  SUPPORTED_ORIENTATIONS: ['portrait', 'landscape'] as const,
  SUPPORTED_LANGUAGES: ['ar', 'en'] as const,
  
  MIN_MARGIN: 10,
  MAX_MARGIN: 50,
  DEFAULT_MARGIN: 20,
  
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 72,
  DEFAULT_FONT_SIZE: 12
} as const;