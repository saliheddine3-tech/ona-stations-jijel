import { Station, Worker, AdminUser, EmergencyAlert, SupervisorMessage } from '../types';

export interface AppData {
  stations: Station[];
  workers: Worker[];
  adminUsers: AdminUser[];
  emergencyAlerts: EmergencyAlert[];
  supervisorMessages: SupervisorMessage[];
  lastUpdated: string;
}

const STORAGE_KEY = 'markaz_al_mahattat_data_v1';

// قائمة المحطات الأولية المباشرة لضمان عدم حدوث خطأ في الاستيراد (Import Error)
const defaultStations: Station[] = [
  { id: '1', name: 'رقم 04 أولاد بوالنار', status: 'جاهزة', notes: 'تعمل بشكل جيد', lat: 36.8196211, lng: 5.7146666, flowRate: 5000, pumpsCount: 2, workersCount: 4 },
  { id: '2', name: 'محطة العرايش', status: 'صيانة', notes: 'صيانة دورية للمضخة 2', lat: 36.8188347, lng: 5.7337807, flowRate: 3000, pumpsCount: 2, workersCount: 4 },
  { id: '3', name: 'محطة العوانة', status: 'صيانة', notes: 'مشكل في المولد الكهربائي', lat: 36.8141122, lng: 5.6068716, flowRate: 3500, pumpsCount: 2, workersCount: 4 },
  { id: '4', name: 'محطة برج بليدة', status: 'متوقفة', notes: 'المضخة رقم 1 متوقفة', lat: 36.7955434, lng: 5.6631320, flowRate: 2540, pumpsCount: 2, workersCount: 4 },
  { id: '5', name: 'محطة الشالات', status: 'جاهزة', notes: 'تعمل بشكل جيد', lat: 36.7775786, lng: 5.6281670, flowRate: 3000, pumpsCount: 2, workersCount: 5 },
  { id: '6', name: 'محطة التشلاولة', status: 'جاهزة', notes: 'تعمل بشكل جيد', lat: 36.8046189, lng: 5.8080554, flowRate: 2000, pumpsCount: 2, workersCount: 4 },
  { id: '7', name: 'محطة الشاطئ', status: 'جاهزة', notes: 'تعمل بشكل جيد', lat: 36.8115470, lng: 5.7786021, flowRate: 3500, pumpsCount: 2, workersCount: 5 },
  { id: '8', name: 'محطة المسمكة', status: 'جاهزة', notes: 'تعمل بشكل جيد', lat: 36.8229486, lng: 5.7695526, flowRate: 2540, pumpsCount: 2, workersCount: 4 },
  { id: '9', name: 'محطة رأس العافية', status: 'متوقفة', notes: 'انقطاع التيار الكهربائي', lat: 36.8141357, lng: 5.6968091, flowRate: 1500, pumpsCount: 2, workersCount: 4 }
];

const getInitialData = (): AppData => ({
  stations: defaultStations,
  workers: [],
  adminUsers: [],
  emergencyAlerts: [],
  supervisorMessages: [],
  lastUpdated: new Date().toISOString()
});

class StorageService {
  private data: AppData;
  private listeners: ((data: AppData) => void)[] = [];
  private syncListeners: ((isSyncing: boolean, lastSynced: string | null) => void)[] = [];
  private isSyncing = false;
  private lastSyncedAt: string | null = null;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    this.data = getInitialData();
    this.loadLocalData();
    this.setupNetworkListeners();
    
    if (typeof window !== 'undefined') {
      this.tryCloudSync();
      // مزامنة تلقائية كل 10 ثوان لمزامن البيانات بين الهاتف والكمبيوتر
      setInterval(() => {
        this.tryCloudSync();
      }, 10000);
    }
  }

  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.tryCloudSync();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifySync();
    });
  }

  private loadLocalData() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.data = { ...getInitialData(), ...parsed };
      }
    } catch (e) {
      console.error('خطأ في قراءة التخزين المحلي:', e);
    }
  }

  private saveLocalData(data: AppData) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('خطأ في حفظ التخزين المحلي:', e);
    }
  }

  public subscribe(listener: (data: AppData) => void) {
    this.listeners.push(listener);
    listener(this.data);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public subscribeSync(listener: (isSyncing: boolean, lastSynced: string | null) => void) {
    this.syncListeners.push(listener);
    listener(this.isSyncing, this.lastSyncedAt);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.data));
  }

  private notifySync() {
    this.syncListeners.forEach(l => l(this.isSyncing, this.lastSyncedAt));
  }

  public getData(): AppData {
    return this.data;
  }

  private async updateData(updater: (prev: AppData) => AppData, actionType: string, payload: any) {
    this.data = updater(this.data);
    this.data.lastUpdated = new Date().toISOString();
    this.saveLocalData(this.data);
    this.notify();

    if (this.isOnline) {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            changes: [{ actionType, payload }],
            clientTimestamp: new Date().toISOString()
          })
        });
      } catch (e) {
        console.warn('تعذر إرسال التحديث للسيرفر:', e);
      }
    }
    this.notifySync();
  }

  public async tryCloudSync() {
    if (typeof window === 'undefined' || !this.isOnline) return;

    try {
      this.isSyncing = true;
      this.notifySync();

      const res = await fetch('/api/data');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.stations) {
          this.data = serverData;
          this.saveLocalData(this.data);
          this.notify();
        }
      }
    } catch (error) {
      // تجاهل أخطاء الشبكة المؤقتة
    } finally {
      this.isSyncing = false;
      this.lastSyncedAt = new Date().toISOString();
      this.notifySync();
    }
  }

  // دوال التفاعل مع التطبيق
  public updateStation(id: string, updates: Partial<Station>) {
    this.updateData(prev => ({
      ...prev,
      stations: prev.stations.map(s => s.id === id ? { ...s, ...updates } : s)
    }), 'UPDATE_STATION', { id, updates });
  }

  public addEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'timestamp'>) {
    const newAlert: EmergencyAlert = {
      ...alert,
      id: 'em_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    this.updateData(prev => ({
      ...prev,
      emergencyAlerts: [newAlert, ...(prev.emergencyAlerts || [])]
    }), 'ADD_EMERGENCY', newAlert);
  }

  public deleteEmergencyAlert(id: string) {
    this.updateData(prev => ({
      ...prev,
      emergencyAlerts: (prev.emergencyAlerts || []).filter(a => a.id !== id)
    }), 'DELETE_EMERGENCY', { id });
  }

  public addSupervisorMessage(msg: Omit<SupervisorMessage, 'id' | 'timestamp'>) {
    const newMsg: SupervisorMessage = {
      ...msg,
      id: 'msg_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    this.updateData(prev => ({
      ...prev,
      supervisorMessages: [newMsg, ...(prev.supervisorMessages || [])]
    }), 'ADD_MESSAGE', newMsg);
  }
}

export const storageService = new StorageService();
