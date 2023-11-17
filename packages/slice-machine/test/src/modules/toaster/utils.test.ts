import { describe, afterEach, expect, it, vi } from "vitest";

import { handleRemoteResponse, ToastPayload } from "@src/modules/toaster/utils";
import { ToasterType } from "@src/modules/toaster";

describe("[Toaster utils]", () => {
  describe("[handleRemoteResponse]", () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should call addToast function on an success", () => {
      const addToastFakeFunction = vi.fn();
      const toastPayload: ToastPayload = {
        done: true,
        message: "message",
        error: false,
      };
      handleRemoteResponse(addToastFakeFunction)(toastPayload);

      expect(addToastFakeFunction).toHaveBeenCalledWith(
        "message",
        ToasterType.SUCCESS,
      );
    });

    it("shouldn't call addToast function on an unfinished request", () => {
      const addToastFakeFunction = vi.fn();
      const toastPayload: ToastPayload = { done: false };
      handleRemoteResponse(addToastFakeFunction)(toastPayload);

      expect(addToastFakeFunction).toHaveBeenCalledTimes(0);
    });

    it("shouldn't call addToast function on a request with errors", () => {
      const addToastFakeFunction = vi.fn();
      const toastPayload: ToastPayload = {
        done: true,
        message: "message",
        error: true,
      };
      handleRemoteResponse(addToastFakeFunction)(toastPayload);

      expect(addToastFakeFunction).toHaveBeenCalledWith(
        "message",
        ToasterType.ERROR,
      );
    });
  });
});
