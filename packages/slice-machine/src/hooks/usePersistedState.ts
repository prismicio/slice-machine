import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { ZodType, ZodTypeDef } from "zod";

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

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

  const getValue = () => {
    try {
      const value = localStorage.getItem(key);
      if (value == null) return defaultValue;
      if (!schema) return JSON.parse(value) as T;
      return schema.parse(JSON.parse(value));
    } catch (error) {
      return defaultValue;
    }
  };

  const [value, setValue] = useState<T | undefined>(getValue);

  const [prevKey, setPrevKey] = useState<string>(key);

  if (prevKey !== key) {
    setPrevKey(key);
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
            localStorage.removeItem(key);
          } catch (error) {
            return prevValue;
          }
          return defaultValue;
        }

        try {
          localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch (error) {
          return prevValue;
        }

        return resolvedValue;
      });
    },
    [key, defaultValue],
  );

  return [value, setValueAndStore];
}
