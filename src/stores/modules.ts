import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import {
  mockRecords,
  mockMedicalBatches,
  mockPaddocks,
  mockNotifications,
  mockCalendarEvents,
} from "@/lib/mock-data";
import type {
  LivestockRecord,
  MedicalBatch,
  Paddock,
  Notification,
  CalendarEvent,
  TodoItem,
  Supply,
  SaleRecord,
  Farm,
  RainGaugeReading,
} from "@/types";

// ---------------------------------------------------------------------------
// Inline mock data for stores without dedicated mock-data exports
// ---------------------------------------------------------------------------

const mockTodos: TodoItem[] = [
  { id: 1, title: "Check water troughs in North Paddock", description: "Inspect auto-fill pump and clean troughs", priority: "high", completed: false, due_date: "2026-03-25", created_at: "2026-03-20T08:00:00Z" },
  { id: 2, title: "Order supplementary feed", description: "Grain pellets running low - contact Ridley", priority: "high", completed: false, due_date: "2026-03-26", created_at: "2026-03-19T10:00:00Z" },
  { id: 3, title: "Schedule vet visit for AU-0157", description: "Foot rot follow-up check", priority: "medium", completed: false, due_date: "2026-03-28", created_at: "2026-03-18T14:00:00Z" },
  { id: 4, title: "Repair East Boundary fence", description: "Electric fence section near creek damaged", priority: "medium", completed: false, due_date: "2026-04-01", created_at: "2026-03-15T09:00:00Z" },
  { id: 5, title: "Update livestock records for March weigh-in", description: null, priority: "low", completed: true, due_date: "2026-03-15", created_at: "2026-03-10T07:00:00Z" },
  { id: 6, title: "Prepare sale draft for Thompson Group", description: "15 steers, confirm weights and condition", priority: "high", completed: true, due_date: "2026-03-10", created_at: "2026-03-05T11:00:00Z" },
];

const mockSupplies: Supply[] = [
  { id: 1, name: "Grain Pellets (Cattle Finisher)", category: "feed", quantity: 2.5, unit: "tonnes", cost_per_unit: 520, supplier: "Ridley AgriProducts", reorder_level: 5, last_ordered: "2026-02-15", notes: "14% protein" },
  { id: 2, name: "Hay Rounds (Rhodes Grass)", category: "feed", quantity: 18, unit: "bales", cost_per_unit: 120, supplier: "Local Farmer - J. Anderson", reorder_level: 10, last_ordered: "2026-01-20", notes: null },
  { id: 3, name: "Barbed Wire", category: "fencing", quantity: 8, unit: "rolls", cost_per_unit: 89, supplier: "Landmark", reorder_level: 4, last_ordered: "2025-11-10", notes: "High tensile" },
  { id: 4, name: "Star Pickets 180cm", category: "fencing", quantity: 45, unit: "each", cost_per_unit: 8.5, supplier: "Landmark", reorder_level: 20, last_ordered: "2025-11-10", notes: null },
  { id: 5, name: "Ivermectin Plus Drench", category: "medical", quantity: 3, unit: "litres", cost_per_unit: 185, supplier: "Elders", reorder_level: 2, last_ordered: "2026-02-25", notes: "Broad spectrum" },
  { id: 6, name: "Bovilis MH+IBR Vaccine", category: "medical", quantity: 5, unit: "doses (50pk)", cost_per_unit: 210, supplier: "Elders", reorder_level: 3, last_ordered: "2026-02-20", notes: "Refrigerate" },
  { id: 7, name: "Superphosphate Fertilizer", category: "fertilizer", quantity: 1.5, unit: "tonnes", cost_per_unit: 680, supplier: "Incitec Pivot", reorder_level: 2, last_ordered: "2025-09-15", notes: "For improved pastures" },
  { id: 8, name: "Pasture Seed (Ryegrass)", category: "seed", quantity: 25, unit: "kg", cost_per_unit: 12, supplier: "Heritage Seeds", reorder_level: 15, last_ordered: "2025-08-01", notes: "Autumn sowing" },
];

