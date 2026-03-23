import { create } from "zustand";
import { createClient } from "@/lib/supabase";
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
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: [],
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
    const supabase = createClient();
    const { data, error } = await supabase
      .from("livestock_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ records: data || [], loading: false });
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
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("livestock_records")
      .insert({ ...record, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({ records: [data, ...state.records] }));
    }
  },

  updateRecord: async (id, updates) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("livestock_records")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        records: state.records.map((r) => (r.id === id ? data : r)),
      }));
    }
  },

  deleteRecord: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("livestock_records").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        records: state.records.filter((r) => r.id !== id),
        selectedIds: state.selectedIds.filter((sid) => sid !== id),
      }));
    }
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

  getRecordById: (id) => get().records.find((r) => r.id === id),

  bulkDelete: async (ids) => {
    const supabase = createClient();
    const { error } = await supabase.from("livestock_records").delete().in("id", ids);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        records: state.records.filter((r) => !ids.includes(r.id)),
        selectedIds: state.selectedIds.filter((sid) => !ids.includes(sid)),
      }));
    }
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
  batches: [],
  loading: false,
  error: null,
  filterStatus: null,
  searchQuery: "",

  fetchBatches: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("medical_batches")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ batches: data || [], loading: false });
    }
  },

  setFilterStatus: (status) => set({ filterStatus: status }),

  setSearch: (query) => set({ searchQuery: query }),

  addBatch: async (batch) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("medical_batches")
      .insert({ ...batch, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({ batches: [data, ...state.batches] }));
    }
  },

  updateBatch: async (id, updates) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("medical_batches")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        batches: state.batches.map((b) => (b.id === id ? data : b)),
      }));
    }
  },

  deleteBatch: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("medical_batches").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        batches: state.batches.filter((b) => b.id !== id),
      }));
    }
  },

  completeBatch: async (id) => {
    const completed_date = new Date().toISOString().split("T")[0];
    const supabase = createClient();
    const { data, error } = await supabase
      .from("medical_batches")
      .update({ status: "completed", completed_date })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        batches: state.batches.map((b) => (b.id === id ? data : b)),
      }));
    }
  },

  addAnimalToBatch: async (batchId, visualTag) => {
    const { batches } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch || batch.animals.includes(visualTag)) return;
    const updatedAnimals = [...batch.animals, visualTag];
    const supabase = createClient();
    const { data, error } = await supabase
      .from("medical_batches")
      .update({ animals: updatedAnimals, animal_count: batch.animal_count + 1 })
      .eq("id", batchId)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        batches: state.batches.map((b) => (b.id === batchId ? data : b)),
      }));
    }
  },

  removeAnimalFromBatch: async (batchId, visualTag) => {
    const { batches } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;
    const updatedAnimals = batch.animals.filter((a) => a !== visualTag);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("medical_batches")
      .update({ animals: updatedAnimals, animal_count: Math.max(0, batch.animal_count - 1) })
      .eq("id", batchId)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        batches: state.batches.map((b) => (b.id === batchId ? data : b)),
      }));
    }
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
  paddocks: [],
  loading: false,
  error: null,
  selectedPaddock: null,

  fetchPaddocks: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("paddocks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ paddocks: data || [], loading: false });
    }
  },

  addPaddock: async (paddock) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("paddocks")
      .insert({ ...paddock, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({ paddocks: [data, ...state.paddocks] }));
    }
  },

  updatePaddock: async (id, updates) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("paddocks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        paddocks: state.paddocks.map((p) => (p.id === id ? data : p)),
      }));
    }
  },

  deletePaddock: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("paddocks").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        paddocks: state.paddocks.filter((p) => p.id !== id),
        selectedPaddock: state.selectedPaddock === id ? null : state.selectedPaddock,
      }));
    }
  },

  moveAnimal: async (fromPaddockId, toPaddockId, count = 1) => {
    const { paddocks } = get();
    const fromPaddock = paddocks.find((p) => p.id === fromPaddockId);
    const toPaddock = paddocks.find((p) => p.id === toPaddockId);
    if (!fromPaddock || !toPaddock) return;

    const supabase = createClient();
    const newFromCount = Math.max(0, fromPaddock.current_count - count);
    const newToCount = toPaddock.current_count + count;

    const [fromResult, toResult] = await Promise.all([
      supabase.from("paddocks").update({ current_count: newFromCount }).eq("id", fromPaddockId).select().single(),
      supabase.from("paddocks").update({ current_count: newToCount }).eq("id", toPaddockId).select().single(),
    ]);

    if (fromResult.error) {
      set({ error: fromResult.error.message });
      return;
    }
    if (toResult.error) {
      set({ error: toResult.error.message });
      return;
    }

    set((state) => ({
      paddocks: state.paddocks.map((p) => {
        if (p.id === fromPaddockId && fromResult.data) return fromResult.data;
        if (p.id === toPaddockId && toResult.data) return toResult.data;
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
  events: [],
  loading: false,
  error: null,
  selectedDate: null,
  viewMonth: new Date().getMonth(),
  viewYear: new Date().getFullYear(),

  fetchEvents: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("date", { ascending: true });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ events: data || [], loading: false });
    }
  },

  addEvent: async (event) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({ ...event, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({ events: [...state.events, data] }));
    }
  },

  updateEvent: async (id, updates) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? data : e)),
      }));
    }
  },

  deleteEvent: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
    }
  },

  toggleComplete: async (id) => {
    const { events } = get();
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .update({ completed: !event.completed })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? data : e)),
      }));
    }
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
  notifications: [],
  loading: false,
  error: null,
  filterType: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ notifications: data || [], loading: false });
    }
  },

  addNotification: async (notification) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("notifications")
      .insert({ ...notification, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({ notifications: [data, ...state.notifications] }));
    }
  },

  markAsRead: async (id) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? data : n)),
      }));
    }
  },

  markAllRead: async () => {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    }
  },

  deleteNotification: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }
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
  todos: [],
  loading: false,
  error: null,

  fetchTodos: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("todo_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ todos: data || [], loading: false });
    }
  },

  addTodo: async (todo) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("todo_items")
      .insert({ ...todo, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({ todos: [data, ...state.todos] }));
    }
  },

  updateTodo: async (id, updates) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("todo_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? data : t)),
      }));
    }
  },

  deleteTodo: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("todo_items").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      }));
    }
  },

  toggleComplete: async (id) => {
    const { todos } = get();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("todo_items")
      .update({ completed: !todo.completed })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? data : t)),
      }));
    }
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
  supplies: [],
  loading: false,
  error: null,
  filterCategory: null,

  fetchSupplies: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("supplies")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ supplies: data || [], loading: false });
    }
  },

  addSupply: async (supply) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("supplies")
      .insert({ ...supply, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({ supplies: [data, ...state.supplies] }));
    }
  },

  updateSupply: async (id, updates) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("supplies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        supplies: state.supplies.map((s) => (s.id === id ? data : s)),
      }));
    }
  },

  deleteSupply: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("supplies").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        supplies: state.supplies.filter((s) => s.id !== id),
      }));
    }
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
  sales: [],
  loading: false,
  error: null,
  filterStatus: null,

  fetchSales: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sale_records")
      .select("*")
      .order("sale_date", { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ sales: data || [], loading: false });
    }
  },

  addSale: async (sale) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("sale_records")
      .insert({ ...sale, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({ sales: [data, ...state.sales] }));
    }
  },

  updateSale: async (id, updates) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sale_records")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        sales: state.sales.map((s) => (s.id === id ? data : s)),
      }));
    }
  },

  deleteSale: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("sale_records").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        sales: state.sales.filter((s) => s.id !== id),
      }));
    }
  },

  markAsCompleted: async (id) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sale_records")
      .update({ status: "completed" })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        sales: state.sales.map((s) => (s.id === id ? data : s)),
      }));
    }
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
  farms: [],
  loading: false,
  error: null,
  currentFarmId: null,

  fetchFarms: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      const farms = data || [];
      set({
        farms,
        loading: false,
        // Set the first farm as current if none is selected
        currentFarmId: get().currentFarmId ?? (farms.length > 0 ? farms[0].id : null),
      });
    }
  },

  addFarm: async (farm) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("farms")
      .insert({ ...farm, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        farms: [...state.farms, data],
        currentFarmId: state.currentFarmId ?? data.id,
      }));
    }
  },

  updateFarm: async (id, updates) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("farms")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        farms: state.farms.map((f) => (f.id === id ? data : f)),
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
  readings: [],
  loading: false,
  error: null,

  fetchReadings: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rain_gauge_readings")
      .select("*")
      .order("date", { ascending: true });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ readings: data || [], loading: false });
    }
  },

  addReading: async (reading) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("rain_gauge_readings")
      .insert({ ...reading, user_id: user.id })
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        readings: [...state.readings, data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      }));
    }
  },

  updateReading: async (id, updates) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rain_gauge_readings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      set({ error: error.message });
    } else if (data) {
      set((state) => ({
        readings: state.readings.map((r) => (r.id === id ? data : r)),
      }));
    }
  },

  deleteReading: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("rain_gauge_readings").delete().eq("id", id);
    if (error) {
      set({ error: error.message });
    } else {
      set((state) => ({
        readings: state.readings.filter((r) => r.id !== id),
      }));
    }
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
