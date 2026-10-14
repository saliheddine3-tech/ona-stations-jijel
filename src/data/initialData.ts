import { 
  AppData, 
  Station, 
  Worker, 
  MonthlyCounterRecord, 
  LeaveRecord, 
  MaintenanceTicket, 
  Administrator,
  EmergencyAlert,
  SupervisorMessage,
  ShiftHandover,
  StationEquipmentHealth,
  GeneratorWeeklyLog,
  TroubleshootingCard
} from '../types';

export const INITIAL_STATIONS: Station[] = [
  {
    id: 'st-01',
    name: 'محطة رقم أولاد 04 بوالنار',
    phone: '034471001',
    status: 'جاهزة',
    latitude: 36.8196211,
    longitude: 5.7146666,
    capacity: 5000,
    pumpsCount: 2,
    workersCount: 4,
    notes: 'تعمل بشكل جيد ومضخات في حالة تشغيل منتظم',
    commune: 'أولاد بوالنار - جيجل',
    assignedWorkerIds: ['w-01', 'w-02', 'w-03', 'w-04']
  },
  {
    id: 'st-02',
    name: 'محطة العرايش',
    phone: '034471002',
    status: 'صيانة',
    latitude: 36.8188347,
    longitude: 5.7337807,
    capacity: 3000,
    pumpsCount: 2,
    workersCount: 4,
    notes: 'صيانة دورية للمضخة 2 واستبدال مانع التسرب',
    commune: 'العرايش - جيجل',
    assignedWorkerIds: ['w-05', 'w-06', 'w-07', 'w-08']
  },
  {
    id: 'st-03',
    name: 'محطة العوانة',
    phone: '034471003',
    status: 'صيانة',
    latitude: 36.8141122,
    longitude: 5.6068716,
    capacity: 3500,
    pumpsCount: 2,
    workersCount: 4,
    notes: 'مشكل في المولد الكهربائي - بياض عنتر مكلف بالفحص',
    commune: 'العوانة',
    assignedWorkerIds: ['w-09', 'w-10', 'w-11', 'w-12']
  },
  {
    id: 'st-04',
    name: 'محطة برج بليدة',
    phone: '034471004',
    status: 'متوقفة',
    latitude: 36.7955434,
    longitude: 5.6631320,
    capacity: 2540,
    pumpsCount: 2,
    workersCount: 4,
    notes: 'المضخة رقم 1 متوقفة - استبدال محمل الدوران قيد الإنجاز',
    commune: 'برج بليدة',
    assignedWorkerIds: ['w-13', 'w-14', 'w-15', 'w-16']
  },
  {
    id: 'st-05',
    name: 'محطة الشالات',
    phone: '034471005',
    status: 'جاهزة',
    latitude: 36.7775786,
    longitude: 5.6281670,
    capacity: 3000,
    pumpsCount: 2,
    workersCount: 5,
    notes: 'تعمل بشكل جيد ووتيرة الضخ مستقرة',
    commune: 'الشالات',
    assignedWorkerIds: ['w-17', 'w-18', 'w-19', 'w-20', 'w-21']
  },
  {
    id: 'st-06',
    name: 'محطة التشلاولة',
    phone: '034471006',
    status: 'جاهزة',
    latitude: 36.8046189,
    longitude: 5.8080554,
    capacity: 2000,
    pumpsCount: 2,
    workersCount: 4,
    notes: 'تعمل بشكل جيد ومستوى الحوض طبيعي',
    commune: 'التشلاولة',
    assignedWorkerIds: ['w-22', 'w-23', 'w-24', 'w-25']
  },
  {
    id: 'st-07',
    name: 'محطة الشاطئ',
    phone: '034471007',
    status: 'جاهزة',
    latitude: 36.8115470,
    longitude: 5.7786021,
    capacity: 3500,
    pumpsCount: 2,
    workersCount: 5,
    notes: 'تعمل بشكل جيد - تفريغ دوري للرواسب',
    commune: 'الكورنيش - الشاطئ',
    assignedWorkerIds: ['w-26', 'w-27', 'w-28', 'w-29', 'w-30']
  },
  {
    id: 'st-08',
    name: 'محطة المسمكة',
    phone: '034471008',
    status: 'جاهزة',
    latitude: 36.8229486,
    longitude: 5.7695526,
    capacity: 2540,
    pumpsCount: 2,
    workersCount: 4,
    notes: 'تعمل بشكل جيد - المولد في وضع الاستعداد',
    commune: 'المسمكة - الميناء القديم',
    assignedWorkerIds: ['w-31', 'w-32', 'w-33', 'w-34']
  },
  {
    id: 'st-09',
    name: 'محطة رأس العافية',
    phone: '034471009',
    status: 'متوقفة',
    latitude: 36.8141357,
    longitude: 5.6968091,
    capacity: 1500,
    pumpsCount: 2,
    workersCount: 4,
    notes: 'انقطاع التيار الكهربائي وسونلغاز بصدد التدخل',
    commune: 'رأس العافية - المنارة',
    assignedWorkerIds: ['w-35', 'w-36', 'w-37', 'w-38']
  },
  {
    id: 'st-10',
    name: 'محطة الرفع 1',
    phone: '034471010',
    status: 'جاهزة',
    latitude: 36.8165000,
    longitude: 5.7521000,
    capacity: 4500,
    pumpsCount: 3,
    workersCount: 8,
    notes: 'تعمل بشكل جيد - محطة رئيسية عالية السعة',
    commune: 'جيجل وسط',
    assignedWorkerIds: ['w-39', 'w-40', 'w-41', 'w-42', 'w-43', 'w-44', 'w-45', 'w-46']
  },
  {
    id: 'st-11',
    name: 'محطة الرفع 2',
    phone: '034471011',
    status: 'جاهزة',
    latitude: 36.8089000,
    longitude: 5.7412000,
    capacity: 3200,
    pumpsCount: 2,
    workersCount: 5,
    notes: 'تعمل بشكل جيد - وتيرة المناوبة منتظمة',
    commune: 'الحي الغربي',
    assignedWorkerIds: ['w-47', 'w-48', 'w-49', 'w-50', 'w-51']
  },
  {
    id: 'st-12',
    name: 'محطة الرفع 3',
    phone: '034471012',
    status: 'جاهزة',
    latitude: 36.8251000,
    longitude: 5.7830000,
    capacity: 3100,
    pumpsCount: 2,
    workersCount: 5,
    notes: 'تعمل بشكل جيد ومستوى الضغط طبيعي',
    commune: 'كتامة',
    assignedWorkerIds: ['w-52', 'w-53', 'w-54', 'w-55', 'w-56']
  },
  {
    id: 'st-13',
    name: 'محطة الرفع 4',
    phone: '034471013',
    status: 'جاهزة',
    latitude: 36.8020000,
    longitude: 5.7650000,
    capacity: 3800,
    pumpsCount: 3,
    workersCount: 6,
    notes: 'تعمل بشكل جيد مع ضخ تعزيزي',
    commune: 'طريق الشقفة',
    assignedWorkerIds: ['w-57', 'w-58', 'w-59', 'w-60', 'w-61', 'w-62']
  },
  {
    id: 'st-14',
    name: 'محطة الرفع 5',
    phone: '034471014',
    status: 'جاهزة',
    latitude: 36.7905000,
    longitude: 5.7210000,
    capacity: 3600,
    pumpsCount: 2,
    workersCount: 6,
    notes: 'تعمل بشكل جيد - شبكة التجميع تعمل بانتظام',
    commune: 'الفرسان',
    assignedWorkerIds: ['w-63', 'w-64', 'w-65', 'w-66', 'w-67', 'w-68']
  },
  {
    id: 'st-15',
    name: 'محطة الرفع 6',
    phone: '034471015',
    status: 'جاهزة',
    latitude: 36.8290000,
    longitude: 5.7480000,
    capacity: 2800,
    pumpsCount: 2,
    workersCount: 4,
    notes: 'تعمل بشكل جيد وجاهزية كاملة للمضختين',
    commune: 'بوالنار الشرقية',
    assignedWorkerIds: ['w-69', 'w-70', 'w-71', 'w-72']
  },
  {
    id: 'st-16',
    name: 'محطة الرفع 7 (الميناء الجديد)',
    phone: '034471016',
    status: 'جاهزة',
    latitude: 36.8172000,
    longitude: 5.7711000,
    capacity: 3400,
    pumpsCount: 2,
    workersCount: 4,
    notes: 'تعمل بشكل جيد وتصريف سلس للمياه',
    commune: 'الميناء الجديد',
    assignedWorkerIds: ['w-73', 'w-74', 'w-75', 'w-76']
  }
];

