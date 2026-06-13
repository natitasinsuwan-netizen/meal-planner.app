import { storage } from "@/src/utils/storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL!;
const TOKEN_KEY = "mr_token";

export async function getToken(): Promise<string | null> {
  return await storage.secureGet<string>(TOKEN_KEY, "");
}
export async function setToken(token: string) {
  await storage.secureSet(TOKEN_KEY, token);
}
export async function clearToken() {
  await storage.secureRemove(TOKEN_KEY);
}

type Opts = { method?: string; body?: unknown; auth?: boolean };

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== false) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { detail: text };
  }
  if (!res.ok) {
    const msg = json?.detail || `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return json as T;
}

// Typed helpers
export type Profile = {
  weight_kg?: number | null;
  height_cm?: number | null;
  birthday?: string | null;
  sex?: "male" | "female" | null;
  exercise_per_week?: number | null;
  dietary_preferences: string[];
  allergies: string[];
  purpose: "random" | "diet";
};

export type Me = {
  id: string;
  email: string;
  is_admin: boolean;
  profile: Profile;
  daily_calorie_target: number | null;
  daily_calorie_adjusted: number | null;
};

export type Meal = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  calories: number;
  fat_g: number;
  protein_g: number;
  carbs_g: number;
  keywords: { countries: string[]; cooking_methods: string[]; carbs: string[]; protein: string[] };
  dietary_tags: string[];
  allergens: string[];
  low_fat: boolean;
};

export type LogEntry = {
  entry_id: string;
  meal_id: string;
  name: string;
  image_url: string;
  calories: number;
  added_at: string;
};

export type TodayLog = {
  date: string;
  entries: LogEntry[];
  consumed: number;
  target: number;
  remaining: number | null;
  purpose: "random" | "diet";
};

export type KeywordsResponse = {
  groups: { countries: string[]; cooking_methods: string[]; carbs: string[]; protein: string[] };
  dietary_preferences: string[];
  allergies: string[];
};