const mockSales: SaleRecord[] = [
  { id: 1, record_visual_tag: "AU-0149", buyer_name: "Thompson Livestock Group", buyer_contact: "0412 345 678", sale_price: 2950, sale_date: "2026-03-18", weight_at_sale: 590, price_per_kg: 5.0, status: "pending", notes: "Feedlot ready steer" },
  { id: 2, record_visual_tag: "AU-0158", buyer_name: "Thompson Livestock Group", buyer_contact: "0412 345 678", sale_price: 2475, sale_date: "2026-03-18", weight_at_sale: 495, price_per_kg: 5.0, status: "pending", notes: "Terminal sire prospect" },
  { id: 3, record_visual_tag: "AU-0156", buyer_name: "Northern Beef Traders", buyer_contact: "0498 765 432", sale_price: 2520, sale_date: "2026-02-28", weight_at_sale: 560, price_per_kg: 4.5, status: "completed", notes: "Brahman cross" },
  { id: 4, record_visual_tag: "AU-0151", buyer_name: "Casino Saleyards", buyer_contact: "02 6662 1234", sale_price: 3550, sale_date: "2026-02-15", weight_at_sale: 710, price_per_kg: 5.0, status: "completed", notes: "Top price at sale" },
];

const mockFarms: Farm[] = [
  { id: 1, name: "Nimbin Station", location: "Nimbin NSW 2480", size_hectares: 215, owner_name: "Brad Anderson", created_at: "2025-01-01T00:00:00Z" },
];

const mockRainReadings: RainGaugeReading[] = [
  { id: 1, date: "2026-01-05", amount_mm: 12.5, notes: "Light rain overnight" },
  { id: 2, date: "2026-01-12", amount_mm: 28.0, notes: "Storm front" },
  { id: 3, date: "2026-01-18", amount_mm: 5.0, notes: null },
  { id: 4, date: "2026-01-25", amount_mm: 35.0, notes: "Heavy rain, creek rising" },
  { id: 5, date: "2026-02-02", amount_mm: 18.5, notes: null },
  { id: 6, date: "2026-02-10", amount_mm: 8.0, notes: "Light showers" },
  { id: 7, date: "2026-02-17", amount_mm: 42.0, notes: "Major storm event" },
  { id: 8, date: "2026-02-24", amount_mm: 15.0, notes: null },
  { id: 9, date: "2026-03-03", amount_mm: 22.0, notes: "Steady rain all day" },
  { id: 10, date: "2026-03-10", amount_mm: 6.5, notes: "Light drizzle" },
  { id: 11, date: "2026-03-17", amount_mm: 31.0, notes: "Thunderstorm" },
  { id: 12, date: "2026-03-22", amount_mm: 9.0, notes: null },
];

// ---------------------------------------------------------------------------
// 1. Records Store
// ---------------------------------------------------------------------------

interface RecordsState {
  records: LivestockRecord[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortField: keyof LivestockRecord;
  sortDirection: "asc" | "desc";
  selectedIds: number[];
  filterBreed: string | null;
  filterSex: string | null;
  filterCondition: string | null;

  fetchRecords: () => Promise<void>;
  setSearch: (query: string) => void;
  setSort: (field: keyof LivestockRecord, direction: "asc" | "desc") => void;
  setFilter: (key: "filterBreed" | "filterSex" | "filterCondition", value: string | null) => void;
  toggleSelect: (id: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  addRecord: (record: Omit<LivestockRecord, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateRecord: (id: number, updates: Partial<LivestockRecord>) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  getFilteredRecords: () => LivestockRecord[];
  getRecordById: (id: number) => LivestockRecord | undefined;
  bulkDelete: (ids: number[]) => Promise<void>;
  exportCSV: () => void;
  setRecords: (records: LivestockRecord[]) => void;
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: mockRecords,
  loading: false,
  error: null,
  searchQuery: "",
  sortField: "visual_tag",
  sortDirection: "asc",
  selectedIds: [],
  filterBreed: null,
  filterSex: null,
  filterCondition: null,

  fetchRecords: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("livestock_records")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data || data.length === 0) {
        // Fall back to mock data
        set({ records: mockRecords, loading: false });
      } else {
        set({ records: data, loading: false });
      }
    } catch {
      // Supabase not configured — use mock data
      set({ records: mockRecords, loading: false });
    }
  },

