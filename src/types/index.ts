export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: "admin" | "user";
  profile_img: string | null;
  farm_uuid: string | null;
}

export interface LivestockRecord {
  id: number;
  uuid: string;
  visual_tag: string;
  eid: string | null;
  sex: "Male" | "Female" | null;
  weight_kg: number | null;
  weight_lb: number | null;
  breed: string | null;
  condition: string | null;
  date_of_birth: string | null;
  date_of_sale: string | null;
  date_of_death: string | null;
  record_date: string | null;
  notes: string | null;
  is_pregnant: boolean;
  is_dehorn: boolean;
  mother_visual_tag: string | null;
  father_visual_tag: string | null;
  profile_image: string | null;
  farm_uuid: string | null;
  paddock_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalBatch {
  id: number;
  uuid: string;
  batch_name: string;
  status: "active" | "completed" | "scheduled";
  treatment_type: string;
  medication: string;
  dosage: string;
  administered_by: string;
  animal_count: number;
  animals: string[]; // visual_tags
  scheduled_date: string;
  completed_date: string | null;
  notes: string | null;
  farm_uuid: string | null;
  created_at: string;
}

export interface Paddock {
  id: number;
  uuid: string;
  name: string;
  area_hectares: number;
  capacity: number;
  current_count: number;
  status: "active" | "resting" | "maintenance";
  pasture_type: string;
  water_source: boolean;
  lat: number;
  lng: number;
  polygon?: [number, number][]; // array of [lat, lng] for boundary
  farm_uuid: string | null;
  created_at: string;
}

export interface MapMarker {
  id: number;
  name: string;
  type: "water" | "gate" | "shed" | "trough" | "yard" | "silo" | "dam";
  lat: number;
  lng: number;
  notes?: string;
}

export interface FenceLine {
  id: number;
  name: string;
  type: "boundary" | "internal" | "electric" | "barbed";
  condition: "good" | "fair" | "poor" | "needs_repair";
  coordinates: [number, number][]; // array of [lat, lng]
  length_km?: number;
}

export interface Notification {
  id: number;
  type: "alert" | "info" | "warning" | "success";
  title: string;
  message: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  type: "medical" | "sale" | "inspection" | "maintenance" | "other";
  date: string;
  time: string | null;
  description: string | null;
  completed: boolean;
}

export interface WeightHistory {
  date: string;
  avg_weight: number;
}

export interface BreedDistribution {
  breed: string;
  count: number;
  percentage: number;
}

export interface ActivityItem {
  id: number;
  type: "record_added" | "medical" | "weight_update" | "sale" | "paddock_move" | "alert";
  description: string;
  timestamp: string;
  icon_type: string;
}

export interface DashboardStats {
  total_livestock: number;
  total_male: number;
  total_female: number;
  total_weight_kg: number;
  avg_weight_kg: number;
  recent_records: LivestockRecord[];
  medical_batches_active: number;
  weight_history: WeightHistory[];
  breed_distribution: BreedDistribution[];
  recent_activity: ActivityItem[];
  upcoming_events: CalendarEvent[];
  alerts: Notification[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TodoItem {
  id: number;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  completed: boolean;
  due_date: string | null;
  created_at: string;
}

export interface Supply {
  id: number;
  name: string;
  category: "feed" | "fencing" | "fertilizer" | "seed" | "herbicide" | "medical" | "other";
  quantity: number;
  unit: string;
  cost_per_unit: number;
  supplier: string;
  reorder_level: number;
  last_ordered: string | null;
  notes: string | null;
}

export interface SaleRecord {
  id: number;
  record_visual_tag: string;
  buyer_name: string;
  buyer_contact: string;
  sale_price: number;
  sale_date: string;
  weight_at_sale: number;
  price_per_kg: number;
  status: "pending" | "completed" | "cancelled";
  notes: string | null;
}

export interface Farm {
  id: number;
  name: string;
  location: string;
  size_hectares: number;
  owner_name: string;
  created_at: string;
}

export interface RainGaugeReading {
  id: number;
  date: string;
  amount_mm: number;
  notes: string | null;
}
