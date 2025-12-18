import { DEFAULT_SCHEDULES } from "@/data/schedules";

export type ScheduleSession = {
  id: string;
  city: string;
  date: string;
  location: string;
  time: string;
  cost: string;
};

export type ScheduleData = {
  facilitatorId: string;
  sessions: ScheduleSession[];
};

const STORAGE_PREFIX = "schedule_";

export function getScheduleData(facilitatorId: string): ScheduleData {
  const key = `${STORAGE_PREFIX}${facilitatorId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored) as ScheduleData;
    } catch {
      return { facilitatorId, sessions: DEFAULT_SCHEDULES[facilitatorId] || [] };
    }
  }

  // Return default schedule for this facilitator
  return { facilitatorId, sessions: DEFAULT_SCHEDULES[facilitatorId] || [] };
}

export function saveScheduleData(data: ScheduleData): void {
  const key = `${STORAGE_PREFIX}${data.facilitatorId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

export function addSession(facilitatorId: string, session: Omit<ScheduleSession, "id">): ScheduleSession {
  const data = getScheduleData(facilitatorId);
  const newSession: ScheduleSession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  data.sessions.push(newSession);
  saveScheduleData(data);
  return newSession;
}

export function updateSession(facilitatorId: string, sessionId: string, updates: Partial<Omit<ScheduleSession, "id">>): void {
  const data = getScheduleData(facilitatorId);
  const session = data.sessions.find((s) => s.id === sessionId);
  if (session) {
    Object.assign(session, updates);
    saveScheduleData(data);
  }
}

export function deleteSession(facilitatorId: string, sessionId: string): void {
  const data = getScheduleData(facilitatorId);
  data.sessions = data.sessions.filter((s) => s.id !== sessionId);
  saveScheduleData(data);
}
