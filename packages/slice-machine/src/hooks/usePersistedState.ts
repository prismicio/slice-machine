import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AnyZodObject } from "zod";

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

const SLICE_MACHINE_STORAGE_PREFIX = "slice-machine";

type UsePersistedStateOptions = {
  schema?: AnyZodObject;
};

export function usePersistedState<T>(
  key: string,
): PersistedState<T | undefined>;
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options?: UsePersistedStateOptions,
): PersistedState<T>;
export function usePersistedState<T>(
  key: string,
  defaultValue?: T,
  options?: UsePersistedStateOptions,
): PersistedState<T | undefined> {
  const { schema } = options ?? {};
  const computedKey = `${SLICE_MACHINE_STORAGE_PREFIX}_${key}`;

  const [value, setValue] = useState<T | undefined>(() => {
    try {
      const value = localStorage.getItem(computedKey);

      if (value == null) return defaultValue;
      if (!schema) return JSON.parse(value) as T;

      const result = schema.safeParse(JSON.parse(value));
      if (!result.success) throw result.error;
      return result.data as T;
    } catch (error) {
      console.warn(`Error reading localStorage key “${computedKey}”:`, error);

      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(computedKey, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key “${computedKey}”:`, error);
    }
  }, [computedKey, value]);

  return [value, setValue];
}
