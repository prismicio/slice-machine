import { EffectCallback, useEffect } from "react";

export function useMountEffect(callback: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, []);
}