// Supervisors and Key Figures
export const ADMIN_USER = {
  fullName: 'خباش صلاح الدين',
  phone: '0669436843',
  pin: '1984',
  role: 'مشرف' as const,
  residence: 'جيجل - وسط المدينة'
};

export const CENTER_HEAD = {
  fullName: 'بوفريس عبد الحكيم',
  phone: '0661223344',
  pin: '2024',
  role: 'رئيس_مركز' as const,
  residence: 'جيجل - الحي الغربي'
};

export const MAINTENANCE_AGENT = {
  fullName: 'بياض عنتر',
  phone: '0662556677',
  pin: '3344',
  role: 'عون_صيانة' as const,
  residence: 'جيجل - أولاد بوالنار',
  specialty: 'مختص كهروميكانيك للمحطات (مضخات، إنارة، مولدات كهربائية)'
};

export const INITIAL_ADMINISTRATORS: Administrator[] = [
  {
    id: 'adm-01',
    fullName: 'خباش صلاح الدين',
    phone: '0669436843',
    pin: '1984',
    role: 'مشرف',
    title: 'المشرف (عون المكتب)',
    badge: 'كامل الصلاحيات',
    badgeColor: 'cyan',
    residence: 'جيجل - وسط المدينة',
    workplace: 'مقر وحدة جيجل ONA',
    tasks: [
      'الإشراف العام وتسيير 16 محطة رفع وإدارة قاعدة البيانات السحابية.',
      'كامل الصلاحيات في إضافة وتعديل ومسح المحطات وتعيين العمال.',
      'إدارة الرموز السرية للمستخدمين والتنسيق مع إدارة الديوان.'
    ],
    isDefault: true
  },
  {
    id: 'adm-02',
    fullName: 'بوفريس عبد الحكيم',
    phone: '0661223344',
    pin: '2024',
    role: 'رئيس_مركز',
    title: 'رئيس مركز المحطات',
    badge: 'صلاحيات إشرافية',
    badgeColor: 'blue',
    residence: 'جيجل - الحي الغربي',
    workplace: 'مركز المحطات - وحدة جيجل',
    tasks: [
      'متابعة جدول المناوبات الدائرية لـ 76 عاملاً وضمان التغطية المستمرة.',
      'المصادقة على العطل المرضية والسنوية وتفعيل التعويض الذكي.',
      'التنسيق الميداني المباشر مع مراقبي المحطات وعون الصيانة.'
    ],
    isDefault: true
  },
  {
    id: 'adm-03',
    fullName: 'بياض عنتر',
    phone: '0662556677',
    pin: '3344',
    role: 'عون_صيانة',
    title: 'عون الصيانة الكهروميكانيكية',
    badge: 'مختص كهروميكانيك',
    badgeColor: 'amber',
    residence: 'جيجل - أولاد بوالنار',
    workplace: 'ورشة الصيانة الكهروميكانيكية',
    tasks: [
      'المضخات: فحص دوري، تغيير موانع التسرب والمحامل، وصيانة المحركات.',
      'الإنارة: أمان محيط المحطات والكواشف الليلية ولوحات التحكم.',
      'المولدات الكهربائية: متابعة الإقلاع الآلي، شحن البطاريات، والوقود.'
    ],
    isDefault: true
  }
];