  setSearch: (query) => set({ searchQuery: query }),

  setSort: (field, direction) => set({ sortField: field, sortDirection: direction }),

  setFilter: (key, value) => set({ [key]: value }),

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    })),

  selectAll: () =>
    set((state) => ({
      selectedIds: state.records.map((r) => r.id),
    })),

  clearSelection: () => set({ selectedIds: [] }),

  addRecord: async (record) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("livestock_records")
        .insert({ ...record, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({ records: [data, ...state.records] }));
      }
    } catch {
      // Fallback: add in-memory with generated id
      const newRecord = {
        ...record,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as LivestockRecord;
      set((state) => ({ records: [newRecord, ...state.records] }));
    }
  },

  updateRecord: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("livestock_records")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? data : r)),
        }));
      }
    } catch {
      // Fallback: update in-memory
      set((state) => ({
        records: state.records.map((r) =>
          r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r,
        ),
      }));
    }
  },

  deleteRecord: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("livestock_records").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
  },

  getFilteredRecords: () => {
    const { records, searchQuery, sortField, sortDirection, filterBreed, filterSex, filterCondition } = get();
    let filtered = [...records];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.visual_tag.toLowerCase().includes(q) ||
          (r.eid && r.eid.toLowerCase().includes(q)) ||
          (r.breed && r.breed.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q)),
      );
    }

    if (filterBreed) {
      filtered = filtered.filter((r) => r.breed === filterBreed);
    }
    if (filterSex) {
      filtered = filtered.filter((r) => r.sex === filterSex);
    }
    if (filterCondition) {
      filtered = filtered.filter((r) => r.condition === filterCondition);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  },

  setRecords: (records) => set({ records }),

  getRecordById: (id) => get().records.find((r) => r.id === id),

  bulkDelete: async (ids) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("livestock_records").delete().in("id", ids);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      records: state.records.filter((r) => !ids.includes(r.id)),
      selectedIds: state.selectedIds.filter((sid) => !ids.includes(sid)),
    }));
  },

  exportCSV: () => {
    const { records } = get();
    const headers = "Visual Tag,EID,Sex,Breed,Weight (kg),Condition,Date of Birth\n";
    const csv =
      headers +
      records
        .map(
          (r) =>
            `${r.visual_tag},${r.eid || ""},${r.sex || ""},${r.breed || ""},${r.weight_kg || ""},${r.condition || ""},${r.date_of_birth || ""}`,
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "livestock-records.csv";
    a.click();
    URL.revokeObjectURL(url);
  },
}));

// ---------------------------------------------------------------------------
// 2. Medical Store
// ---------------------------------------------------------------------------

interface MedicalState {
  batches: MedicalBatch[];
  loading: boolean;
  error: string | null;
  filterStatus: MedicalBatch["status"] | null;
  searchQuery: string;

  fetchBatches: () => Promise<void>;
  setFilterStatus: (status: MedicalBatch["status"] | null) => void;
  setSearch: (query: string) => void;
  addBatch: (batch: Omit<MedicalBatch, "id" | "created_at">) => Promise<void>;
  updateBatch: (id: number, updates: Partial<MedicalBatch>) => Promise<void>;
  deleteBatch: (id: number) => Promise<void>;
  completeBatch: (id: number) => Promise<void>;
  addAnimalToBatch: (batchId: number, visualTag: string) => Promise<void>;
  removeAnimalFromBatch: (batchId: number, visualTag: string) => Promise<void>;
  getFilteredBatches: () => MedicalBatch[];
  getBatchById: (id: number) => MedicalBatch | undefined;
}

