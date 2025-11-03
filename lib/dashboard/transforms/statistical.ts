type NumericRecord = Record<string, number>;

/**
 * Calculates percentage for a given numeric field within a dataset.
 */
export function percentage<T extends NumericRecord>(
  data: T[],
  params: { field: keyof T; total?: number }
): (T & { percentage: number })[] {
  const field = params.field;
  const total =
    params.total ??
    data.reduce((sum, item) => sum + (item[field] ?? 0), 0);

  return data.map((item) => ({
    ...item,
    percentage:
      total === 0 ? 0 : ((item[field] ?? 0) / total) * 100,
  }));
}

/**
 * Calculates the percentage change between two numeric values.
 */
export function percentageChange(data: {
  current: number;
  previous: number;
}): number {
  if (data.previous === 0) return 0;
  return ((data.current - data.previous) / data.previous) * 100;
}

/**
 * Computes trend direction (up, down, neutral) for a numeric field over time.
 */
export function trend<T extends NumericRecord>(
  data: T[],
  params: { field: keyof T; periods?: number }
): { value: number; direction: "up" | "down" | "neutral" } {
  const { field, periods = data.length } = params;
  const recentData = data.slice(-periods);

  if (recentData.length < 2) {
    return { value: 0, direction: "neutral" };
  }

  const first = recentData[0][field] ?? 0;
  const last = recentData[recentData.length - 1][field] ?? 0;
  const change = first === 0 ? 0 : ((last - first) / first) * 100;

  return {
    value: Math.abs(change),
    direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}

/**
 * Ranks items in descending order based on a numeric field.
 */
export function ranking<T extends NumericRecord>(
  data: T[],
  params: { by: keyof T }
): (T & { rank: number })[] {
  const { by } = params;

  return [...data]
    .sort((a, b) => (b[by] ?? 0) - (a[by] ?? 0))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
}

/**
 * Normalizes numeric field values to a 0–100 scale.
 */
export function normalize<T extends NumericRecord>(
  data: T[],
  params: { field: keyof T }
): (T & { [K in `${string & keyof T}Normalized`]: number })[] {
  const field = params.field;
  const values = data.map((item) => item[field] ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) return data as any;

  return data.map((item) => ({
    ...item,
    [`${String(field)}Normalized`]:
      ((item[field] - min) / range) * 100,
  })) as (T & { [K in `${string & keyof T}Normalized`]: number })[];
}
