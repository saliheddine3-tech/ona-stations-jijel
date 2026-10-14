export type StationStatus = 'جاهزة' | 'صيانة' | 'متوقفة';

export interface Station {
  id: string;
  name: string;
  phone: string;
  status: StationStatus;
  latitude: number | null;
  longitude: number | null;
  capacity: number; // m3/h
  pumpsCount: number;
  workersCount: number;
  notes: string;
  commune: string;
  address?: string;
  assignedWorkerIds: string[];
}

export type WorkerRole = 'مشرف' | 'مدير_عام' | 'رئيس_مركز' | 'عون_صيانة' | 'مراقب' | 'عامل_مناوبة' | 'إداري';

export interface Administrator {
  id: string;
  fullName: string;
  phone: string;
  pin: string; // 4-digit PIN
  role: WorkerRole;
  title: string; // e.g. "المشرف (عون المكتب)", "رئيس مركز المحطات", "عون الصيانة الكهروميكانيكية", "مساعد إداري"
  badge: string; // e.g. "كامل الصلاحيات", "صلاحيات إشرافية", "مختص كهروميكانيك", "فريق الإدارة"
  badgeColor?: 'cyan' | 'blue' | 'amber' | 'emerald' | 'purple';
  residence: string;
  workplace: string;
  tasks: string[];
  isDefault?: boolean;
}

export interface Worker {
  id: string;
  fullName: string;
  phone: string;
  pin: string; // 4-digit PIN
  role: WorkerRole;
  residence: string; // مكان السكن (مثلاً: العوانة، بوالنار، جيجل وسط...)
  stationId: string; // مكان المحطة التي يزاول عمله بها
  cycleOffset: number; // 0, 1, 2, 3 for 4-day cycle rotation
  isActive: boolean;
  notes?: string;
  specialty?: string; // e.g. كهروميكانيك للمضخات والمولدات
}

export type ShiftType = 'نهارية' | 'ليلية' | 'راحة_1' | 'راحة_2';

export interface ShiftStatusInfo {
  type: ShiftType;
  label: string;
  hours: string;
  isWorking: boolean;
  canSubstituteNight: boolean;
  canSubstituteDay: boolean;
}

export type LeaveType = 'عطلة_سنوية' | 'عطلة_مرضية' | 'عطلة_طارئة';
export type LeaveStatus = 'جارية' | 'مجدولة' | 'منتهية' | 'ملغاة';

export interface LeaveRecord {
  id: string;
  workerId: string;
  workerName: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  substituteWorkerId?: string;
  substituteWorkerName?: string;
  status: LeaveStatus;
  createdAt: string;
  compensationNotes?: string;
}

export interface GeneratorReadingCells {
  // 8 horizontal cells for Generator parameters
  cell1: string; // ساعات تشغيل المولد
  cell2: string; // مستوى الوقود %
  cell3: string; // ضغط الزيت بار
  cell4: string; // حرارة المحرك م°
  cell5: string; // جهد البطارية فولت
  cell6: string; // التردد هرتز
  cell7: string; // الجهد الكهربائي فولت
  cell8: string; // التيار الكهربائي أمبير
}

export interface ElectricMeterDigits {
  // 8 horizontal digits for the Electric Meter (each 0-9 or 8-digit full string)
  d1: string;
  d2: string;
  d3: string;
  d4: string;
  d5: string;
  d6: string;
  d7: string;
  d8: string;
  fullNumber: string; // 8-digit electric reading
}

export interface MonthlyCounterRecord {
  id: string;
  stationId: string;
  month: string; // e.g. '2026-10'
  date: string;
  recorderName: string;
  recorderPhone: string;
  // Pump hour counters (6-8 digits for each pump)
  pumpCounters: {
    pumpNumber: number;
    currentHours: string; // 6-8 digits
    previousHours?: string;
    operatingHours?: number;
    status: 'تعمل' | 'صيانة' | 'متوقفة';
  }[];
  // 8 horizontal generator parameters
  generatorData: GeneratorReadingCells;
  // 8 horizontal electricity meter digits
  electricMeterDigits: ElectricMeterDigits;
  notes?: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  stationId: string;
  stationName: string;
  technicianName: string; // بياض عنتر أو غيره
  technicianPhone: string;
  category: 'مضخات' | 'إنارة' | 'مولدات_كهربائية' | 'لوحات_تحكم' | 'أخرى';
  title: string;
  description: string;
  status: 'قيد_المعالجة' | 'تم_الإصلاح' | 'في_انتظار_قطع_غيار';
  priority: 'عاجلة' | 'متوسطة' | 'عادية';
  date: string;
  resolutionNotes?: string;
}

