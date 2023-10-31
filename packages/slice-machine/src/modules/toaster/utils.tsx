import type { ReactNode } from "react";

import { ToasterType } from "../toaster";

export type ToastPayload =
  | { done: true; message: ReactNode; error: boolean }
  | { done: false };

export const handleRemoteResponse =
  (addToast: (message: ReactNode, type: ToasterType) => void) =>
  (payload: ToastPayload) => {
    if (payload.done) {
      addToast(
        payload.message,
        (() => {
          if (payload.error) {
            return ToasterType.ERROR;
          }
          return ToasterType.SUCCESS;
        })(),
      );
    }
  };