export const useMedicalStore = create<MedicalState>((set, get) => ({
  batches: mockMedicalBatches,
  loading: false,
  error: null,
  filterStatus: null,
  searchQuery: "",

  fetchBatches: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("medical_batches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ batches: data || [], loading: false });
    } catch {
      // Fallback to mock data when Supabase is unavailable
      set({ batches: mockMedicalBatches, loading: false });
    }
  },

  setFilterStatus: (status) => set({ filterStatus: status }),

  setSearch: (query) => set({ searchQuery: query }),

  addBatch: async (batch) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("medical_batches")
        .insert({ ...batch, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({ batches: [data, ...state.batches] }));
      }
    } catch {
      const newBatch = { ...batch, id: Date.now(), created_at: new Date().toISOString() } as MedicalBatch;
      set((state) => ({ batches: [newBatch, ...state.batches] }));
    }
  },

  updateBatch: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("medical_batches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          batches: state.batches.map((b) => (b.id === id ? data : b)),
        }));
      }
    } catch {
      set((state) => ({
        batches: state.batches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      }));
    }
  },

  deleteBatch: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("medical_batches").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      batches: state.batches.filter((b) => b.id !== id),
    }));
  },

  completeBatch: async (id) => {
    const completed_date = new Date().toISOString().split("T")[0];
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("medical_batches")
        .update({ status: "completed", completed_date })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          batches: state.batches.map((b) => (b.id === id ? data : b)),
        }));
        return;
      }
    } catch {
      // Fallback: update in-memory
    }
    set((state) => ({
      batches: state.batches.map((b) =>
        b.id === id ? { ...b, status: "completed" as const, completed_date } : b,
      ),
    }));
  },

  addAnimalToBatch: async (batchId, visualTag) => {
    const { batches } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch || batch.animals.includes(visualTag)) return;
    const updatedAnimals = [...batch.animals, visualTag];
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("medical_batches")
        .update({ animals: updatedAnimals, animal_count: batch.animal_count + 1 })
        .eq("id", batchId)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          batches: state.batches.map((b) => (b.id === batchId ? data : b)),
        }));
        return;
      }
    } catch {
      // Fallback: update in-memory
    }
    set((state) => ({
      batches: state.batches.map((b) =>
        b.id === batchId ? { ...b, animals: updatedAnimals, animal_count: b.animal_count + 1 } : b,
      ),
    }));
  },

  removeAnimalFromBatch: async (batchId, visualTag) => {
    const { batches } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;
    const updatedAnimals = batch.animals.filter((a) => a !== visualTag);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("medical_batches")
        .update({ animals: updatedAnimals, animal_count: Math.max(0, batch.animal_count - 1) })
        .eq("id", batchId)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          batches: state.batches.map((b) => (b.id === batchId ? data : b)),
        }));
        return;
      }
    } catch {
      // Fallback: update in-memory
    }
    set((state) => ({
      batches: state.batches.map((b) =>
        b.id === batchId
          ? { ...b, animals: updatedAnimals, animal_count: Math.max(0, b.animal_count - 1) }
          : b,
      ),
    }));
  },

  getFilteredBatches: () => {
    const { batches, filterStatus, searchQuery } = get();
    let filtered = [...batches];

    if (filterStatus) {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.batch_name.toLowerCase().includes(q) ||
          b.medication.toLowerCase().includes(q) ||
          b.treatment_type.toLowerCase().includes(q) ||
          b.administered_by.toLowerCase().includes(q),
      );
    }

    return filtered;
  },

  getBatchById: (id) => get().batches.find((b) => b.id === id),
}));

// ---------------------------------------------------------------------------
// 3. Paddock Store
// ---------------------------------------------------------------------------

interface PaddockState {
  paddocks: Paddock[];
  loading: boolean;
  error: string | null;
  selectedPaddock: number | null;

  fetchPaddocks: () => Promise<void>;
  addPaddock: (paddock: Omit<Paddock, "id" | "created_at">) => Promise<void>;
  updatePaddock: (id: number, updates: Partial<Paddock>) => Promise<void>;
  deletePaddock: (id: number) => Promise<void>;
  moveAnimal: (fromPaddockId: number, toPaddockId: number, count?: number) => Promise<void>;
  selectPaddock: (id: number | null) => void;
  getPaddockById: (id: number) => Paddock | undefined;
}

