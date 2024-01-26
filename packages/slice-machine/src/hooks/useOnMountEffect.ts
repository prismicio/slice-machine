import { EffectCallback, useEffect } from "react";

export function useOnMountEffect(callback: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, []);
}
