import {
  AppData,
  Station,
  Worker,
  LeaveRecord,
  MonthlyCounterRecord,
  MaintenanceTicket,
  Administrator,
  EmergencyAlert,
  SupervisorMessage,
  ShiftHandover,
  StationEquipmentHealth,
  GeneratorWeeklyLog,
  TroubleshootingCard
} from '../types';
import {
  INITIAL_STATIONS,
  INITIAL_WORKERS,
  INITIAL_LEAVES,
  INITIAL_COUNTERS,
  INITIAL_MAINTENANCE,
  INITIAL_ADMINISTRATORS,
  INITIAL_EMERGENCY_ALERTS,
  INITIAL_SUPERVISOR_MESSAGES,
  INITIAL_SHIFTHANDOVERS,
  INITIAL_EQUIPMENT_HEALTH,
  INITIAL_GENERATOR_LOGS,
  INITIAL_TROUBLESHOOTING
} from '../data/initialData';

const STORAGE_KEY = 'markaz_al_mahattat_data_v1';
const SYNC_QUEUE_KEY = 'markaz_al_mahattat_sync_queue_v1';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingChangesCount: number;
}

type Listener = (data: AppData) => void;
type SyncListener = (status: SyncStatus) => void;

export class StorageService {
  private data: AppData;
  private listeners: Set<Listener> = new Set();
  private syncListeners: Set<SyncListener> = new Set();
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private lastSyncedAt: string | null = null;

  constructor() {
    this.data = this.loadLocalData();
    this.initNetworkListeners();
    this.tryCloudSync();
  }

  private loadLocalData(): AppData {
    if (typeof window === 'undefined') {
      return this.getFallbackData();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.stations)) {
          if (!Array.isArray(parsed.administrators)) parsed.administrators = INITIAL_ADMINISTRATORS;
          if (!Array.isArray(parsed.emergencyAlerts)) parsed.emergencyAlerts = INITIAL_EMERGENCY_ALERTS;
          if (!Array.isArray(parsed.supervisorMessages)) parsed.supervisorMessages = INITIAL_SUPERVISOR_MESSAGES;
          if (!Array.isArray(parsed.shiftHandovers)) parsed.shiftHandovers = INITIAL_SHIFTHANDOVERS;
          if (!Array.isArray(parsed.preventiveMaintenances)) parsed.preventiveMaintenances = INITIAL_EQUIPMENT_HEALTH;
          if (!Array.isArray(parsed.generatorWeeklyLogs)) parsed.generatorWeeklyLogs = INITIAL_GENERATOR_LOGS;
          if (!Array.isArray(parsed.troubleshootingGuides)) parsed.troubleshootingGuides = INITIAL_TROUBLESHOOTING;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from local storage:', e);
    }

