import { Dispatch, SetStateAction, useEffect, useState } from "react";

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

const SLICE_MACHINE_STORAGE_PREFIX = "slice-machine";

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): PersistedState<T> {
  const computedKey = `${SLICE_MACHINE_STORAGE_PREFIX}_${key}`;

  const [value, setValue] = useState<T>(() => {
    try {
      const value = localStorage.getItem(computedKey);

      return value !== null ? (JSON.parse(value) as T) : defaultValue;
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