export interface UserSession {
  workerId: string;
  fullName: string;
  phone: string;
  role: WorkerRole;
  stationId?: string;
}

export interface EmergencyAlert {
  id: string;
  stationId: string;
  stationName: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  type: 'فيضان_المحطة' | 'انقطاع_كهربائي_شامل' | 'توقف_المضخات' | 'حريق_أو_خطر_أمني' | 'تسرب_مفاجئ' | 'أخرى';
  typeLabel: string;
  notes?: string;
  timestamp: string; // ISO string
  status: 'نشط' | 'تم_التدخل' | 'مغلق';
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface SupervisorMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  stationId?: string;
  stationName?: string;
  category: 'طلب_وقود' | 'استفسار_مناوبة' | 'ملاحظة_ميدانية' | 'طلب_عتاد' | 'رسالة_عامة';
  content: string;
  timestamp: string;
  isRead: boolean;
  reply?: string;
  repliedAt?: string;
}

export type HandoverStationState = 'ممتازة_وعادية' | 'تحت_الملاحظة' | 'توقف_جزئي' | 'توقف_كلي';
export type HandoverPumpsState = 'تعمل_بسلاسة' | 'مضخة_احتياطية_متوقفة' | 'تسرب_أو_حرارة' | 'عطل_كهربائي';

export interface ShiftHandover {
  id: string;
  stationId: string;
  stationName: string;
  outgoingWorkerName: string;
  outgoingWorkerPhone: string;
  incomingTeamOrWorker: string;
  stationGeneralStatus: HandoverStationState;
  pumpsStatus: HandoverPumpsState;
  quickNote: string;
  additionalNotes?: string;
  timestamp: string;
}

export type MaintenanceHealth = 'green' | 'yellow' | 'red'; // أخضر: سليم ومفحوص، أصفر: صيانة قريبة، أحمر: عاجل/متأخر

export interface StationEquipmentHealth {
  stationId: string;
  stationName: string;
  overallHealth: MaintenanceHealth;
  pumpsHealth: MaintenanceHealth;
  generatorHealth: MaintenanceHealth;
  electricalHealth: MaintenanceHealth;
  lastInspectionDate: string;
  nextScheduledDate: string;
  statusNotes: string;
  technicianInCharge: string;
  urgentIssuesCount: number;
}

export interface GeneratorWeeklyLog {
  id: string;
  stationId: string;
  stationName: string;
  workerName: string;
  workerPhone: string;
  workerPinUsed: string;
  durationMinutes: number; // 10 minutes
  timestamp: string;
  fuelLevelPercent?: number;
  batteryStatus?: 'ممتازة' | 'جيدة' | 'تحتاج_شحن';
  notes?: string;
}

export interface TroubleshootingCard {
  id: string;
  title: string;
  category: 'كهرباء_وتحكم' | 'مضخات_وهيدروليك' | 'مولدات_وطاقة' | 'أحواض_وعوامات' | 'أخرى';
  symptoms: string;
  quickCheck: string[];
  recommendedAction: string;
  urgency: 'فوري' | 'متوسط' | 'وقائي';
  addedBy: string;
  createdAt: string;
  lastModified?: string;
}

export interface RolePermissions {
  canManageAll: boolean;            // خباش صلاح الدين - كامل الصلاحيات
  canAddStation: boolean;           // خاص بالمشرف فقط
  canEditStation: boolean;          // خاص بالمشرف فقط
  canDeleteStation: boolean;        // خاص بالمشرف فقط
  canAddWorker: boolean;            // خاص بالمشرف فقط
  canEditWorker: boolean;           // خاص بالمشرف فقط
  canDeleteWorker: boolean;         // خاص بالمشرف فقط
  canManagePins: boolean;           // خاص بالمشرف فقط (تعديل واسترجاع الأرقام السرية)
  canManageLeaves: boolean;         // المشرف ورئيس المركز
  canManageMaintenance: boolean;    // المشرف وعون الصيانة
  canManageCounters: boolean;
  canManageTroubleshooting: boolean;// فقط للمشرف خباش صلاح الدين
  canViewHR: boolean;               // المشرف ورئيس المركز
  isDirectToStation: boolean;       // المراقب يتوجه مباشرة لمحطته
  accessibleTabs: ('stations' | 'workers' | 'shifts' | 'leaves' | 'counters' | 'maintenance' | 'my_station' | 'supervisors' | 'troubleshooting' | 'emergency_inbox')[];
}