const RESIDENCE_OPTIONS = [
  'أولاد بوالنار',
  'العوانة',
  'العرايش',
  'برج بليدة',
  'الشالات',
  'التشلاولة',
  'جيجل وسط',
  'الحي الغربي',
  'كتامة',
  'المسمكة',
  'رأس العافية',
  'طريق الشقفة',
  'الفرسان',
  'حي المقاسم',
  'العقيد لطفي',
  'أولاد عيسى'
];

const ALGERIAN_NAMES = [
  'أحمد بوعزة', 'مراد بلعيد', 'سمير زروال', 'فاروق شابي',
  'كريم عمروش', 'يوسف دراجي', 'عادل بن عيسى', 'رشيد مزيان',
  'حسان بلقاسم', 'توفيق علواني', 'وليد قدور', 'طارق منصوري',
  'سفيان حركات', 'رياض بوشريط', 'إلياس شريفي', 'نبيل زغدان',
  'عصام بوطرفة', 'منير بن مهيدي', 'عمار قاسمي', 'حمزة لوصيف',
  'كمال بوقرة', 'عبد النور لعروسي', 'فؤاد خضراوي', 'نور الدين بومعزة',
  'هشام سعدي', 'عبد القادر شلغوم', 'مصطفى قاسي', 'سليم بودبوز',
  'رضوان رحماني', 'بلال حفيان', 'جمال دحماني', 'أمين مرزوقي',
  'بشير كشود', 'صالح جودي', 'عز الدين سلطاني', 'لطفي براهيمي',
  'مرزوق عيساوي', 'رابح بن ديدة', 'إسماعيل قسوم', 'حكيم فرحات',
  'فيصل عثماني', 'خير الدين زوبير', 'مبروك يحياوي', 'محسن بلعيدي',
  'زهير شلابي', 'عثمان بركاني', 'عياش بوجملين', 'سالم قرين',
  'عمر بودربالة', 'عبد الرزاق دلالي', 'حسام غانمي', 'عقبة عماري',
  'طيب بوزيدي', 'زكرياء بولعراس', 'ياسين حداد', 'سفيان معوش',
  'عبد الحق شوشان', 'مهدي بلقاضي', 'صابر رابحي', 'يونس بن زايد',
  'زياد بوعبد الله', 'مروان خليل', 'حميد لوعيل', 'بدر الدين جاب الله',
  'عزوز بن حمادي', 'سليمان بوشاقور', 'فريد عريبي', 'أكرم حماني',
  'عياشي دربال', 'عبد المالك شرفي', 'شمس الدين قايد', 'حميدوش عبد الرحيم',
  'وليد بركاني', 'عمران بوطالبي', 'شفيق مسعودي', 'يحيى قرفي'
];

