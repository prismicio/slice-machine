import { useStableEffect } from "@prismicio/editor-support/React";
import { DependencyList, EffectCallback } from "react";

export function useStableDebouncedEffect(
  callback: EffectCallback,
  deps?: DependencyList,
  delay = 1000,
) {
  useStableEffect(() => {
    const timeout = setTimeout(callback, delay);
    return () => clearTimeout(timeout);
  }, deps ?? []);
}
