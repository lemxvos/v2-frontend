// ─────────────────────────────────────────────────────────────────────────────

export type EntityType = "PERSON" | "HABIT" | "PROJECT" | "GOAL" | "DREAM" | "EVENT" | "CUSTOM";
export type PlanType = "FREE" | "PRO" | "VISION";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "INCOMPLETE";
export type TrackingFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface TrackingConfig {
  enabled: boolean;
  frequency?: TrackingFrequency;
  goal?: number;
  unit?: string;
  type?: "BOOLEAN" | "INTEGER" | "DECIMAL";
}

export interface Entity {
  id: string;
  userId: string;
  type: EntityType;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  tracking?: TrackingConfig;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

// NoteIndex — list view (no content)
export interface NoteIndex {
  id: string;
  userId: string;
  folderId?: string;
  title: string;
  preview?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

// NoteResponse — full note with content
export interface NoteResponse {
  id: string;
  userId: string;
  folderId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId?: string;
  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  userId: string;
  entityId: string;
  date: string;        // LocalDate yyyy-MM-dd
  value?: number;
  decimalValue?: number;
  note?: string;
  createdAt: string;
}

export interface TrackingStats {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  avgValue: number;
  firstTracked?: string;
  lastTracked?: string;
}

export interface TopEntity {
  type: string;
  id: string;
  name: string;
  mentions: number;
}

export interface DashboardMetrics {
  uniquePeople: number;
  uniqueProjects: number;
  uniqueHabits: number;
  totalMentions: number;
  topPeople: TopEntity[];
  topProjects: TopEntity[];
  topHabits: TopEntity[];
}

export interface MentionEntry {
  noteId: string;
  noteTitle: string;
  date: string;   // LocalDate yyyy-MM-dd
  context: string;
}

export interface EntityTimeline {
  entityId: string;
  entityType: string;
  entityName: string;
  totalMentions: number;
  heatmap: Record<string, number>; // date → count
  mentions: MentionEntry[];
}

export interface SubscriptionDTO {
  id: string;
  userId: string;
  effectivePlan: PlanType;
  status: SubscriptionStatus;
  maxEntities: number;
  maxNotes: number;
  maxHabits: number;
  advancedMetrics: boolean;
  dataExport: boolean;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  inGracePeriod: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  plan: PlanType;
  entityCount: number;
  noteCount: number;
  habitCount: number;
  vaultId: string;
  subscriptionStatus?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  maxEntities?: number;
  maxNotes?: number;
  maxHabits?: number;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  plan: PlanType;
}

// ─────────────────────────────────────────────────────────────────────────────
