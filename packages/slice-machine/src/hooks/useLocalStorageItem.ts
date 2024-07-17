import {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

export type UseLocalStorageReturnType<T> = [T, Dispatch<SetStateAction<T>>];

const SLICE_MACHINE_STORAGE_PREFIX = "slice-machine";

const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  return () => void window.removeEventListener("storage", listener);
};

export function useLocalStorageItem<T>(
  key: string,
): UseLocalStorageReturnType<T | undefined>;
export function useLocalStorageItem<T>(
  key: string,
  initialValue: T,
): UseLocalStorageReturnType<T>;
export function useLocalStorageItem<T>(
  key: string,
  initialValue?: T | undefined,
): UseLocalStorageReturnType<T | undefined> {
  const staticPropsRef = useRef({
    storageKey: `${SLICE_MACHINE_STORAGE_PREFIX}_${key}`,
    initialValue,
  });

  const getSnapshot = () => {
    return localStorage.getItem(staticPropsRef.current.storageKey);
  };

  const serializedItem = useSyncExternalStore(subscribe, getSnapshot);
  const item = useMemo(() => {
    try {
      if (serializedItem != null) return JSON.parse(serializedItem) as T;
      return staticPropsRef.current.initialValue;
    } catch (error) {
      console.warn(
        `Error reading localStorage key “${staticPropsRef.current.storageKey}”:`,
        error,
      );
      return staticPropsRef.current.initialValue;
    }
  }, [serializedItem]);

  const setItem = (value: SetStateAction<T | undefined>) => {
    const { storageKey: storageKey } = staticPropsRef.current;
    try {
      const newValue = JSON.stringify(
        value instanceof Function ? value(item) : value,
      );
      localStorage.setItem(storageKey, newValue);
      window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
    } catch (error) {
      console.warn(`Error setting localStorage key “${storageKey}”:`, error);
    }
  };

  if (serializedItem == null && initialValue !== undefined) {
    setItem(initialValue);
  }

  return [item, setItem];
}
