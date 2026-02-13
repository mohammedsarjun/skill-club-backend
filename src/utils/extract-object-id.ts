import { Types } from 'mongoose';

export function extractObjectId(
  field: Types.ObjectId | string | { _id?: Types.ObjectId | string } | null | undefined,
): string | undefined {
  if (!field) return undefined;
  if (typeof field === 'string') return field;
  if (field instanceof Types.ObjectId) return field.toString();
  if (typeof field === 'object' && '_id' in field && field._id) {
    return field._id.toString();
  }
  if (typeof field === 'object' && 'toString' in field && typeof field.toString === 'function') {
    const s = field.toString();
    if (/^[a-fA-F0-9]{24}$/.test(s)) return s;
  }
  return undefined;
}