// Generate exactly 76 workers
export const INITIAL_WORKERS: Worker[] = Array.from({ length: 76 }, (_, i) => {
  const idNumber = i + 1;
  const id = `w-${String(idNumber).padStart(2, '0')}`;
  const name = ALGERIAN_NAMES[i] || `عامل مناوبة ${idNumber}`;
  
  // Distribute across stations
  let stationId = 'st-01';
  let acc = 0;
  for (const st of INITIAL_STATIONS) {
    if (idNumber <= acc + st.workersCount) {
      stationId = st.id;
      break;
    }
    acc += st.workersCount;
  }

  // 4-day cycle offset (0, 1, 2, 3) so workers are distributed across shifts
  const cycleOffset = i % 4;
  const residence = RESIDENCE_OPTIONS[i % RESIDENCE_OPTIONS.length];
  const phone = `066${String(1000000 + (i * 12347) % 9000000).slice(0, 7)}`;
  const pin = String(1000 + ((i + 1) * 37) % 8999).padStart(4, '0');

  return {
    id,
    fullName: name,
    phone,
    pin,
    role: (idNumber === 1 ? 'مراقب' : 'عامل_مناوبة') as any,
    residence,
    stationId,
    cycleOffset,
    isActive: true,
    notes: `مناوب محطة دوري - دورة ${cycleOffset + 1}`
  };
});

// Initial leaves
export const INITIAL_LEAVES: LeaveRecord[] = [
  {
    id: 'leave-01',
    workerId: 'w-03',
    workerName: INITIAL_WORKERS[2].fullName,
    type: 'عطلة_مرضية',
    startDate: '2026-10-12',
    endDate: '2026-10-15',
    reason: 'وعكة صحية وإجازة طبية مصادقة',
    substituteWorkerId: 'w-07',
    substituteWorkerName: INITIAL_WORKERS[6].fullName,
    status: 'جارية',
    createdAt: '2026-10-11',
    compensationNotes: 'تم التعويض بالعامل الأقرب سكناً في يوم راحته الثاني'
  },
  {
    id: 'leave-02',
    workerId: 'w-14',
    workerName: INITIAL_WORKERS[13].fullName,
    type: 'عطلة_سنوية',
    startDate: '2026-10-10',
    endDate: '2026-10-20',
    reason: 'عطلة سنوية مبرمجة',
    substituteWorkerId: 'w-18',
    substituteWorkerName: INITIAL_WORKERS[17].fullName,
    status: 'جارية',
    createdAt: '2026-10-08',
    compensationNotes: 'تعويض تبادلي بالتنسيق مع رئيس المركز'
  }
];

// Initial Counter & Generator & Electricity records
export const INITIAL_COUNTERS: MonthlyCounterRecord[] = [
  {
    id: 'cnt-01',
    stationId: 'st-01',
    month: '2026-10',
    date: '2026-10-01',
    recorderName: 'أحمد بوعزة',
    recorderPhone: '0661234567',
    pumpCounters: [
      {
        pumpNumber: 1,
        currentHours: '04829150', // 8 digits
        previousHours: '04828550',
        operatingHours: 600,
        status: 'تعمل'
      },
      {
        pumpNumber: 2,
        currentHours: '03918240',
        previousHours: '03917710',
        operatingHours: 530,
        status: 'تعمل'
      }
    ],
    generatorData: {
      cell1: '001248', // ساعات التشغيل
      cell2: '85%',    // الوقود
      cell3: '4.2',    // ضغط الزيت بار
      cell4: '82°C',   // حرارة المحرك
      cell5: '26.4V',  // جهد البطارية
      cell6: '50.1Hz', // التردد
      cell7: '398V',   // الجهد بين الأطوار
      cell8: '42A'     // الحمل
    },
    electricMeterDigits: {
      d1: '0',
      d2: '7',
      d3: '4',
      d4: '8',
      d5: '2',
      d6: '9',
      d7: '1',
      d8: '5',
      fullNumber: '07482915'
    },
    notes: 'قراءة شهرية أول الشهر - فحص روتيني للمولد والمضخات ممتاز',
    createdAt: '2026-10-01T08:30:00.000Z'
  },
  {
    id: 'cnt-02',
    stationId: 'st-03',
    month: '2026-10',
    date: '2026-10-05',
    recorderName: 'بياض عنتر',
    recorderPhone: '0662556677',
    pumpCounters: [
      {
        pumpNumber: 1,
        currentHours: '05120300',
        previousHours: '05119780',
        operatingHours: 520,
        status: 'تعمل'
      },
      {
        pumpNumber: 2,
        currentHours: '04899120',
        previousHours: '04898800',
        operatingHours: 320,
        status: 'صيانة'
      }
    ],
    generatorData: {
      cell1: '000854',
      cell2: '45%',
      cell3: '3.1',
      cell4: '91°C',
      cell5: '24.1V',
      cell6: '49.2Hz',
      cell7: '382V',
      cell8: '28A'
    },
    electricMeterDigits: {
      d1: '1',
      d2: '2',
      d3: '3',
      d4: '9',
      d5: '8',
      d6: '4',
      d7: '0',
      d8: '2',
      fullNumber: '12398402'
    },
    notes: 'المولد يحتاج فحص دورة التبريد وضغط الزيت منخفض نسبياً',
    createdAt: '2026-10-05T10:15:00.000Z'
  }
];

