import { Dispatch, SetStateAction, useMemo, useSyncExternalStore } from "react";

const SLICE_MACHINE_STORAGE_PREFIX = "slice-machine";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isFunction = (value: any): value is (...args: any[]) => any => {
  return typeof value === "function";
};

export function useLocalStorageItem<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = `${SLICE_MACHINE_STORAGE_PREFIX}_${key}`;
  const getSnapshot = () => localStorage.getItem(storageKey);

  const subscribe = (listener: () => void) => {
    window.addEventListener("storage", listener);
    return () => void window.removeEventListener("storage", listener);
  };

  const serializedItem = useSyncExternalStore(subscribe, getSnapshot);
  const item = useMemo(() => {
    try {
      if (serializedItem != null) return JSON.parse(serializedItem) as T;
      return defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${storageKey}”:`, error);
      return defaultValue;
    }
  }, [serializedItem, defaultValue, storageKey]);

  const setItem = (value: SetStateAction<T>) => {
    try {
      const newValue = JSON.stringify(isFunction(value) ? value(item) : value);
      localStorage.setItem(storageKey, newValue);
      window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
    } catch (error) {
      console.warn(`Error setting localStorage key “${storageKey}”:`, error);
    }
  };

  return [item, setItem];
}
