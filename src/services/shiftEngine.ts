import { Worker, ShiftType, ShiftStatusInfo, Station } from '../types';

// Anchor reference date for the 4-day cycle rotation (normalized to UTC midnight)
const BASE_ANCHOR_DATE = new Date('2026-10-01T00:00:00.000Z');

/**
 * Calculates which day in the 4-day cycle a worker is on for a given date.
 * Cycle length: 4 days (0: Day shift, 1: Night shift, 2: Rest day 1, 3: Rest day 2)
 */
export function getWorkerCycleDay(worker: Worker, targetDate: Date = new Date()): number {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const anchor = new Date(BASE_ANCHOR_DATE);
  anchor.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - anchor.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Add the worker's cycle offset (0, 1, 2, or 3)
  const cycleDay = ((diffDays + (worker.cycleOffset || 0)) % 4 + 4) % 4;
  return cycleDay;
}

/**
 * Returns full status details of a worker for a specific date and current time
 */
export function getWorkerShiftStatus(worker: Worker, targetDate: Date = new Date()): ShiftStatusInfo {
  const cycleDay = getWorkerCycleDay(worker, targetDate);

  switch (cycleDay) {
    case 0:
      return {
        type: 'نهارية',
        label: 'مناوبة نهارية',
        hours: '08:00 صباحاً - 16:30 مساءً',
        isWorking: true,
        canSubstituteNight: false,
        canSubstituteDay: false
      };
    case 1:
      return {
        type: 'ليلية',
        label: 'مناوبة ليلية',
        hours: '16:30 مساءً - 08:00 صباحاً اليوم الموالي',
        isWorking: true,
        canSubstituteNight: false,
        canSubstituteDay: false
      };
    case 2:
      return {
        type: 'راحة_1',
        label: 'راحة (اليوم الأول)',
        hours: 'فترة راحة 48 ساعة (اليوم 1)',
        isWorking: false,
        canSubstituteNight: true, // يمكنه استلام مناوبة الليل بعد أخذ قسط من الراحة
        canSubstituteDay: false
      };
    case 3:
    default:
      return {
        type: 'راحة_2',
        label: 'راحة (اليوم الثاني)',
        hours: 'فترة راحة 48 ساعة (اليوم 2 - راحة تامة)',
        isWorking: false,
        canSubstituteNight: true,
        canSubstituteDay: true // يومه الثاني للراحة - جاهزية تامة لأي تعويض
      };
  }
}

/**
 * Checks if a worker is actively on shift right now based on local hours
 */
export function isWorkerCurrentlyOnDuty(worker: Worker, now: Date = new Date()): boolean {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeVal = hours + minutes / 60;

  // Day shift: 08:00 to 16:30
  const isDayShiftHours = timeVal >= 8.0 && timeVal < 16.5;

  if (isDayShiftHours) {
    const cycleDay = getWorkerCycleDay(worker, now);
    return cycleDay === 0;
  }

  // Night shift: 16:30 to 08:00 next morning
  if (timeVal >= 16.5) {
    // Evening portion of night shift: workers on cycleDay 1 today
    const cycleDay = getWorkerCycleDay(worker, now);
    return cycleDay === 1;
  } else {
    // Early morning portion (00:00 - 08:00): workers who started yesterday evening
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const cycleDayYesterday = getWorkerCycleDay(worker, yesterday);
    return cycleDayYesterday === 1;
  }
}

export interface ReplacementCandidate {
  worker: Worker;
  score: number;
  shiftStatus: ShiftStatusInfo;
  proximityScore: number;
  reasons: string[];
  sameStation: boolean;
  sameResidence: boolean;
  recommendationLevel: 'مثالي' | 'مناسب جداً' | 'متاح بعد الراحة' | 'احتياطي';
}

/**
 * Smart Compensation Matcher
 * Finds and ranks candidates to replace an absent worker based on:
 * - Rest period: Day 2 rest (highest score), Day 1 rest (for night shifts after rest)
 * - Proximity of residence (أقرب عامل بالسكن)
 * - Assigned station (نفس المحطة)
 */
