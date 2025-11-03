type GenericRecord = Record<string, unknown>;

/**
 * Filters data based on a custom predicate.
 */
export function filter<T extends GenericRecord>(
  data: T[],
  params: { predicate: (item: T) => boolean }
): T[] {
  return data.filter(params.predicate);
}

/**
 * Filters data within a specific date range (start → end).
 */
export function filterByDate<T extends GenericRecord>(
  data: T[],
  params: {
    field: keyof T;
    startDate?: Date;
    endDate?: Date;
  }
): T[] {
  return data.filter((item) => {
    const rawValue = item[params.field];
    if (!rawValue) return false;

    const date = new Date(String(rawValue));

    if (params.startDate && date < params.startDate) return false;
    if (params.endDate && date > params.endDate) return false;

    return true;
  });
}

/**
 * Filters data where a field matches one of the specified values.
 */
export function filterByField<T extends GenericRecord>(
  data: T[],
  params: { field: keyof T; values: T[keyof T][] }
): T[] {
  return data.filter((item) =>
    params.values.includes(item[params.field])
  );
}

/**
 * Returns the top N records, optionally sorted by a specific numeric field.
 */
export function top<T extends GenericRecord>(
  data: T[],
  params: { n: number; by?: keyof T }
): T[] {
  const sorted = params.by
    ? [...data].sort(
        (a, b) =>
          (Number(b[params.by]) || 0) - (Number(a[params.by]) || 0)
      )
    : data;

  return sorted.slice(0, params.n);
}

/**
 * Returns the bottom N records, optionally sorted by a specific numeric field.
 */
export function bottom<T extends GenericRecord>(
  data: T[],
  params: { n: number; by?: keyof T }
): T[] {
  const sorted = params.by
    ? [...data].sort(
        (a, b) =>
          (Number(a[params.by]) || 0) - (Number(b[params.by]) || 0)
      )
    : data;

  return sorted.slice(0, params.n);
}