import { ToasterType } from "../toaster";

export interface ToastPayload {
  loading: boolean;
  done: boolean;
  warning: boolean;
  message: string;
  status: number;
  error: Error | null;
}

export const handleRemoteResponse =
  (addToast: (message: string, type: ToasterType) => void) =>
  (payload: ToastPayload) => {
    if (payload.done) {
      addToast(
        payload.message,
        (() => {
          if (payload.error) {
            return ToasterType.ERROR;
          }
          if (payload.warning) {
            return ToasterType.WARNING;
          }
          return ToasterType.SUCCESS;
        })()
      );
    }
  };