export const INITIAL_MAINTENANCE: MaintenanceTicket[] = [
  {
    id: 'maint-01',
    stationId: 'st-03',
    stationName: 'محطة العوانة',
    technicianName: 'بياض عنتر',
    technicianPhone: '0662556677',
    category: 'مولدات_كهربائية',
    title: 'عطل في نظام بدء تشغيل المولد الكهربائي وحساس الحرارة',
    description: 'المولد لا يقلع تلقائياً عند انقطاع التيار الشبكي، بطارية 24V ضعيفة وحساس الحرارة يعطي إنذار كاذب.',
    status: 'قيد_المعالجة',
    priority: 'عاجلة',
    date: '2026-10-12',
    resolutionNotes: 'تم فحص الشاحن والطلب لتوفير بطاريتين 12V 100Ah جديدة.'
  },
  {
    id: 'maint-02',
    stationId: 'st-02',
    stationName: 'محطة العرايش',
    technicianName: 'بياض عنتر',
    technicianPhone: '0662556677',
    category: 'مضخات',
    title: 'صيانة المضخة 2 واستبدال حواشي العزل (Garniture mécanique)',
    description: 'تسرب خفيف للمياه وتآكل في مانع التسرب للمضخة الغاطسة رقم 2.',
    status: 'قيد_المعالجة',
    priority: 'متوسطة',
    date: '2026-10-11',
    resolutionNotes: 'المضخة مفصولة كهربائياً وجارٍ تفكيك الحواشي.'
  },
  {
    id: 'maint-03',
    stationId: 'st-09',
    stationName: 'محطة رأس العافية',
    technicianName: 'بياض عنتر',
    technicianPhone: '0662556677',
    category: 'إنارة',
    title: 'إصلاح إنارة المحطة والمحيط الخارجي والكواشف الليلية',
    description: 'كواشف LED للمحيط الخارجي معطلة بسبب الصواعق الأخيرة.',
    status: 'تم_الإصلاح',
    priority: 'عادية',
    date: '2026-10-09',
    resolutionNotes: 'تم استبدال قاطع التفاضلي وتركيب كاشفين 100W جديدين والإنارة ممتازة.'
  }
];

// --- 1. Emergency Alerts Data ---
export const INITIAL_EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: 'emg-01',
    stationId: 'st-03',
    stationName: 'محطة العوانة',
    workerId: 'w-09',
    workerName: 'بوزيزة رابح',
    workerPhone: '0663456789',
    type: 'انقطاع_كهربائي_شامل',
    typeLabel: 'انقطاع تيار كهربائي وتأخر إقلاع المولد',
    notes: 'انقطاع شبكة سونلغاز مع تعثر المولد الكهربائي في الإقلاع التلقائي ATS.',
    timestamp: '2026-10-14T08:15:00.000Z',
    status: 'تم_التدخل',
    resolvedBy: 'بياض عنتر (عون صيانة)',
    resolvedAt: '2026-10-14T09:30:00.000Z'
  }
];

// --- 2. Supervisor Direct Messages ---
export const INITIAL_SUPERVISOR_MESSAGES: SupervisorMessage[] = [
  {
    id: 'msg-01',
    senderId: 'w-01',
    senderName: 'بوالقمح عبد الكريم',
    senderPhone: '0661123456',
    stationId: 'st-01',
    stationName: 'محطة رقم أولاد 04 بوالنار',
    category: 'طلب_وقود',
    content: 'المشرف خباش، مستوى الديزل في خزان المولد وصل إلى 35%، يرجى برمجة تزويد بالمازوت قبل نهاية الأسبوع.',
    timestamp: '2026-10-13T16:20:00.000Z',
    isRead: true,
    reply: 'تم تسجيل الطلب وسيتم إرسال شاحنة التموين صباح الأربعاء مع تفقد المولد.',
    repliedAt: '2026-10-13T17:05:00.000Z'
  },
  {
    id: 'msg-02',
    senderId: 'w-18',
    senderName: 'بوعنان رابح',
    senderPhone: '0661987654',
    stationId: 'st-04',
    stationName: 'محطة الكورنيش',
    category: 'ملاحظة_ميدانية',
    content: 'تم استلام المناوبة النهارية بسلاسة وجميع المضخات تعمل بشكل منتظم.',
    timestamp: '2026-10-14T07:10:00.000Z',
    isRead: false
  }
];