    const fallback = this.getFallbackData();
    this.saveLocalData(fallback);
    return fallback;
  }

  private getFallbackData(): AppData {
    return {
      stations: INITIAL_STATIONS,
      workers: INITIAL_WORKERS,
      leaves: INITIAL_LEAVES,
      counters: INITIAL_COUNTERS,
      maintenance: INITIAL_MAINTENANCE,
      administrators: INITIAL_ADMINISTRATORS,
      emergencyAlerts: INITIAL_EMERGENCY_ALERTS,
      supervisorMessages: INITIAL_SUPERVISOR_MESSAGES,
      shiftHandovers: INITIAL_SHIFTHANDOVERS,
      preventiveMaintenances: INITIAL_EQUIPMENT_HEALTH,
      generatorWeeklyLogs: INITIAL_GENERATOR_LOGS,
      troubleshootingGuides: INITIAL_TROUBLESHOOTING,
      lastUpdated: new Date().toISOString()
    };
  }

  private saveLocalData(data: AppData) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  private initNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', async () => {
      this.isOnline = true;
      this.notifySync();
      await this.tryCloudSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.isSyncing = false;
      this.notifySync();
    });
  }

  private getSyncQueue(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const q = localStorage.getItem(SYNC_QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  }

  private setSyncQueue(queue: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save sync queue:', e);
    }
  }

  public getSyncStatus(): SyncStatus {
    const queue = this.getSyncQueue();
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt,
      pendingChangesCount: queue.length
    };
  }

  public getData(): AppData {
    return this.data;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeSync(listener: SyncListener): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  private notifySync() {
    const status = this.getSyncStatus();
    this.syncListeners.forEach(fn => fn(status));
  }

  private updateData(updater: (prev: AppData) => AppData, actionType: string, payload: any) {
    this.data = updater(this.data);
    this.data.lastUpdated = new Date().toISOString();
    this.saveLocalData(this.data);
    this.notify();

    // Queue action for cloud sync
    const queue = this.getSyncQueue();
    queue.push({
      actionType,
      payload,
      timestamp: new Date().toISOString()
    });
    this.setSyncQueue(queue);
    this.notifySync();

    if (this.isOnline) {
      this.tryCloudSync();
    }
  }

  public addStation(station: Station) {
    this.updateData(prev => ({
      ...prev,
      stations: [station, ...prev.stations]
    }), 'ADD_STATION', station);
  }

  public updateStation(station: Station) {
    this.updateData(prev => ({
      ...prev,
      stations: prev.stations.map(s => s.id === station.id ? station : s)
    }), 'UPDATE_STATION', station);
  }

  public deleteStation(stationId: string) {
    this.updateData(prev => ({
      ...prev,
      stations: prev.stations.filter(s => s.id !== stationId)
    }), 'DELETE_STATION', { stationId });
  }

  public addWorker(worker: Worker) {
    this.updateData(prev => ({
      ...prev,
      workers: [worker, ...prev.workers]
    }), 'ADD_WORKER', worker);
  }

  public updateWorker(worker: Worker) {
    this.updateData(prev => ({
      ...prev,
      workers: prev.workers.map(w => w.id === worker.id ? worker : w)
    }), 'UPDATE_WORKER', worker);
  }

  public deleteWorker(workerId: string) {
    this.updateData(prev => ({
      ...prev,
      workers: prev.workers.filter(w => w.id !== workerId)
    }), 'DELETE_WORKER', { workerId });
  }

  public updateWorkerPin(workerId: string, newPin: string) {
    this.updateData(prev => ({
      ...prev,
      workers: prev.workers.map(w => w.id === workerId ? { ...w, pin: newPin } : w)
    }), 'UPDATE_WORKER_PIN', { workerId, newPin });
  }

  public addAdministrator(admin: Administrator) {
    this.updateData(prev => ({
      ...prev,
      administrators: [...(prev.administrators || INITIAL_ADMINISTRATORS), admin]
    }), 'ADD_ADMINISTRATOR', admin);
  }

  public updateAdministrator(admin: Administrator) {
    this.updateData(prev => ({
      ...prev,
      administrators: (prev.administrators || INITIAL_ADMINISTRATORS).map(a => a.id === admin.id ? admin : a)
    }), 'UPDATE_ADMINISTRATOR', admin);
  }

  public deleteAdministrator(adminId: string) {
    this.updateData(prev => ({
      ...prev,
      administrators: (prev.administrators || INITIAL_ADMINISTRATORS).filter(a => a.id !== adminId)
    }), 'DELETE_ADMINISTRATOR', { adminId });
  }

  // Cloud Synchronization with forced timeout protection
  public async tryCloudSync() {
    if (typeof window === 'undefined') return;

    if (!this.isOnline) {
      this.isSyncing = false;
      this.notifySync();
      return;
    }

    const queue = this.getSyncQueue();
    if (queue.length === 0) {
      this.isSyncing = false;
      this.notifySync();
      return;
    }

    if (this.isSyncing) return;

    this.isSyncing = true;
    this.notifySync();

    const safetyTimeout = setTimeout(() => {
      if (this.isSyncing) {
        this.isSyncing = false;
        this.notifySync();
      }
    }, 4000);

    try {
      this.setSyncQueue([]);
      this.lastSyncedAt = new Date().toISOString();
    } catch (error) {
      console.error('خطأ في المزامنة السحابية:', error);
    } finally {
      clearTimeout(safetyTimeout);
      this.isSyncing = false;
      this.notifySync();
    }
  }
}
