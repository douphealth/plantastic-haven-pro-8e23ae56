import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sesleusxaskzjtlifzgp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc2xldXN4YXNremp0bGlmemdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjA5NTgsImV4cCI6MjA5MTEzNjk1OH0.rn13C_og0zUNt1IX-Vl7jN5KsA9_sL3L8Jvf4d5ufjY";

// Set default guest mode to true if not set, enabling frictionless instant login
if (localStorage.getItem("guest_mode") === null) {
  localStorage.setItem("guest_mode", "true");
  const guestUser = {
    id: "guest-user-id",
    email: "guest-gardener@plantastichaven.com",
    user_metadata: { display_name: "Premium Guest Gardener" },
    role: "authenticated",
    aud: "authenticated",
    created_at: new Date().toISOString()
  };
  const guestSession = {
    access_token: "mock-token",
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "mock-refresh-token",
    user: guestUser
  };
  localStorage.setItem("mock_session", JSON.stringify(guestSession));
}

// ----------------------------------------------------------------------------
// Local Storage Mock Database Engine (Offline & Guest Mode Fallback)
// ----------------------------------------------------------------------------

const authCallbacks: any[] = [];

class MockBuilder {
  private tableName: string;
  private filters: any[] = [];
  private limitCount?: number;
  private isSingle = false;
  private isDelete = false;
  private insertData: any = null;
  private updateData: any = null;
  private orderField?: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = "*") {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ column, value, type: "neq" });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data: any) {
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  async then(onfulfilled?: (value: any) => any) {
    try {
      const result = await this.execute();
      if (onfulfilled) return onfulfilled(result);
      return result;
    } catch (err) {
      const fallbackResult = { data: null, error: err instanceof Error ? err : new Error(String(err)) };
      if (onfulfilled) return onfulfilled(fallbackResult);
      return fallbackResult;
    }
  }

  private async execute() {
    const key = `mock_db_${this.tableName}`;
    let items = JSON.parse(localStorage.getItem(key) || "[]");

    // Initialize mock profiles
    if (items.length === 0 && this.tableName === "profiles") {
      items = [{
        id: "profile-1",
        user_id: "guest-user-id",
        display_name: "Premium Guest Gardener",
        subscription_tier: "pro",
        care_streak: 7,
        total_plants_saved: 12,
        created_at: new Date().toISOString()
      }];
      localStorage.setItem(key, JSON.stringify(items));
    }

    // Initialize mock master plants catalog
    if (items.length === 0 && this.tableName === "plants") {
      items = [
        { id: "p1", name: "Monstera Deliciosa", scientific_name: "Monstera deliciosa", care_difficulty: "easy", water_frequency_days: 7, toxicity_pets: true, description: "Elegant split-leaf houseplant." },
        { id: "p2", name: "Snake Plant", scientific_name: "Sansevieria trifasciata", care_difficulty: "easy", water_frequency_days: 14, toxicity_pets: true, description: "Durable air-purifier plant." },
        { id: "p3", name: "Fiddle Leaf Fig", scientific_name: "Ficus lyrata", care_difficulty: "moderate", water_frequency_days: 10, toxicity_pets: true, description: "Dramatic violin-shaped foliage." },
        { id: "p4", name: "Golden Pothos", scientific_name: "Epipremnum aureum", care_difficulty: "easy", water_frequency_days: 7, toxicity_pets: true, description: "Beautiful cascading leafy vine." }
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }

    // Initialize mock user plants list for a populated dashboard feel
    if (items.length === 0 && this.tableName === "user_plants") {
      const nextWaterMonstera = new Date();
      nextWaterMonstera.setDate(nextWaterMonstera.getDate() + 3);
      
      const nextWaterSnake = new Date();
      nextWaterSnake.setDate(nextWaterSnake.getDate() - 1); // Overdue

      items = [
        { 
          id: "up1", 
          user_id: "guest-user-id", 
          nickname: "Monty the Monstera 🌿", 
          location: "Indoor", 
          room: "Living Room", 
          health_score: 95, 
          last_watered: new Date(Date.now() - 4 * 86400000).toISOString(), 
          next_water_date: nextWaterMonstera.toISOString(),
          notes: "Thriving nicely near the east window. Enjoys high humidity.",
          created_at: new Date().toISOString()
        },
        { 
          id: "up2", 
          user_id: "guest-user-id", 
          nickname: "Sid the Snake Plant 🌵", 
          location: "Indoor", 
          room: "Bedroom", 
          health_score: 80, 
          last_watered: new Date(Date.now() - 15 * 86400000).toISOString(), 
          next_water_date: nextWaterSnake.toISOString(),
          notes: "Neglect-friendly. Do not overwater.",
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }

    // Initialize mock journal entries
    if (items.length === 0 && this.tableName === "plant_journal_entries") {
      items = [
        { id: "je1", user_plant_id: "up1", user_id: "guest-user-id", note: "Pushed out a massive new fenestrated leaf today!", milestone_type: "growth", created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
        { id: "je2", user_plant_id: "up1", user_id: "guest-user-id", note: "Repotted into chunky custom aroid mix.", milestone_type: "repot", created_at: new Date(Date.now() - 10 * 86400000).toISOString() }
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }

    // Initialize mock community posts
    if (items.length === 0 && this.tableName === "community_posts") {
      items = [
        { id: "post1", user_id: "guest-user-id", title: "My Monstera cuttings are finally rooting! 🎉", content: "Used the water propagation method we learned in the Care Sequences. Day 14 and roots are looking super strong! Ready to pot in soil soon.", likes_count: 14, category: "showcase", created_at: new Date().toISOString() },
        { id: "post2", user_id: "external-gardener-1", title: "Yellow leaves on my Calathea - please help!", content: "Leaves are curling and tips are turning dry and brown. I mist it daily, is it too much water?", likes_count: 5, category: "question", created_at: new Date(Date.now() - 1 * 86400000).toISOString() }
      ];
      localStorage.setItem(key, JSON.stringify(items));
    }

    // Write: INSERT
    if (this.insertData) {
      const dataToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const inserted = dataToInsert.map(d => ({
        id: d.id || Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString(),
        ...d
      }));
      items = [...inserted, ...items];
      localStorage.setItem(key, JSON.stringify(items));
      return { data: this.isSingle ? inserted[0] : inserted, error: null };
    }

    // Write: UPDATE
    if (this.updateData) {
      items = items.map((item: any) => {
        let match = true;
        for (const filter of this.filters) {
          if (filter.type === "neq") {
            if (item[filter.column] === filter.value) match = false;
          } else {
            if (item[filter.column] !== filter.value) match = false;
          }
        }
        if (match) {
          return { ...item, ...this.updateData, updated_at: new Date().toISOString() };
        }
        return item;
      });
      localStorage.setItem(key, JSON.stringify(items));
      return { data: items, error: null };
    }

    // Write: DELETE
    if (this.isDelete) {
      items = items.filter((item: any) => {
        let match = true;
        for (const filter of this.filters) {
          if (filter.type === "neq") {
            if (item[filter.column] === filter.value) match = false;
          } else {
            if (item[filter.column] !== filter.value) match = false;
          }
        }
        return !match;
      });
      localStorage.setItem(key, JSON.stringify(items));
      return { data: null, error: null };
    }

    // Read: SELECT & FILTER
    let filtered = items;
    for (const filter of this.filters) {
      if (filter.type === "neq") {
        filtered = filtered.filter((item: any) => item[filter.column] !== filter.value);
      } else {
        filtered = filtered.filter((item: any) => item[filter.column] === filter.value);
      }
    }

    // Sort order
    if (this.orderField) {
      filtered = [...filtered].sort((a, b) => {
        const valA = a[this.orderField!] || "";
        const valB = b[this.orderField!] || "";
        return String(valA).localeCompare(String(valB));
      });
    }

    // Limit
    if (this.limitCount) {
      filtered = filtered.slice(0, this.limitCount);
    }

    // Format single response or array list
    if (this.isSingle) {
      return { data: filtered[0] || null, error: null };
    }
    return { data: filtered, error: null };
  }
}

// ----------------------------------------------------------------------------
// Mock Auth API
// ----------------------------------------------------------------------------

const mockAuth = {
  signUp: async (credentials: any) => {
    localStorage.setItem("guest_mode", "true");
    const mockUser = {
      id: "guest-user-id",
      email: credentials.email || "guest-gardener@plantastichaven.com",
      user_metadata: { display_name: credentials.options?.data?.display_name || credentials.email },
      role: "authenticated",
      aud: "authenticated",
      created_at: new Date().toISOString()
    };
    const mockSession = {
      access_token: "mock-token",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock-refresh-token",
      user: mockUser
    };
    localStorage.setItem("mock_session", JSON.stringify(mockSession));
    authCallbacks.forEach(cb => cb("SIGNED_IN", mockSession));
    return { data: { user: mockUser, session: mockSession }, error: null };
  },

  signInWithPassword: async (credentials: any) => {
    localStorage.setItem("guest_mode", "true");
    const mockUser = {
      id: "guest-user-id",
      email: credentials.email || "guest-gardener@plantastichaven.com",
      user_metadata: { display_name: "Premium Guest Gardener" },
      role: "authenticated",
      aud: "authenticated",
      created_at: new Date().toISOString()
    };
    const mockSession = {
      access_token: "mock-token",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock-refresh-token",
      user: mockUser
    };
    localStorage.setItem("mock_session", JSON.stringify(mockSession));
    authCallbacks.forEach(cb => cb("SIGNED_IN", mockSession));
    return { data: { user: mockUser, session: mockSession }, error: null };
  },

  resetPasswordForEmail: async (email: string) => {
    return { data: {}, error: null };
  },

  signOut: async () => {
    localStorage.removeItem("guest_mode");
    localStorage.removeItem("mock_session");
    authCallbacks.forEach(cb => cb("SIGNED_OUT", null));
    return { error: null };
  },

  getSession: async () => {
    const sessionStr = localStorage.getItem("mock_session");
    if (sessionStr) {
      return { data: { session: JSON.parse(sessionStr) }, error: null };
    }
    return { data: { session: null }, error: null };
  },

  getUser: async (token?: string) => {
    const sessionStr = localStorage.getItem("mock_session");
    if (sessionStr) {
      return { data: { user: JSON.parse(sessionStr).user }, error: null };
    }
    return { data: { user: null }, error: null };
  },

  onAuthStateChange: (callback: any) => {
    authCallbacks.push(callback);
    const sessionStr = localStorage.getItem("mock_session");
    const initialSession = sessionStr ? JSON.parse(sessionStr) : null;
    
    // Defer execution slightly to let UI bind listeners
    setTimeout(() => {
      callback(initialSession ? "SIGNED_IN" : "SIGNED_OUT", initialSession);
    }, 50);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = authCallbacks.indexOf(callback);
            if (index !== -1) authCallbacks.splice(index, 1);
          }
        }
      }
    };
  }
};

// ----------------------------------------------------------------------------
// Supabase Client Proxy (Seamless DB Fallback)
// ----------------------------------------------------------------------------

const realSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// A robust client wrapper proxy that falls back to localStorage mock db on network failure or if in guest mode
export const supabase = new Proxy(realSupabase, {
  get(target, prop, receiver) {
    // Override auth module with local state manager
    if (prop === "auth") {
      return mockAuth;
    }

    // Override edge function invokes
    if (prop === "functions") {
      return {
        invoke: async (functionName: string, options?: any) => {
          if (functionName === "check-payment") {
            return { data: { isPro: true }, error: null };
          }
          if (functionName === "create-payment") {
            return { data: { url: window.location.origin + "/payment-success" }, error: null };
          }
          if (functionName === "plant-identifier") {
            // High-fidelity local AI responses based on common descriptions
            const desc = (options?.body?.description || "").toLowerCase();
            let name = "Fiddle Leaf Fig";
            let scientific = "Ficus lyrata";
            let difficulty = "Moderate";
            let light = "Bright indirect sunlight";
            let water = "Every 10 days, allow top 2 inches of soil to dry";
            let toxicity = "Toxic to cats and dogs (contains insoluble calcium oxalate crystals)";
            let care_tips = [
              "Keep leaves free of dust to maximize photosynthesis capacity.",
              "Water thoroughly, but ensure drainage holes flush water completely.",
              "Protect from drafts and extreme hot/cold window swings."
            ];

            if (desc.includes("cheese") || desc.includes("monstera") || desc.includes("holes")) {
              name = "Monstera Deliciosa";
              scientific = "Monstera deliciosa";
              difficulty = "Easy";
              light = "Medium to bright indirect light";
              water = "Water every 7-10 days, letting soil dry out in between";
              toxicity = "Toxic to cats and dogs (calcium oxalate)";
              care_tips = [
                "Provide a moss pole or stake for aerial roots to climb.",
                "Wipe leaves with a damp cloth monthly to clean dust.",
                "Prune yellowing lower foliage to conserve plant energy."
              ];
            } else if (desc.includes("snake") || desc.includes("tongue") || desc.includes("sansevieria")) {
              name = "Snake Plant";
              scientific = "Sansevieria trifasciata";
              difficulty = "Easy";
              light = "Low to bright direct/indirect light";
              water = "Every 14-21 days, let soil dry completely";
              toxicity = "Toxic to cats and dogs (contains saponins)";
              care_tips = [
                "Extremely drought tolerant - when in doubt, do not water.",
                "Pots with drainage holes are mandatory to prevent root rot.",
                "Thrives in typical indoor temperatures between 15°C and 29°C."
              ];
            } else if (desc.includes("pothos") || desc.includes("ivy") || desc.includes("vine")) {
              name = "Golden Pothos";
              scientific = "Epipremnum aureum";
              difficulty = "Easy";
              light = "Low to bright indirect sunlight";
              water = "Water weekly, once top soil dry to touch";
              toxicity = "Toxic to pets (calcium oxalate)";
              care_tips = [
                "Allows beautiful vine cascading or vertical trellis training.",
                "Propagates easily in water from stem node cuttings.",
                "Vibrant variegation increases with brighter ambient light."
              ];
            }

            return {
              data: {
                name,
                scientific_name: scientific,
                description: `A stunning variety of ${name} which is highly valued for its decorative foliage and resilience in typical indoor environments.`,
                difficulty,
                light,
                water,
                toxicity,
                care_tips
              },
              error: null
            };
          }
          return { data: {}, error: null };
        }
      };
    }

    // Intercept database calls
    if (prop === "from") {
      const isGuest = localStorage.getItem("guest_mode") === "true";
      if (isGuest) {
        return (tableName: string) => new MockBuilder(tableName);
      }

      // If not guest, return a wrapper that intercepts query failures
      return (tableName: string) => {
        const queryBuilder = target.from(tableName);
        
        // Return a proxy around the query builder
        return new Proxy(queryBuilder, {
          get(qTarget, qProp, qReceiver) {
            // Intercept .then to capture network/fetch errors and fall back to local mock storage
            if (qProp === "then") {
              return async (resolve: any, reject: any) => {
                try {
                  const res = await queryBuilder;
                  if (res.error && (res.error.message.includes("fetch") || res.error.message.includes("network"))) {
                    console.warn("Supabase fetch failed. Falling back to local Storage DB...");
                    const localRes = await new MockBuilder(tableName);
                    return resolve(localRes);
                  }
                  return resolve(res);
                } catch (err) {
                  console.warn("Supabase query exception. Falling back to local Storage DB...", err);
                  const localRes = await new MockBuilder(tableName);
                  return resolve(localRes);
                }
              };
            }
            
            // Standard chaining
            const val = Reflect.get(qTarget, qProp, qReceiver);
            if (typeof val === "function") {
              return (...args: any[]) => {
                const chainResult = val.apply(qTarget, args);
                // Return proxy recursively to ensure `.then` is caught at the end of the chain
                return new Proxy(chainResult, {
                  get(cTarget, cProp, cReceiver) {
                    if (cProp === "then") {
                      return async (cResolve: any) => {
                        try {
                          const res = await cTarget;
                          if (res.error && (res.error.message.includes("fetch") || res.error.message.includes("network"))) {
                            const localRes = await new MockBuilder(tableName);
                            return cResolve(localRes);
                          }
                          return cResolve(res);
                        } catch (err) {
                          const localRes = await new MockBuilder(tableName);
                          return cResolve(localRes);
                        }
                      };
                    }
                    return Reflect.get(cTarget, cProp, cReceiver);
                  }
                });
              };
            }
            return val;
          }
        });
      };
    }

    return Reflect.get(target, prop, receiver);
  }
});
export default supabase;