// --- 3. Shift Handover Records ---
export const INITIAL_SHIFTHANDOVERS: ShiftHandover[] = [
  {
    id: 'hnd-01',
    stationId: 'st-01',
    stationName: 'محطة رقم أولاد 04 بوالنار',
    outgoingWorkerName: 'بوالقمح عبد الكريم',
    outgoingWorkerPhone: '0661123456',
    incomingTeamOrWorker: 'فوج المناوبة الليلية (حمري رشيد)',
    stationGeneralStatus: 'ممتازة_وعادية',
    pumpsStatus: 'تعمل_بسلاسة',
    quickNote: 'تم تسليم المفاتيح والمحطة نظيفة ومستوى الحوض طبيعي',
    additionalNotes: 'عداد المضخة 1: 42150 سا، عداد المضخة 2: 38920 سا، الزيوت طبيعية.',
    timestamp: '2026-10-13T19:00:00.000Z'
  },
  {
    id: 'hnd-02',
    stationId: 'st-02',
    stationName: 'محطة العرايش',
    outgoingWorkerName: 'لعور يوسف',
    outgoingWorkerPhone: '0662234567',
    incomingTeamOrWorker: 'فوج النهار (بوشارب منير)',
    stationGeneralStatus: 'تحت_الملاحظة',
    pumpsStatus: 'مضخة_احتياطية_متوقفة',
    quickNote: 'المضخة رقم 2 مفصولة بانتظار عون الصيانة بياض عنتر',
    additionalNotes: 'المضخة 1 و3 تعملان بدون مشاكل والضغط 2.8 بار.',
    timestamp: '2026-10-14T07:00:00.000Z'
  }
];