export const usePaddockStore = create<PaddockState>((set, get) => ({
  paddocks: mockPaddocks,
  loading: false,
  error: null,
  selectedPaddock: null,

  fetchPaddocks: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("paddocks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ paddocks: data || [], loading: false });
    } catch {
      // Fallback to mock data when Supabase is unavailable
      set({ paddocks: mockPaddocks, loading: false });
    }
  },

  addPaddock: async (paddock) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("paddocks")
        .insert({ ...paddock, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({ paddocks: [data, ...state.paddocks] }));
      }
    } catch {
      const newPaddock = { ...paddock, id: Date.now(), created_at: new Date().toISOString() } as Paddock;
      set((state) => ({ paddocks: [newPaddock, ...state.paddocks] }));
    }
  },

  updatePaddock: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("paddocks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          paddocks: state.paddocks.map((p) => (p.id === id ? data : p)),
        }));
      }
    } catch {
      set((state) => ({
        paddocks: state.paddocks.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
    }
  },

  deletePaddock: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("paddocks").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      paddocks: state.paddocks.filter((p) => p.id !== id),
      selectedPaddock: state.selectedPaddock === id ? null : state.selectedPaddock,
    }));
  },

  moveAnimal: async (fromPaddockId, toPaddockId, count = 1) => {
    const { paddocks } = get();
    const fromPaddock = paddocks.find((p) => p.id === fromPaddockId);
    const toPaddock = paddocks.find((p) => p.id === toPaddockId);
    if (!fromPaddock || !toPaddock) return;

    const newFromCount = Math.max(0, fromPaddock.current_count - count);
    const newToCount = toPaddock.current_count + count;

    try {
      const supabase = createClient();
      const [fromResult, toResult] = await Promise.all([
        supabase.from("paddocks").update({ current_count: newFromCount }).eq("id", fromPaddockId).select().single(),
        supabase.from("paddocks").update({ current_count: newToCount }).eq("id", toPaddockId).select().single(),
      ]);

      if (fromResult.error) throw fromResult.error;
      if (toResult.error) throw toResult.error;

      set((state) => ({
        paddocks: state.paddocks.map((p) => {
          if (p.id === fromPaddockId && fromResult.data) return fromResult.data;
          if (p.id === toPaddockId && toResult.data) return toResult.data;
          return p;
        }),
      }));
      return;
    } catch {
      // Fallback: update in-memory
    }
    set((state) => ({
      paddocks: state.paddocks.map((p) => {
        if (p.id === fromPaddockId) return { ...p, current_count: newFromCount };
        if (p.id === toPaddockId) return { ...p, current_count: newToCount };
        return p;
      }),
    }));
  },

  selectPaddock: (id) => set({ selectedPaddock: id }),

  getPaddockById: (id) => get().paddocks.find((p) => p.id === id),
}));

// ---------------------------------------------------------------------------
// 4. Calendar Store
// ---------------------------------------------------------------------------

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  selectedDate: string | null;
  viewMonth: number;
  viewYear: number;

  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, "id">) => Promise<void>;
  updateEvent: (id: number, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
  setMonth: (month: number, year: number) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
  getEventsForMonth: (month: number, year: number) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: mockCalendarEvents,
  loading: false,
  error: null,
  selectedDate: null,
  viewMonth: new Date().getMonth(),
  viewYear: new Date().getFullYear(),

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      set({ events: data || [], loading: false });
    } catch {
      // Fallback to mock data when Supabase is unavailable
      set({ events: mockCalendarEvents, loading: false });
    }
  },

  addEvent: async (event) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("calendar_events")
        .insert({ ...event, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({ events: [...state.events, data] }));
      }
    } catch {
      const newEvent = { ...event, id: Date.now() } as CalendarEvent;
      set((state) => ({ events: [...state.events, newEvent] }));
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("calendar_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? data : e)),
        }));
      }
    } catch {
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      }));
    }
  },

  deleteEvent: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    }));
  },

  toggleComplete: async (id) => {
    const { events } = get();
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const newCompleted = !event.completed;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("calendar_events")
        .update({ completed: newCompleted })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? data : e)),
        }));
        return;
      }
    } catch {
      // Fallback: update in-memory
    }
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, completed: newCompleted } : e)),
    }));
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  setMonth: (month, year) => set({ viewMonth: month, viewYear: year }),

  getEventsForDate: (date) => get().events.filter((e) => e.date === date),

  getEventsForMonth: (month, year) =>
    get().events.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }),
}));

