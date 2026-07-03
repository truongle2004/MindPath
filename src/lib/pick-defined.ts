export const pickDefined = <T extends Record<string, unknown>>(values: T): Partial<T> => {
  const result: Partial<T> = {};

  for (const key of Object.keys(values) as (keyof T)[]) {
    const value = values[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
};
