import { ToasterType } from "@src/modules/toaster";

export interface ToastPayload {
  loading: boolean;
  done: boolean;
  warning: boolean;
  message: string;
  status: number;
  error: Error | null;
}

export const handleRemoteResponse =
  (addToast: (type: ToasterType, message: string) => void) =>
  (payload: ToastPayload) => {
    if (payload.done) {
      addToast(
        (() => {
          if (payload.error) {
            return ToasterType.ERROR;
          }
          if (payload.warning) {
            return ToasterType.WARNING;
          }
          return ToasterType.SUCCESS;
        })(),
        payload.message
      );
    }
  };