// ---------------------------------------------------------------------------
// 5. Notification Store
// ---------------------------------------------------------------------------

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  filterType: Notification["type"] | null;

  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "created_at">) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  setFilterType: (type: Notification["type"] | null) => void;
  getUnreadCount: () => number;
  getFilteredNotifications: () => Notification[];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifications,
  loading: false,
  error: null,
  filterType: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ notifications: data || [], loading: false });
    } catch {
      // Fallback to mock data when Supabase is unavailable
      set({ notifications: mockNotifications, loading: false });
    }
  },

  addNotification: async (notification) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("notifications")
        .insert({ ...notification, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({ notifications: [data, ...state.notifications] }));
      }
    } catch {
      const newNotification = { ...notification, id: Date.now(), created_at: new Date().toISOString() } as Notification;
      set((state) => ({ notifications: [newNotification, ...state.notifications] }));
    }
  },

  markAsRead: async (id) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? data : n)),
        }));
        return;
      }
    } catch {
      // Fallback: update in-memory
    }
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  markAllRead: async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);
      if (error) throw error;
    } catch {
      // Fallback: update in-memory
    }
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  deleteNotification: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  setFilterType: (type) => set({ filterType: type }),

  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

  getFilteredNotifications: () => {
    const { notifications, filterType } = get();
    if (!filterType) return notifications;
    return notifications.filter((n) => n.type === filterType);
  },
}));

// ---------------------------------------------------------------------------
// 6. Todo Store
// ---------------------------------------------------------------------------

interface TodoState {
  todos: TodoItem[];
  loading: boolean;
  error: string | null;

  fetchTodos: () => Promise<void>;
  addTodo: (todo: Omit<TodoItem, "id" | "created_at">) => Promise<void>;
  updateTodo: (id: number, updates: Partial<TodoItem>) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
  getFilteredTodos: (filter?: { priority?: TodoItem["priority"]; completed?: boolean }) => TodoItem[];
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: mockTodos,
  loading: false,
  error: null,

  fetchTodos: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("todo_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ todos: data || [], loading: false });
    } catch {
      // Fallback to mock data when Supabase is unavailable
      set({ todos: mockTodos, loading: false });
    }
  },

  addTodo: async (todo) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("todo_items")
        .insert({ ...todo, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({ todos: [data, ...state.todos] }));
      }
    } catch {
      const newTodo = { ...todo, id: Date.now(), created_at: new Date().toISOString() } as TodoItem;
      set((state) => ({ todos: [newTodo, ...state.todos] }));
    }
  },

  updateTodo: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("todo_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? data : t)),
        }));
      }
    } catch {
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    }
  },

  deleteTodo: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("todo_items").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }));
  },

  toggleComplete: async (id) => {
    const { todos } = get();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("todo_items")
        .update({ completed: newCompleted })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? data : t)),
        }));
        return;
      }
    } catch {
      // Fallback: update in-memory
    }
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)),
    }));
  },

  getFilteredTodos: (filter) => {
    const { todos } = get();
    let filtered = [...todos];

    if (filter?.priority) {
      filtered = filtered.filter((t) => t.priority === filter.priority);
    }
    if (filter?.completed !== undefined) {
      filtered = filtered.filter((t) => t.completed === filter.completed);
    }

    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return filtered;
  },
}));

// ---------------------------------------------------------------------------
// 7. Supplies Store
// ---------------------------------------------------------------------------

interface SuppliesState {
  supplies: Supply[];
  loading: boolean;
  error: string | null;
  filterCategory: Supply["category"] | null;

  fetchSupplies: () => Promise<void>;
  addSupply: (supply: Omit<Supply, "id">) => Promise<void>;
  updateSupply: (id: number, updates: Partial<Supply>) => Promise<void>;
  deleteSupply: (id: number) => Promise<void>;
  setFilterCategory: (category: Supply["category"] | null) => void;
  getFilteredSupplies: () => Supply[];
  getLowStockItems: () => Supply[];
}

