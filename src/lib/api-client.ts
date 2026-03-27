/**
 * API Client for livestockpro.app
 *
 * Wraps the existing Laravel API so the Next.js frontend can
 * fetch real data from the production backend.
 *
 * Auth flow:
 *   POST /api/login { user_name, password } → JWT token
 *   All subsequent requests use Authorization: Bearer <token>
 *
 * Main data endpoint:
 *   POST /api/sync-push-unrestricted { farm_uuid, cattle:[], medical_batches:[], scanner_sessions:[] }
 *   Returns: farms, records, record_history, medical_batch, paddock, sales_record,
 *            rain_gauge_readings, stock_rotations, supplies, groups, breeds, etc.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://livestockpro.app/api";

/* ─── Token management ──────────────────────────────────── */

let _token: string | null = null;
let _refreshToken: string | null = null;
let _farmUuid: string | null = null;
let _user: ApiUser | null = null;

export interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_name: string;
  phone_number: string;
  profile_img: string | null;
  default_weight: "kg" | "lb";
  date_setting: string;
  default_rain_gauge_unit: string;
}

export interface ApiFarm {
  id: number;
  uuid: string;
  name: string;
  size: number;
  image: string | null;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: ApiUser;
  farm: ApiFarm;
  current_subscription: {
    status: string;
    trial_ends_at: string | null;
  };
}

export function getToken(): string | null {
  if (_token) return _token;
  if (typeof window !== "undefined") {
    _token = localStorage.getItem("lsp-api-token");
    _refreshToken = localStorage.getItem("lsp-api-refresh-token");
    _farmUuid = localStorage.getItem("lsp-api-farm-uuid");
  }
  return _token;
}

export function getFarmUuid(): string | null {
  if (_farmUuid) return _farmUuid;
  if (typeof window !== "undefined") {
    _farmUuid = localStorage.getItem("lsp-api-farm-uuid");
  }
  return _farmUuid;
}

export function getUser(): ApiUser | null {
  if (_user) return _user;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("lsp-api-user");
    if (stored) _user = JSON.parse(stored);
  }
  return _user;
}

function setAuth(token: string, refreshToken: string, farmUuid: string, user: ApiUser) {
  _token = token;
  _refreshToken = refreshToken;
  _farmUuid = farmUuid;
  _user = user;
  if (typeof window !== "undefined") {
    localStorage.setItem("lsp-api-token", token);
    localStorage.setItem("lsp-api-refresh-token", refreshToken);
    localStorage.setItem("lsp-api-farm-uuid", farmUuid);
    localStorage.setItem("lsp-api-user", JSON.stringify(user));
  }
}

export function clearAuth() {
  _token = null;
  _refreshToken = null;
  _farmUuid = null;
  _user = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("lsp-api-token");
    localStorage.removeItem("lsp-api-refresh-token");
    localStorage.removeItem("lsp-api-farm-uuid");
    localStorage.removeItem("lsp-api-user");
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/* ─── Core fetch wrapper ────────────────────────────────── */

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Try token refresh
    if (_refreshToken) {
      const refreshed = await refreshTokenCall();
      if (refreshed) {
        headers.Authorization = _token!;
        const retry = await fetch(`${API_BASE}${path}`, { ...options, headers });
        if (retry.ok) return retry.json();
      }
    }
    clearAuth();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return res.json();
}

async function refreshTokenCall(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/refresh-token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: _token!,
      },
      body: JSON.stringify({ refresh_token: _refreshToken }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.response_data?.token) {
        _token = data.response_data.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("lsp-api-token", _token!);
        }
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

/* ─── Auth endpoints ────────────────────────────────────── */

export async function login(
  userName: string,
  password: string
): Promise<LoginResponse> {
  const res = await apiFetch<{
    response_message: string;
    response_data: LoginResponse;
  }>("/login", {
    method: "POST",
    body: JSON.stringify({ user_name: userName, password }),
  });

  const data = res.response_data;
  setAuth(data.token, data.refresh_token, data.farm.uuid, data.user as ApiUser);
  return data;
}

/* ─── Main data sync endpoint ───────────────────────────── */

export interface SyncData {
  farms: { total: number; rows: ApiFarm[] };
  record: { total: number; rows: ApiRecord[] };
  record_history: { total: number; rows: ApiRecordHistory[] };
  medical_batch: { total: number; rows: ApiMedicalBatch[] };
  medical_batch_products: { total: number; rows: ApiMedicalBatchProduct[] };
  paddock: { total: number; rows: ApiPaddock[] };
  sales_record: { total: number; rows: ApiSalesRecord[] };
  rain_gauge_readings: { total: number; rows: ApiRainGauge[] };
  stock_rotations: { total: number; rows: ApiStockRotation[] };
  supplies: { total: number; rows: ApiSupply[] };
  group: { total: number; rows: ApiGroup[] };
  breeds: { total: number; rows: ApiBreed[] };
  products: { total: number; rows: ApiProduct[] };
  chemical_batches: { total: number; rows: ApiChemicalBatch[] };
  todos: { total: number; rows: ApiTodo[] };
  calender_events: { total: number; rows: ApiCalendarEvent[] };
  marker_data: Record<string, unknown>;
}