export function getRolePermissions(role: WorkerRole): RolePermissions {
  switch (role) {
    case 'مشرف':
    case 'مدير_عام':
      // المشرف خباش صلاح الدين: كامل الصلاحيات الحصرية (إضافة، تعديل، مسح المحطات والعمال والأرقام السرية ودليل الأعطال)
      return {
        canManageAll: true,
        canAddStation: true,
        canEditStation: true,
        canDeleteStation: true,
        canAddWorker: true,
        canEditWorker: true,
        canDeleteWorker: true,
        canManagePins: true,
        canManageLeaves: true,
        canManageMaintenance: true,
        canManageCounters: true,
        canManageTroubleshooting: true,
        canViewHR: true,
        isDirectToStation: false,
        accessibleTabs: ['supervisors', 'stations', 'workers', 'shifts', 'leaves', 'counters', 'maintenance', 'troubleshooting', 'emergency_inbox']
      };

    case 'رئيس_مركز':
      // رئيس المركز: متابعة وإشراف وتسيير عطل ومناوبات وصيانة دون أي صلاحية لإضافة أو تعديل أو مسح العمال والمحطات أو تغيير الأرقام السرية
      return {
        canManageAll: false,
        canAddStation: false,
        canEditStation: false,
        canDeleteStation: false,
        canAddWorker: false,
        canEditWorker: false,
        canDeleteWorker: false,
        canManagePins: false,
        canManageLeaves: true,
        canManageMaintenance: true,
        canManageCounters: true,
        canManageTroubleshooting: false,
        canViewHR: true,
        isDirectToStation: false,
        accessibleTabs: ['supervisors', 'stations', 'workers', 'shifts', 'leaves', 'counters', 'maintenance', 'troubleshooting', 'emergency_inbox']
      };

    case 'عون_صيانة':
      // عون الصيانة بياض عنتر: ما يخص الصيانة الكهروميكانيكية، العدادات، المولدات، والمحطات دون أي صلاحية تعديل عمال أو محطات أو أرقام سرية
      return {
        canManageAll: false,
        canAddStation: false,
        canEditStation: false,
        canDeleteStation: false,
        canAddWorker: false,
        canEditWorker: false,
        canDeleteWorker: false,
        canManagePins: false,
        canManageLeaves: false,
        canManageMaintenance: true,
        canManageCounters: true,
        canManageTroubleshooting: false,
        canViewHR: false,
        isDirectToStation: false,
        accessibleTabs: ['maintenance', 'counters', 'troubleshooting', 'supervisors', 'stations']
      };

    case 'إداري':
      return {
        canManageAll: false,
        canAddStation: false,
        canEditStation: false,
        canDeleteStation: false,
        canAddWorker: false,
        canEditWorker: false,
        canDeleteWorker: false,
        canManagePins: false,
        canManageLeaves: true,
        canManageMaintenance: true,
        canManageCounters: true,
        canManageTroubleshooting: false,
        canViewHR: true,
        isDirectToStation: false,
        accessibleTabs: ['supervisors', 'stations', 'workers', 'shifts', 'leaves', 'counters', 'maintenance', 'troubleshooting']
      };

    case 'مراقب':
    case 'عامل_مناوبة':
    default:
      // المراقب وعامل المناوبة: يتوجه مباشرة لمحطته الخاصة مع وظائف المناوبة والطوارئ والمراسلة والدليل دون أي صلاحيات تعديل
      return {
        canManageAll: false,
        canAddStation: false,
        canEditStation: false,
        canDeleteStation: false,
        canAddWorker: false,
        canEditWorker: false,
        canDeleteWorker: false,
        canManagePins: false,
        canManageLeaves: false,
        canManageMaintenance: false,
        canManageCounters: true,
        canManageTroubleshooting: false,
        canViewHR: false,
        isDirectToStation: true,
        accessibleTabs: ['my_station', 'supervisors', 'troubleshooting', 'shifts', 'counters']
      };
  }
}

export interface AppData {
  stations: Station[];
  workers: Worker[];
  leaves: LeaveRecord[];
  counters: MonthlyCounterRecord[];
  maintenance: MaintenanceTicket[];
  administrators: Administrator[];
  // 6 New Feature Collections
  emergencyAlerts: EmergencyAlert[];
  supervisorMessages: SupervisorMessage[];
  shiftHandovers: ShiftHandover[];
  preventiveMaintenances: StationEquipmentHealth[];
  generatorWeeklyLogs: GeneratorWeeklyLog[];
  troubleshootingGuides: TroubleshootingCard[];
  lastUpdated: string;
}