export const useSuppliesStore = create<SuppliesState>((set, get) => ({
  supplies: mockSupplies,
  loading: false,
  error: null,
  filterCategory: null,

  fetchSupplies: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("supplies")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      set({ supplies: data || [], loading: false });
    } catch {
      // Fallback to mock data when Supabase is unavailable
      set({ supplies: mockSupplies, loading: false });
    }
  },

  addSupply: async (supply) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("supplies")
        .insert({ ...supply, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({ supplies: [data, ...state.supplies] }));
      }
    } catch {
      const newSupply = { ...supply, id: Date.now() } as Supply;
      set((state) => ({ supplies: [newSupply, ...state.supplies] }));
    }
  },

  updateSupply: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("supplies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          supplies: state.supplies.map((s) => (s.id === id ? data : s)),
        }));
      }
    } catch {
      set((state) => ({
        supplies: state.supplies.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
    }
  },

  deleteSupply: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("supplies").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      supplies: state.supplies.filter((s) => s.id !== id),
    }));
  },

  setFilterCategory: (category) => set({ filterCategory: category }),

  getFilteredSupplies: () => {
    const { supplies, filterCategory } = get();
    if (!filterCategory) return supplies;
    return supplies.filter((s) => s.category === filterCategory);
  },

  getLowStockItems: () => get().supplies.filter((s) => s.quantity <= s.reorder_level),
}));

// ---------------------------------------------------------------------------
// 8. Sales Store
// ---------------------------------------------------------------------------

interface SalesState {
  sales: SaleRecord[];
  loading: boolean;
  error: string | null;
  filterStatus: SaleRecord["status"] | null;

  fetchSales: () => Promise<void>;
  addSale: (sale: Omit<SaleRecord, "id">) => Promise<void>;
  updateSale: (id: number, updates: Partial<SaleRecord>) => Promise<void>;
  deleteSale: (id: number) => Promise<void>;
  markAsCompleted: (id: number) => Promise<void>;
  getFilteredSales: () => SaleRecord[];
  getTotalRevenue: () => number;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: mockSales,
  loading: false,
  error: null,
  filterStatus: null,

  fetchSales: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sale_records")
        .select("*")
        .order("sale_date", { ascending: false });
      if (error) throw error;
      set({ sales: data || [], loading: false });
    } catch {
      // Fallback to mock data when Supabase is unavailable
      set({ sales: mockSales, loading: false });
    }
  },

  addSale: async (sale) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("sale_records")
        .insert({ ...sale, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({ sales: [data, ...state.sales] }));
      }
    } catch {
      const newSale = { ...sale, id: Date.now() } as SaleRecord;
      set((state) => ({ sales: [newSale, ...state.sales] }));
    }
  },

  updateSale: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sale_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          sales: state.sales.map((s) => (s.id === id ? data : s)),
        }));
      }
    } catch {
      set((state) => ({
        sales: state.sales.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
    }
  },

  deleteSale: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("sale_records").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      sales: state.sales.filter((s) => s.id !== id),
    }));
  },

  markAsCompleted: async (id) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sale_records")
        .update({ status: "completed" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          sales: state.sales.map((s) => (s.id === id ? data : s)),
        }));
        return;
      }
    } catch {
      // Fallback: update in-memory
    }
    set((state) => ({
      sales: state.sales.map((s) =>
        s.id === id ? { ...s, status: "completed" as const } : s,
      ),
    }));
  },

  getFilteredSales: () => {
    const { sales, filterStatus } = get();
    if (!filterStatus) return sales;
    return sales.filter((s) => s.status === filterStatus);
  },

  getTotalRevenue: () =>
    get()
      .sales.filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.sale_price, 0),
}));

// ---------------------------------------------------------------------------
// 9. Farm Store
// ---------------------------------------------------------------------------

interface FarmState {
  farms: Farm[];
  loading: boolean;
  error: string | null;
  currentFarmId: number | null;

  fetchFarms: () => Promise<void>;
  addFarm: (farm: Omit<Farm, "id" | "created_at">) => Promise<void>;
  updateFarm: (id: number, updates: Partial<Farm>) => Promise<void>;
  switchFarm: (id: number) => void;
  getCurrentFarm: () => Farm | undefined;
}

