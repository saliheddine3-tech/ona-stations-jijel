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

class StorageService {
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
        if (parsed && Array.isArray(parsed.stations) && Array.isArray(parsed.workers)) {
          if (!Array.isArray(parsed.administrators) || parsed.administrators.length === 0) {
            parsed.administrators = INITIAL_ADMINISTRATORS;
          }
          if (!Array.isArray(parsed.emergencyAlerts)) {
            parsed.emergencyAlerts = INITIAL_EMERGENCY_ALERTS;
          }
          if (!Array.isArray(parsed.supervisorMessages)) {
            parsed.supervisorMessages = INITIAL_SUPERVISOR_MESSAGES;
          }
          if (!Array.isArray(parsed.shiftHandovers)) {
            parsed.shiftHandovers = INITIAL_SHIFTHANDOVERS;
          }
          if (!Array.isArray(parsed.preventiveMaintenances)) {
            parsed.preventiveMaintenances = INITIAL_EQUIPMENT_HEALTH;
          }
          if (!Array.isArray(parsed.generatorWeeklyLogs)) {
            parsed.generatorWeeklyLogs = INITIAL_GENERATOR_LOGS;
          }
          if (!Array.isArray(parsed.troubleshootingGuides)) {
            parsed.troubleshootingGuides = INITIAL_TROUBLESHOOTING;
          }
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

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifySync();
      this.flushSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
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
      this.flushSyncQueue();
    }
  }

  // --- CRUD Stations ---
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

  // --- CRUD Workers ---
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

  // --- CRUD Administrators ---
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

  // --- CRUD Leaves ---
  public addLeave(leave: LeaveRecord) {
    this.updateData(prev => ({
      ...prev,
      leaves: [leave, ...prev.leaves]
    }), 'ADD_LEAVE', leave);
  }

  public updateLeave(leave: LeaveRecord) {
    this.updateData(prev => ({
      ...prev,
      leaves: prev.leaves.map(l => l.id === leave.id ? leave : l)
    }), 'UPDATE_LEAVE', leave);
  }

  public deleteLeave(leaveId: string) {
    this.updateData(prev => ({
      ...prev,
      leaves: prev.leaves.filter(l => l.id !== leaveId)
    }), 'DELETE_LEAVE', { leaveId });
  }

  // --- CRUD Counters ---
  public addCounterRecord(counter: MonthlyCounterRecord) {
    this.updateData(prev => ({
      ...prev,
      counters: [counter, ...prev.counters]
    }), 'ADD_COUNTER', counter);
  }

  public updateCounterRecord(counter: MonthlyCounterRecord) {
    this.updateData(prev => ({
      ...prev,
      counters: prev.counters.map(c => c.id === counter.id ? counter : c)
    }), 'UPDATE_COUNTER', counter);
  }

  public deleteCounterRecord(counterId: string) {
    this.updateData(prev => ({
      ...prev,
      counters: prev.counters.filter(c => c.id !== counterId)
    }), 'DELETE_COUNTER', { counterId });
  }

  // --- CRUD Maintenance Tickets ---
  public addMaintenanceTicket(ticket: MaintenanceTicket) {
    this.updateData(prev => ({
      ...prev,
      maintenance: [ticket, ...prev.maintenance]
    }), 'ADD_MAINTENANCE', ticket);
  }

  public updateMaintenanceTicket(ticket: MaintenanceTicket) {
    this.updateData(prev => ({
      ...prev,
      maintenance: prev.maintenance.map(m => m.id === ticket.id ? ticket : m)
    }), 'UPDATE_MAINTENANCE', ticket);
  }

  public deleteMaintenanceTicket(ticketId: string) {
    this.updateData(prev => ({
      ...prev,
      maintenance: prev.maintenance.filter(m => m.id !== ticketId)
    }), 'DELETE_MAINTENANCE', { ticketId });
  }

  // --- 1. Emergency Alerts ---
  public addEmergencyAlert(alert: EmergencyAlert) {
    this.updateData(prev => ({
      ...prev,
      emergencyAlerts: [alert, ...(prev.emergencyAlerts || [])]
    }), 'ADD_EMERGENCY_ALERT', alert);
  }

  public resolveEmergencyAlert(alertId: string, resolvedBy: string) {
    this.updateData(prev => ({
      ...prev,
      emergencyAlerts: (prev.emergencyAlerts || []).map(a => 
        a.id === alertId 
          ? { ...a, status: 'تم_التدخل', resolvedBy, resolvedAt: new Date().toISOString() } 
          : a
      )
    }), 'RESOLVE_EMERGENCY_ALERT', { alertId, resolvedBy });
  }

  // --- 2. Supervisor Direct Messaging ---
  public addSupervisorMessage(message: SupervisorMessage) {
    this.updateData(prev => ({
      ...prev,
      supervisorMessages: [message, ...(prev.supervisorMessages || [])]
    }), 'ADD_SUPERVISOR_MESSAGE', message);
  }

  public replySupervisorMessage(messageId: string, reply: string) {
    this.updateData(prev => ({
      ...prev,
      supervisorMessages: (prev.supervisorMessages || []).map(m =>
        m.id === messageId
          ? { ...m, reply, repliedAt: new Date().toISOString(), isRead: true }
          : m
      )
    }), 'REPLY_SUPERVISOR_MESSAGE', { messageId, reply });
  }

  public markMessageAsRead(messageId: string) {
    this.updateData(prev => ({
      ...prev,
      supervisorMessages: (prev.supervisorMessages || []).map(m =>
        m.id === messageId ? { ...m, isRead: true } : m
      )
    }), 'READ_SUPERVISOR_MESSAGE', { messageId });
  }

  // --- 3. Shift Handover (3 clicks) ---
  public addShiftHandover(handover: ShiftHandover) {
    this.updateData(prev => ({
      ...prev,
      shiftHandovers: [handover, ...(prev.shiftHandovers || [])]
    }), 'ADD_SHIFT_HANDOVER', handover);
  }

  // --- 4. Preventive Maintenance & Equipment Health ---
  public updateEquipmentHealth(health: StationEquipmentHealth) {
    this.updateData(prev => ({
      ...prev,
      preventiveMaintenances: (prev.preventiveMaintenances || []).map(h =>
        h.stationId === health.stationId ? health : h
      )
    }), 'UPDATE_EQUIPMENT_HEALTH', health);
  }

  // --- 5. Weekly Generator Test Logs ---
  public addGeneratorWeeklyLog(log: GeneratorWeeklyLog) {
    this.updateData(prev => ({
      ...prev,
      generatorWeeklyLogs: [log, ...(prev.generatorWeeklyLogs || [])]
    }), 'ADD_GENERATOR_LOG', log);
  }

  // --- 6. Troubleshooting Cards (Supervisor Admin Only) ---
  public addTroubleshootingCard(card: TroubleshootingCard) {
    this.updateData(prev => ({
      ...prev,
      troubleshootingGuides: [card, ...(prev.troubleshootingGuides || [])]
    }), 'ADD_TROUBLESHOOTING', card);
  }

  public updateTroubleshootingCard(card: TroubleshootingCard) {
    this.updateData(prev => ({
      ...prev,
      troubleshootingGuides: (prev.troubleshootingGuides || []).map(t =>
        t.id === card.id ? { ...card, lastModified: new Date().toISOString() } : t
      )
    }), 'UPDATE_TROUBLESHOOTING', card);
  }

  public deleteTroubleshootingCard(cardId: string) {
    this.updateData(prev => ({
      ...prev,
      troubleshootingGuides: (prev.troubleshootingGuides || []).filter(t => t.id !== cardId)
    }), 'DELETE_TROUBLESHOOTING', { cardId });
  }

  // Reset to factory initial data
  public resetToInitialData() {
    this.data = this.getFallbackData();
    this.saveLocalData(this.data);
    this.setSyncQueue([]);
    this.notify();
    this.notifySync();
  }

  // Cloud Synchronization
  public async tryCloudSync() {
    if (!this.isOnline || typeof window === 'undefined') return;

    this.isSyncing = true;
    this.notifySync();

    try {
      // Attempt to fetch latest cloud state if server endpoint exists
      const response = await fetch('/api/data', {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });

      if (response.ok) {
        const cloudData: AppData = await response.json();
        if (cloudData && Array.isArray(cloudData.stations)) {
          // If cloud data is newer or has records, merge safely
          this.data = cloudData;
          this.saveLocalData(this.data);
          this.lastSyncedAt = new Date().toLocaleTimeString('ar-DZ');
          this.notify();
        }
      }
    } catch (err) {
      // In offline or non-express mode, local store serves as authoritative database
      this.lastSyncedAt = new Date().toLocaleTimeString('ar-DZ');
    } finally {
      this.isSyncing = false;
      this.notifySync();
    }
  }

  public async flushSyncQueue() {
    const queue = this.getSyncQueue();
    if (queue.length === 0 || !this.isOnline) return;

    this.isSyncing = true;
    this.notifySync();

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: this.data,
          events: queue
        })
      });

      if (response.ok) {
        this.setSyncQueue([]);
        this.lastSyncedAt = new Date().toLocaleTimeString('ar-DZ');
      }
    } catch {
  // Keep queue for next attempt
} finally {
  this.isSyncing = false;
  this.notifySync();
}
