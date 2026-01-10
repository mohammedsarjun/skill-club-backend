// utils/flattenObject.ts
export function flattenObject(
  obj: Record<string, unknown>,
  parent = '',
  res: Record<string, unknown> = {},
): Record<string, unknown> {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const propName = parent ? `${parent}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value as Record<string, unknown>, propName, res);
    } else {
      res[propName] = value;
    }
  }
  return res;
}
