import { Dispatch, SetStateAction, useEffect, useState } from "react";

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

export const SLICE_MACHINE_STORAGE_PREFIX = "slice-machine";

export function usePersistedState<T>(
  defaultValue: T,
  key: string,
): PersistedState<T> {
  const computedKey = `${SLICE_MACHINE_STORAGE_PREFIX}_${key}`;
  const [value, setValue] = useState<T>(() => {
    const value = localStorage.getItem(computedKey);

    return value !== null ? (JSON.parse(value) as T) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(computedKey, JSON.stringify(value));
  }, [computedKey, value]);

  return [value, setValue];
}