// --- 4. 16 Stations Equipment & Preventive Maintenance Health ---
export const INITIAL_EQUIPMENT_HEALTH: StationEquipmentHealth[] = [
  {
    stationId: 'st-01',
    stationName: 'محطة رقم أولاد 04 بوالنار',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-08',
    nextScheduledDate: '2026-10-25',
    statusNotes: 'المضخات والمولد والمحولات في حالة ممتازة ومفحوصة حديثاً.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-02',
    stationName: 'محطة العرايش',
    overallHealth: 'yellow',
    pumpsHealth: 'yellow',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-11',
    nextScheduledDate: '2026-10-18',
    statusNotes: 'المضخة 2 تحتاج استكمال استبدال حواشي العزل (Garniture mécanique).',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 1
  },
  {
    stationId: 'st-03',
    stationName: 'محطة العوانة',
    overallHealth: 'red',
    pumpsHealth: 'green',
    generatorHealth: 'red',
    electricalHealth: 'yellow',
    lastInspectionDate: '2026-10-12',
    nextScheduledDate: '2026-10-15',
    statusNotes: 'بطاريات المولد ضعيفة وتحتاج استبدال عاجل لضمان الإقلاع الأوتوماتيكي.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 2
  },
  {
    stationId: 'st-04',
    stationName: 'محطة الكورنيش',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-05',
    nextScheduledDate: '2026-10-26',
    statusNotes: 'تم فحص لوحات التحكم والإنارة الليلية ومستويات الزيت.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-05',
    stationName: 'محطة بوشرقة',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-07',
    nextScheduledDate: '2026-10-28',
    statusNotes: 'سليمة وتعمل بكفاءة 100%.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-06',
    stationName: 'محطة أولاد عيسى',
    overallHealth: 'yellow',
    pumpsHealth: 'yellow',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-02',
    nextScheduledDate: '2026-10-17',
    statusNotes: 'اهتزاز طفيف في قاعدة تثبيت المضخة 1 يستوجب شد البراغي.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 1
  },
  {
    stationId: 'st-07',
    stationName: 'محطة المنار الكبير',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-10',
    nextScheduledDate: '2026-10-30',
    statusNotes: 'فحص دوري كامل ناجح.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-08',
    stationName: 'محطة كتامة',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-09',
    nextScheduledDate: '2026-10-29',
    statusNotes: 'نظام الضخ المزدوج جاهز ومستوى الشحوم والزيوت مثالي.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-09',
    stationName: 'محطة رأس العافية',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-09',
    nextScheduledDate: '2026-10-31',
    statusNotes: 'تم إصلاح كواشف الإنارة وفحص لوحة التوزيع الرئيسية.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-10',
    stationName: 'محطة الأمير عبد القادر',
    overallHealth: 'yellow',
    pumpsHealth: 'green',
    generatorHealth: 'yellow',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-04',
    nextScheduledDate: '2026-10-19',
    statusNotes: 'فلتر الهواء للمولد بحاجة لتنظيف أو استبدال.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 1
  },
  {
    stationId: 'st-11',
    stationName: 'محطة سيدي عبد العزيز 01',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-06',
    nextScheduledDate: '2026-10-27',
    statusNotes: 'المضخات الأربع تعمل بتناوب متوازن والحوض نظيف.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-12',
    stationName: 'محطة سيدي عبد العزيز 02',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-06',
    nextScheduledDate: '2026-10-27',
    statusNotes: 'المحطة بحالة جيدة جداً.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-13',
    stationName: 'محطة تيميزار',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-03',
    nextScheduledDate: '2026-10-24',
    statusNotes: 'تم فحص حساسات مستوى المياه وعوامات التشغيل التلقائي.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-14',
    stationName: 'محطة تاسوست',
    overallHealth: 'yellow',
    pumpsHealth: 'yellow',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-01',
    nextScheduledDate: '2026-10-16',
    statusNotes: 'تراكم رملي في قناة السحب يستلزم تفريغ وتنظيف قاع الحوض.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 1
  },
  {
    stationId: 'st-15',
    stationName: 'محطة الصومام',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-08',
    nextScheduledDate: '2026-10-29',
    statusNotes: 'جاهزية كاملة 100%.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  },
  {
    stationId: 'st-16',
    stationName: 'محطة الميلية المركزية',
    overallHealth: 'green',
    pumpsHealth: 'green',
    generatorHealth: 'green',
    electricalHealth: 'green',
    lastInspectionDate: '2026-10-07',
    nextScheduledDate: '2026-10-28',
    statusNotes: 'المحطة الكبرى جاهزة، جميع المضخات الأربع مفحوصة والمولد بحالة ممتازة.',
    technicianInCharge: 'بياض عنتر',
    urgentIssuesCount: 0
  }
];

// --- 5. Weekly Generator Test Logs ---
export const INITIAL_GENERATOR_LOGS: GeneratorWeeklyLog[] = [
  {
    id: 'gen-01',
    stationId: 'st-01',
    stationName: 'محطة رقم أولاد 04 بوالنار',
    workerName: 'بوالقمح عبد الكريم',
    workerPhone: '0661123456',
    workerPinUsed: '****',
    durationMinutes: 10,
    timestamp: '2026-10-07T10:15:00.000Z',
    fuelLevelPercent: 88,
    batteryStatus: 'ممتازة',
    notes: 'تشغيل أسبوعي سلس لمدة 10 دقائق لتزييت المحرك وشحن البطارية.'
  },
  {
    id: 'gen-02',
    stationId: 'st-04',
    stationName: 'محطة الكورنيش',
    workerName: 'بوعنان رابح',
    workerPhone: '0661987654',
    workerPinUsed: '****',
    durationMinutes: 10,
    timestamp: '2026-10-07T11:00:00.000Z',
    fuelLevelPercent: 75,
    batteryStatus: 'ممتازة',
    notes: 'إقلاع سريع وضغط الزيت 4.2 بار والجهد 400V مستقر.'
  }
];

// --- 6. Troubleshooting Cards (دليل الأعطال السريع) ---
export const INITIAL_TROUBLESHOOTING: TroubleshootingCard[] = [
  {
    id: 'trb-01',
    title: 'توقف المضخة الغاطسة بسبب إنذار المرحل الحراري (Relais Thermique)',
    category: 'كهرباء_وتحكم',
    symptoms: 'المضخة تفصل بعد ثوانٍ من إقلاعها وتضيء لمبة Trip / Défaut Thermique الحمراء باللوحة.',
    quickCheck: [
      'تأكد من عدم وجود شوائب أو خيوط عالقة في مروحة المضخة (Roue de pompe).',
      'افحص جهد التغذية بين الأطوار الثلاثة (380V - 400V) وتأكد من عدم سقوط طور.',
      'افحص مقياس الأمبير، هل التيار المسحوب أعلى من التيار الاسمي المقنن للمضخة.'
    ],
    recommendedAction: 'اقطع القاطع الرئيسي أولاً. انتظر 5 دقائق ليبرد المرحل، ثم اضغط زر Reset الأزرق. إذا تكرر الفصل فوراً لا تعاود التشغيل وأبلغ عون الصيانة بياض عنتر فوراً.',
    urgency: 'فوري',
    addedBy: 'المشرف خباش صلاح الدين',
    createdAt: '2026-10-01'
  },
  {
    id: 'trb-02',
    title: 'المولد الاحتياطي لا يقلع عند انقطاع التيار الشبكي',
    category: 'مولدات_وطاقة',
    symptoms: 'انقطاع تيار سونلغاز وسماع صوت محاولة إقلاع ضعيف (Click) دون دوران المحرك.',
    quickCheck: [
      'افحص مؤشر جهد بطارية الإقلاع (يجب ألا يقل عن 24V أو 12V حسب النظام).',
      'تأكد من أن مفتاح المولد على الوضع الأوتوماتيكي (AUTO) وليس (OFF/MAN).',
      'تأكد من عدم وجود زر التوقف الطارئ (Arrêt d\'urgence) مضغوطاً داخل القفل.'
    ],
    recommendedAction: 'إذا كان زر الطوارئ مضغوطاً قم بلفه لسحبه. إذا كانت البطارية ضعيفة جداً، استخدم كابل التشغيل المساعد أو أبلغ عون الصيانة لإحضار شاحن التعزيز.',
    urgency: 'فوري',
    addedBy: 'المشرف خباش صلاح الدين',
    createdAt: '2026-10-02'
  },
  {
    id: 'trb-03',
    title: 'انخفاض ضغط الضخ أو عمل المضخة دون صعود الماء (Désamorçage)',
    category: 'مضخات_وهيدروليك',
    symptoms: 'المحرك يدور وصوت المضخة طبيعي ولكن لا يوجد تفريغ مياه في المصب والضغط صفر.',
    quickCheck: [
      'افحص منسوب المياه في حوض السحب، هل هو أقل من الحد الأدنى المغمور للمضخة؟',
      'افحص صمام عدم الرجوع (Clapet anti-retour)، هل هو عالق في وضع الإغلاق؟',
      'تأكد من عدم انسداد شبكة مصفاة الحوض (Grille de dégrillage) بالكتل العالقة.'
    ],
    recommendedAction: 'أوقف المضخة فوراً لتجنب التشغيل الجاف وتلف الحواشي الميكانيكية. نظف المصافي وتأكد من امتلاء الحوض للمستوى المسموح ثم أعد المحاولة.',
    urgency: 'متوسط',
    addedBy: 'المشرف خباش صلاح الدين',
    createdAt: '2026-10-03'
  },
  {
    id: 'trb-04',
    title: 'إنذار ارتفاع مستوى الحوض إلى الحد الأقصى (Trop-Plein / Alarme Haute)',
    category: 'أحواض_وعوامات',
    symptoms: 'إنذار صوتي/ضوئي مستمر وارتفاع منسوب المياه القادمة من شبكة التطهير بشكل مفاجئ.',
    quickCheck: [
      'تأكد من اشتغال المضخة الاحتياطية تلقائياً لدعم المضخة الرئيسية.',
      'افحص عوامات المستوى (Poires de niveau) وتأكد من عدم تشابكها أو علوقها بالدهون.',
      'تأكد من عدم وجود انقطاع كهربائي في الخط الفرعي للمضخات.'
    ],
    recommendedAction: 'شغّل المضخة الثانية يدوياً في وضع (MANUEL). إذا لم تنزل المياه، أطلق فوراً إنذار SOS عبر الزر الأحمر في التطبيق واتصل بالمشرف خباش صلاح الدين.',
    urgency: 'فوري',
    addedBy: 'المشرف خباش صلاح الدين',
    createdAt: '2026-10-04'
  },
  {
    id: 'trb-05',
    title: 'تسرب مياه أو زيت من جهة المحور (Garniture / Joint)',
    category: 'مضخات_وهيدروليك',
    symptoms: 'رؤية قطرات أو تدفق مستمر للمياه حول جسم المضخة أو رائحة احتكاك خفيفة.',
    quickCheck: [
      'حدد هل التسرب من فلنجات الأنابيب (Joint de bride) أم من محور المضخة الداخلي.',
      'تفقد حرارة المحمل (Palier) باللمس الحذر أو الحساس.'
    ],
    recommendedAction: 'إذا كان التسرب خفيفاً (قطرات متفرقة)، دونه في سجل تسليم المناوبة. إذا كان تدفقاً غزيراً، أوقف المضخة وانقل الحمل للمضخة البديلة وسجل طلب تدخل صيانة لبياض عنتر.',
    urgency: 'متوسط',
    addedBy: 'المشرف خباش صلاح الدين',
    createdAt: '2026-10-05'
  },
  {
    id: 'trb-06',
    title: 'فحص التزييت الأسبوعي للمولد (بروتوكول الأربعاء)',
    category: 'مولدات_وطاقة',
    symptoms: 'إجراء وقائي دوري كل يوم أربعاء لمدة 10 دقائق لتجنب تجمد الزيوت وجفاف البطاريات.',
    quickCheck: [
      'سحب مقياس الزيت والتأكد من وجود الزيت بين علامتي MIN و MAX.',
      'التأكد من سائل تبريد المبرد (Radiateur) ونظافة فتحات التهوية.',
      'التأكد من خلو محيط المولد من المواد القابلة للاشتعال.'
    ],
    recommendedAction: 'شغّل المولد في وضع الاختبار (TEST) لمدة 10 دقائق كاملة. بعد انتهاء الـ 10 دقائق واكتمال المؤقت، اضغط زر التأكيد في التطبيق لتسجيل البصمة في السجل.',
    urgency: 'وقائي',
    addedBy: 'المشرف خباش صلاح الدين',
    createdAt: '2026-10-06'
  }
];
