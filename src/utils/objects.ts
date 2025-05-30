import type { DeepPartial } from '@/types/utilities'

export const mergeDeep = <T extends Record<string, unknown>>(
  target: T, 
  source: DeepPartial<T>
): T => {
  const result = { ...target };
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];
    
    if (
      sourceValue && 
      typeof sourceValue === 'object' && 
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = mergeDeep(
        targetValue as Record<string, unknown>, 
        sourceValue as DeepPartial<Record<string, unknown>>
      ) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }
  return result;
};