export function findSmartReplacements(
  targetWorker: Worker,
  allWorkers: Worker[],
  targetDate: Date = new Date(),
  shiftTypeNeeded: 'نهارية' | 'ليلية' = 'نهارية',
  stations: Station[] = []
): ReplacementCandidate[] {
  const candidates: ReplacementCandidate[] = [];

  const targetStation = stations.find(s => s.id === targetWorker.stationId);

  for (const worker of allWorkers) {
    if (worker.id === targetWorker.id || !worker.isActive) {
      continue;
    }

    const shiftStatus = getWorkerShiftStatus(worker, targetDate);

    // If candidate is already scheduled to work the requested shift, they cannot replace
    if (shiftStatus.type === shiftTypeNeeded) {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];
    let sameStation = false;
    let sameResidence = false;

    // 1. Rest status scoring (Crucial per prompt requirements)
    if (shiftStatus.type === 'راحة_2') {
      score += 55;
      reasons.push('في يوم الراحة الثاني (راحة 48 ساعة مكتملة - أولوية قصوى وجاهزية تامة)');
    } else if (shiftStatus.type === 'راحة_1') {
      if (shiftTypeNeeded === 'ليلية') {
        score += 45;
        reasons.push('في يوم الراحة الأول (مؤهل لاستلام مناوبة الليل بعد أخذ قسط من الراحة النهارية)');
      } else {
        score += 20;
        reasons.push('في يوم الراحة الأول (أنهى مناوبة الليل صباحاً، يحتاج قسطاً من الراحة)');
      }
    } else if (shiftStatus.type === 'نهارية' && shiftTypeNeeded === 'ليلية') {
      // Worked morning, potentially available for emergency night if double shift approved
      score += 10;
      reasons.push('يعمل مناوبة نهارية اليوم (تتابع استثنائي عند الضرورة القصوى)');
    }

    // 2. Proximity of residence (أقرب عامل بالسكن)
    if (worker.residence && targetWorker.residence) {
      const wRes = worker.residence.trim().toLowerCase();
      const tRes = targetWorker.residence.trim().toLowerCase();
      if (wRes === tRes) {
        score += 35;
        sameResidence = true;
        reasons.push(`يسكن في نفس المنطقة (${worker.residence}) - سرعة وصول وسهولة انتقال`);
      } else if (
        (wRes.includes('جيجل') && tRes.includes('جيجل')) ||
        (wRes.includes('بوالنار') && tRes.includes('عرايش')) ||
        (wRes.includes('العوانة') && tRes.includes('بليدة'))
      ) {
        score += 20;
        reasons.push(`يسكن في منطقة مجاورة (${worker.residence})`);
      }
    }

    // 3. Station familiarity (أقرب محطة أو نفس المحطة)
    if (worker.stationId === targetWorker.stationId) {
      score += 25;
      sameStation = true;
      reasons.push(`يعمل في نفس المحطة (${targetStation?.name || 'نفس المحطة'}) - دراية بالمضخات والصمامات`);
    } else {
      const candidateStation = stations.find(s => s.id === worker.stationId);
      if (candidateStation && targetStation && targetStation.latitude && candidateStation.latitude) {
        // Calculate rough distance
        const latDiff = Math.abs(targetStation.latitude - candidateStation.latitude);
        const lngDiff = Math.abs((targetStation.longitude || 0) - (candidateStation.longitude || 0));
        const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        if (dist < 0.03) { // Very close nearby station
          score += 15;
          reasons.push(`محطته الحالية قريبة جغرافياً (${candidateStation.name})`);
        }
      }
    }

    let recommendationLevel: ReplacementCandidate['recommendationLevel'] = 'احتياطي';
    if (score >= 80) recommendationLevel = 'مثالي';
    else if (score >= 60) recommendationLevel = 'مناسب جداً';
    else if (score >= 40) recommendationLevel = 'متاح بعد الراحة';

    candidates.push({
      worker,
      score,
      shiftStatus,
      proximityScore: (sameResidence ? 35 : 10) + (sameStation ? 25 : 0),
      reasons,
      sameStation,
      sameResidence,
      recommendationLevel
    });
  }

  // Sort descending by score
  return candidates.sort((a, b) => b.score - a.score);
}
