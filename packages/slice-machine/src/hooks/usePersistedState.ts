import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

const SLICE_MACHINE_STORAGE_PREFIX = "slice-machine";

type UsePersistedStateOptions = {
  storeDefaultValue?: boolean;
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
  const { storeDefaultValue } = options ?? {};
  const staticPropsRef = useRef({
    computedKey: `${SLICE_MACHINE_STORAGE_PREFIX}_${key}`,
    defaultValue,
  });

  const [value, setValue] = useState<T | undefined>(() => {
    const { computedKey, defaultValue } = staticPropsRef.current;
    try {
      const value = localStorage.getItem(computedKey);

      return value !== null ? (JSON.parse(value) as T) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${computedKey}”:`, error);

      return defaultValue;
    }
  });

  useEffect(() => {
    const { computedKey, defaultValue } = staticPropsRef.current;
    try {
      localStorage.setItem(computedKey, JSON.stringify(value));
      if (storeDefaultValue === true && defaultValue != null && value == null) {
        localStorage.setItem(computedKey, JSON.stringify(defaultValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key “${computedKey}”:`, error);
    }
  }, [value, storeDefaultValue]);

  return [value, setValue];
}
