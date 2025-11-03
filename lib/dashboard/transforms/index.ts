// Aggregations
export * from "./aggregations";

// Filtering
export * from "./filtering";

// Statistical
export * from "./statistical";

// Formatting
export * from "./formatting";

type GenericRecord = Record<string, unknown>;

/**
 * Sorts data by a specific field, ascending or descending.
 */
export function sortBy<T extends GenericRecord>(
  data: T[],
  params: { field: keyof T; order?: "asc" | "desc" }
): T[] {
  const order = params.order || "asc";
  const field = params.field;

  return [...data].sort((a, b) => {
    const aVal = a[field] as number | string | Date;
    const bVal = b[field] as number | string | Date;

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (order === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });
}

/**
 * Sorts by the 'count' field (descending by default).
 */
export function sortByCount<T extends { count?: number }>(
  data: T[],
  params?: { order?: "asc" | "desc" }
): T[] {
  return sortBy(data, { field: "count", order: params?.order || "desc" } as {
    field: keyof T;
    order?: "asc" | "desc";
  });
}

/**
 * Groups data by a given field.
 */
export function groupBy<T extends GenericRecord>(
  data: T[],
  params: { field: keyof T }
): Record<string, T[]> {
  return data.reduce((acc, item) => {
    const key = String(item[params.field] ?? "Unknown");
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Groups data by date intervals (day, week, month, or year).
 */
export function groupByDate<T extends GenericRecord>(
  data: T[],
  params: { field: keyof T; groupBy: "day" | "week" | "month" | "year" }
): Record<string, T[]> {
  return data.reduce((acc, item) => {
    const rawDate = item[params.field];
    if (!rawDate) return acc;

    const date = new Date(String(rawDate));
    let key: string;

    switch (params.groupBy) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "week": {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      }
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "year":
        key = String(date.getFullYear());
        break;
      default:
        key = date.toISOString().split("T")[0];
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}