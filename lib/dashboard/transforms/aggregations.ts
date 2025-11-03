type NumericRecord = Record<string, number | undefined>;

/**
 * Counts the number of items in the dataset.
 */
export function count<T>(data: T[]): number {
  return data.length;
}

/**
 * Calculates the sum of numeric values for a specified field.
 */
export function sum<T extends NumericRecord>(
  data: T[],
  params: { field: keyof T }
): number {
  return data.reduce(
    (acc, item) => acc + (Number(item[params.field]) || 0),
    0
  );
}

/**
 * Calculates the average (mean) value for a numeric field.
 */
export function average<T extends NumericRecord>(
  data: T[],
  params: { field: keyof T }
): number {
  if (data.length === 0) return 0;
  return sum(data, params) / data.length;
}

/**
 * Calculates the median value for a numeric field.
 */
export function median<T extends NumericRecord>(
  data: T[],
  params: { field: keyof T }
): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort(
    (a, b) => (Number(a[params.field]) || 0) - (Number(b[params.field]) || 0)
  );

  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? ((Number(sorted[mid - 1][params.field]) || 0) +
        (Number(sorted[mid][params.field]) || 0)) /
        2
    : (Number(sorted[mid][params.field]) || 0);
}

/**
 * Finds the minimum numeric value for a given field.
 */
export function min<T extends NumericRecord>(
  data: T[],
  params: { field: keyof T }
): number {
  return Math.min(
    ...data.map((item) => Number(item[params.field]) || Infinity)
  );
}

/**
 * Finds the maximum numeric value for a given field.
 */
export function max<T extends NumericRecord>(
  data: T[],
  params: { field: keyof T }
): number {
  return Math.max(
    ...data.map((item) => Number(item[params.field]) || -Infinity)
  );
}