export const useFarmStore = create<FarmState>((set, get) => ({
  farms: mockFarms,
  loading: false,
  error: null,
  currentFarmId: 1,

  fetchFarms: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("farms")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const farms = data || [];
      set({
        farms,
        loading: false,
        currentFarmId: get().currentFarmId ?? (farms.length > 0 ? farms[0].id : null),
      });
    } catch {
      // Fallback to mock data when Supabase is unavailable
      set({
        farms: mockFarms,
        loading: false,
        currentFarmId: get().currentFarmId ?? mockFarms[0]?.id ?? null,
      });
    }
  },

  addFarm: async (farm) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("farms")
        .insert({ ...farm, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          farms: [...state.farms, data],
          currentFarmId: state.currentFarmId ?? data.id,
        }));
      }
    } catch {
      const newFarm = { ...farm, id: Date.now(), created_at: new Date().toISOString() } as Farm;
      set((state) => ({
        farms: [...state.farms, newFarm],
        currentFarmId: state.currentFarmId ?? newFarm.id,
      }));
    }
  },

  updateFarm: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("farms")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          farms: state.farms.map((f) => (f.id === id ? data : f)),
        }));
      }
    } catch {
      set((state) => ({
        farms: state.farms.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      }));
    }
  },

  switchFarm: (id) => set({ currentFarmId: id }),

  getCurrentFarm: () => {
    const { farms, currentFarmId } = get();
    return farms.find((f) => f.id === currentFarmId);
  },
}));

// ---------------------------------------------------------------------------
// 10. Rain Gauge Store
// ---------------------------------------------------------------------------

interface RainGaugeState {
  readings: RainGaugeReading[];
  loading: boolean;
  error: string | null;

  fetchReadings: () => Promise<void>;
  addReading: (reading: Omit<RainGaugeReading, "id">) => Promise<void>;
  updateReading: (id: number, updates: Partial<RainGaugeReading>) => Promise<void>;
  deleteReading: (id: number) => Promise<void>;
  getReadingsByMonth: (month: number, year: number) => RainGaugeReading[];
  getMonthlyTotals: () => { month: string; year: number; total_mm: number }[];
}

export const useRainGaugeStore = create<RainGaugeState>((set, get) => ({
  readings: mockRainReadings,
  loading: false,
  error: null,

  fetchReadings: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rain_gauge_readings")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      set({ readings: data || [], loading: false });
    } catch {
      // Fallback to mock data when Supabase is unavailable
      set({ readings: mockRainReadings, loading: false });
    }
  },

  addReading: async (reading) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("rain_gauge_readings")
        .insert({ ...reading, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          readings: [...state.readings, data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          ),
        }));
      }
    } catch {
      const newReading = { ...reading, id: Date.now() } as RainGaugeReading;
      set((state) => ({
        readings: [...state.readings, newReading].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      }));
    }
  },

  updateReading: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rain_gauge_readings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set((state) => ({
          readings: state.readings.map((r) => (r.id === id ? data : r)),
        }));
      }
    } catch {
      set((state) => ({
        readings: state.readings.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      }));
    }
  },

  deleteReading: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("rain_gauge_readings").delete().eq("id", id);
      if (error) throw error;
    } catch {
      // Fallback: just remove from state
    }
    set((state) => ({
      readings: state.readings.filter((r) => r.id !== id),
    }));
  },

  getReadingsByMonth: (month, year) =>
    get().readings.filter((r) => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }),

  getMonthlyTotals: () => {
    const { readings } = get();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const totals = new Map<string, { month: string; year: number; total_mm: number }>();

    for (const r of readings) {
      const d = new Date(r.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      const key = `${y}-${m}`;

      if (!totals.has(key)) {
        totals.set(key, { month: monthNames[m], year: y, total_mm: 0 });
      }
      const entry = totals.get(key)!;
      entry.total_mm += r.amount_mm;
    }

    return Array.from(totals.values()).sort((a, b) => {
      const monthOrder = monthNames.indexOf(a.month) + a.year * 12;
      const monthOrderB = monthNames.indexOf(b.month) + b.year * 12;
      return monthOrder - monthOrderB;
    });
  },
}));