export async function syncPull(): Promise<SyncData> {
  const farmUuid = getFarmUuid();
  if (!farmUuid) throw new Error("No farm UUID");

  const res = await apiFetch<{
    response_message: string;
    response_data: SyncData;
  }>("/sync-push-unrestricted", {
    method: "POST",
    body: JSON.stringify({
      farm_uuid: farmUuid,
      cattle: [],
      medical_batches: [],
      scanner_sessions: [],
    }),
  });

  return res.response_data;
}

export async function syncPullMedicalBatches(): Promise<ApiMedicalBatch[]> {
  const farmUuid = getFarmUuid();
  if (!farmUuid) throw new Error("No farm UUID");

  const res = await apiFetch<{
    response_message: string;
    response_data: { medical_batch: { total: number; rows: ApiMedicalBatch[] } };
  }>("/scanner-session/sync-pull-medical-batch", {
    method: "POST",
    body: JSON.stringify({ farm_uuid: farmUuid }),
  });

  return res.response_data.medical_batch.rows;
}

/* ─── Data Types (matching Laravel database schema) ──────── */

export interface ApiRecord {
  uuid: string;
  eid: string;
  visual_tag: string;
  vid2: string;
  weight_kg: number;
  weight_lb: number;
  medical_batch: string | null;
  medical_batch_uuid: string | null;
  is_pregnant: number | null;
  is_dehorn: number | null;
  sex: "M" | "F" | string;
  dosage: string | null;
  condition: string | null;
  notes: string | null;
  date_of_birth: string | null;
  date_of_sale: string | null;
  date_of_death: string | null;
  mother_visual_tag: string | null;
  father_visual_tag: string | null;
  record_date: string;
  adg_kg: string | null;
  adg_lb: string | null;
  breeds_uuid: string | null;
  record_status: number;
  purchase_price: string | null;
  genetic_health: string | null;
  number_of_teeth: string | null;
  teeth_condition: string | null;
  feet_condition: string | null;
  marker: string | null;
  date_of_purchase: string | null;
  pregnant_months: string | null;
  pregnant_date: string | null;
  weaned_date: string | null;
  desex_date: string | null;
  dehorned_date: string | null;
  age: string | null;
  image: string | null;
  farm_uuid: string;
  record_group_id: number;
  scanner_sessions_uuid: string | null;
  custom_fields: string | null;
  medical_notes: string | null;
  new_born: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiRecordHistory {
  uuid: string;
  parent_uuid: string;
  eid: string;
  visual_tag: string;
  vid2: string;
  weight_kg: number;
  weight_lb: number;
  medical_batch: string | null;
  medical_batch_name: string | null;
  medical_batch_uuid: string | null;
  sex: string;
  condition: string | null;
  notes: string | null;
  record_date: string;
  adg_kg: string | null;
  adg_lb: string | null;
  log_type: string;
  weight_changed: number;
  image: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiMedicalBatch {
  id: number;
  uuid: string;
  batch_no: string;
  farm_uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ApiMedicalBatchProduct {
  uuid: string;
  medical_batch_uuid: string;
  product_uuid: string;
  product_name: string;
  dosage: string | null;
  farm_uuid: string;
}

export interface ApiPaddock {
  uuid: string;
  name: string;
  size: string;
  farm_uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ApiSalesRecord {
  uuid: string;
  record_id: number;
  record_uuid: string;
  user_id: number;
  weight_kg: number;
  weight_lb: number;
  date_of_sale: string;
  sale_price_kg: number;
  sale_price_lb: number;
  final_sale_price: string;
  eid: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ApiRainGauge {
  uuid: string;
  farm_uuid: string;
  reading_value_mm: number;
  reading_value_inch: number;
  reading_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ApiStockRotation {
  uuid: string;
  paddock_uuid: string;
  date: string;
  exit_date: string | null;
  group_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ApiSupply {
  uuid: string;
  name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  supplier: string;
  category: string;
  reorder_level: number;
  farm_uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ApiGroup {
  id: number;
  uuid: string;
  name: string;
  farm_uuid: string;
}

export interface ApiBreed {
  uuid: string;
  name: string;
}

export interface ApiProduct {
  uuid: string;
  name: string;
  type: string;
}

export interface ApiChemicalBatch {
  uuid: string;
  name: string;
  farm_uuid: string;
}

export interface ApiTodo {
  uuid: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  farm_uuid: string;
}

export interface ApiCalendarEvent {
  uuid: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  farm_uuid: string;
}

/* ─── Convenience getters ───────────────────────────────── */

let _syncCache: SyncData | null = null;
let _syncCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSyncData(forceRefresh = false): Promise<SyncData> {
  const now = Date.now();
  if (!forceRefresh && _syncCache && now - _syncCacheTime < CACHE_TTL) {
    return _syncCache;
  }
  _syncCache = await syncPull();
  _syncCacheTime = now;
  return _syncCache;
}

export function invalidateCache() {
  _syncCache = null;
  _syncCacheTime = 0;
}

/** Get active (non-deleted) records */
export function filterActive<T extends { deleted_at: string | null }>(
  rows: T[]
): T[] {
  return rows.filter((r) => !r.deleted_at);
}
