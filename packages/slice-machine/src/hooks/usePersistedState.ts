import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { ZodType, ZodTypeDef } from "zod";

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

const SLICE_MACHINE_STORAGE_PREFIX = "slice-machine";

type UsePersistedStateOptions<T> = {
  schema?: ZodType<T, ZodTypeDef, unknown>;
};

export function usePersistedState<T>(
  key: string,
): PersistedState<T | undefined>;
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options?: UsePersistedStateOptions<T>,
): PersistedState<T>;
export function usePersistedState<T>(
  key: string,
  defaultValue?: T,
  options?: UsePersistedStateOptions<T>,
): PersistedState<T | undefined> {
  const { schema } = options ?? {};
  const computedKey = getKey(key);

  const getValue = () => {
    try {
      const value = localStorage.getItem(computedKey);
      if (value == null) return defaultValue;
      if (!schema) return JSON.parse(value) as T;
      return schema.parse(JSON.parse(value));
    } catch (error) {
      return defaultValue;
    }
  };

  const [value, setValue] = useState<T | undefined>(getValue);

  const [prevKey, setPrevKey] = useState<string>(computedKey);

  if (prevKey !== computedKey) {
    setPrevKey(computedKey);
    setValue(getValue());
  }

  const setValueAndStore: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (newValue) => {
      setValue((prevValue) => {
        let resolvedValue: T | undefined;
        if (typeof newValue === "function") {
          resolvedValue = (
            newValue as (prevState: T | undefined) => T | undefined
          )(prevValue);
        } else {
          resolvedValue = newValue;
        }

        if (resolvedValue === undefined) {
          try {
            localStorage.removeItem(computedKey);
          } catch (error) {
            return prevValue;
          }
          return defaultValue;
        }

        try {
          localStorage.setItem(computedKey, JSON.stringify(resolvedValue));
        } catch (error) {
          return prevValue;
        }

        return resolvedValue;
      });
    },
    [computedKey, defaultValue],
  );

  return [value, setValueAndStore];
}

export function getKey(key: string) {
  return `${SLICE_MACHINE_STORAGE_PREFIX}_${key}`;
}
