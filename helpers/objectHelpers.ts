export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...propsToOmit: K[]
): Omit<T, K> {
  const newObj = { ...obj }; // Create a shallow copy of the object
  propsToOmit.forEach((prop) => {
    delete newObj[prop]; // Delete the specified property from the copy
  });
  return newObj; // Return the new object without the omitted properties
}
