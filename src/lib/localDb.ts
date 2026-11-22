// On-device data store for the Pro workspace (garden, journal, lesson progress).
// It keeps the small query-builder shape the pages already use
// (from().select().eq().order()...), backed by localStorage. Nothing leaves the device.
import catalogRows from "@/data/plantCatalog.json";
import { readLicense } from "@/lib/proAccess";

type Row = Record<string, any>;
type Result<T = any> = { data: T; error: { message: string } | null; count?: number | null };
type Filter = { column: string; op: "eq" | "in"; value: unknown };

export const LOCAL_USER_ID_KEY = "ph_local_user_id";
const TABLE_PREFIX = "ph_db_";
const PERSISTED_TABLES = ["user_plants", "plant_journal_entries", "lesson_progress", "profile"] as const;
const CATALOG = catalogRows as Row[];

export function localUserId(): string {
  let id = localStorage.getItem(LOCAL_USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(LOCAL_USER_ID_KEY, id);
  }
  return id;
}

function readTable(table: string): Row[] {
  if (table === "plants") return CATALOG.map((row) => ({ ...row }));
  if (table === "profiles") {
    const stored = readTable("profile")[0] || {};
    const license = readLicense();
    return [
      {
        display_name: null,
        avatar_url: null,
        ...stored,
        user_id: localUserId(),
        email: license?.email || null,
        subscription_tier: license ? "pro" : "free",
      },
    ];
  }
  try {
    const raw = localStorage.getItem(TABLE_PREFIX + table);
    const rows = raw ? JSON.parse(raw) : [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeTable(table: string, rows: Row[]) {
  if (table === "plants") throw new Error("The plant catalog is read-only");
  if (table === "profiles") {
    const { subscription_tier: _tier, email: _email, ...rest } = rows[0] || {};
    writeTable("profile", [rest]);
    return;
  }
  try {
    localStorage.setItem(TABLE_PREFIX + table, JSON.stringify(rows));
  } catch {
    throw new Error("This browser's storage is full. Remove some photos or export and clear old entries.");
  }
}

const matches = (row: Row, filters: Filter[]) =>
  filters.every((f) =>
    f.op === "eq"
      ? String(row[f.column]) === String(f.value)
      : Array.isArray(f.value) && f.value.map(String).includes(String(row[f.column]))
  );

// "*, plants(*)" attaches the catalog plant through plant_id.
function withRelations(rows: Row[], columns: string): Row[] {
  if (!/\bplants\s*\(/.test(columns)) return rows;
  return rows.map((row) => ({
    ...row,
    plants: row.plant_id ? CATALOG.find((plant) => plant.id === row.plant_id) || null : null,
  }));
}

class Query<T = any> implements PromiseLike<Result<T>> {
  private filters: Filter[] = [];
  private orderBy: { column: string; ascending: boolean }[] = [];
  private max: number | null = null;
  private mode: "many" | "single" | "maybeSingle" = "many";
  private action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: Row | Row[] | null = null;
  private columns = "*";
  private returning = false;
  private onConflict: string[] = [];

  constructor(private table: string) {}

  select(columns = "*") {
    if (this.action === "select") this.columns = columns;
    else this.returning = true;
    return this;
  }
  insert(values: Row | Row[]) {
    this.action = "insert";
    this.payload = values;
    return this;
  }
  upsert(values: Row | Row[], options?: { onConflict?: string }) {
    this.action = "upsert";
    this.payload = values;
    this.onConflict = (options?.onConflict || "id").split(",").map((c) => c.trim());
    return this;
  }
  update(values: Row) {
    this.action = "update";
    this.payload = values;
    return this;
  }
  delete() {
    this.action = "delete";
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push({ column, op: "eq", value });
    return this;
  }
  in(column: string, values: unknown[]) {
    this.filters.push({ column, op: "in", value: values });
    return this;
  }
  match(values: Row) {
    for (const [column, value] of Object.entries(values)) this.eq(column, value);
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy.push({ column, ascending: options?.ascending !== false });
    return this;
  }
  limit(count: number) {
    this.max = count;
    return this;
  }
  single() {
    this.mode = "single";
    return this;
  }
  maybeSingle() {
    this.mode = "maybeSingle";
    return this;
  }

  private shape(rows: Row[]): Result<T> {
    if (this.mode === "many") return { data: rows as T, error: null };
    if (rows.length > 1 && this.mode === "single") {
      return { data: null as T, error: { message: "More than one row matched" } };
    }
    if (rows.length === 0 && this.mode === "single") {
      return { data: null as T, error: { message: "No row found" } };
    }
    return { data: (rows[0] ?? null) as T, error: null };
  }

  private execute(): Result<T> {
    const now = new Date().toISOString();
    const rows = readTable(this.table);

    if (this.action === "select") {
      let selected = rows.filter((row) => matches(row, this.filters));
      for (const { column, ascending } of [...this.orderBy].reverse()) {
        selected = [...selected].sort((a, b) => {
          const left = a[column];
          const right = b[column];
          if (left === right) return 0;
          if (left === null || left === undefined) return 1;
          if (right === null || right === undefined) return -1;
          return (left < right ? -1 : 1) * (ascending ? 1 : -1);
        });
      }
      if (this.max !== null) selected = selected.slice(0, this.max);
      return this.shape(withRelations(selected, this.columns));
    }

    const incoming = Array.isArray(this.payload) ? this.payload : this.payload ? [this.payload] : [];

    if (this.action === "insert" || this.action === "upsert") {
      const written: Row[] = [];
      let next = rows;
      for (const value of incoming) {
        const existingIndex =
          this.action === "upsert"
            ? next.findIndex((row) => this.onConflict.every((c) => String(row[c]) === String(value[c])))
            : -1;
        if (existingIndex >= 0) {
          const merged = { ...next[existingIndex], ...value, updated_at: now };
          next = next.map((row, index) => (index === existingIndex ? merged : row));
          written.push(merged);
        } else {
          const created = { id: crypto.randomUUID(), created_at: now, updated_at: now, ...value };
          next = [...next, created];
          written.push(created);
        }
      }
      writeTable(this.table, next);
      return this.returning ? this.shape(written) : { data: null as T, error: null };
    }

    if (this.action === "update") {
      const written: Row[] = [];
      const next = rows.map((row) => {
        if (!matches(row, this.filters)) return row;
        const updated = { ...row, ...(this.payload as Row), updated_at: now };
        written.push(updated);
        return updated;
      });
      writeTable(this.table, next);
      return this.returning ? this.shape(written) : { data: null as T, error: null };
    }

    const kept = rows.filter((row) => !matches(row, this.filters));
    writeTable(this.table, kept);
    return { data: null as T, error: null };
  }

  then<R1 = Result<T>, R2 = never>(
    onfulfilled?: ((value: Result<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    let result: Result<T>;
    try {
      result = this.execute();
    } catch (error) {
      result = {
        data: null as T,
        error: { message: error instanceof Error ? error.message : "Could not save on this device" },
      };
    }
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

export const db = {
  from<T = any>(table: string) {
    return new Query<T>(table);
  },
};

/** Everything the Pro workspace stores on this device, for backup or moving devices. */
export function exportLocalData() {
  const tables: Record<string, Row[]> = {};
  for (const table of PERSISTED_TABLES) tables[table] = readTable(table);
  return { app: "plantastichaven-pro", version: 1, exportedAt: new Date().toISOString(), tables };
}

export function importLocalData(data: unknown): number {
  const tables = (data as { app?: string; tables?: Record<string, unknown> })?.tables;
  if ((data as { app?: string })?.app !== "plantastichaven-pro" || !tables) {
    throw new Error("This file is not a PlantasticHaven Pro backup");
  }
  let count = 0;
  const owner = localUserId();
  for (const table of PERSISTED_TABLES) {
    const rows = tables[table];
    if (!Array.isArray(rows)) continue;
    // Rows from another device are re-owned by this device's local id.
    writeTable(table, rows.map((row) => (row && typeof row === "object" && "user_id" in row ? { ...row, user_id: owner } : row)));
    count += rows.length;
  }
  return count;
}
