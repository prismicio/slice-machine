import { describe, afterEach, expect, it, vi } from "vitest";
import {
  openToasterCreator,
  openToasterSaga,
  ToasterType,
} from "@src/modules/toaster";
import { testSaga } from "redux-saga-test-plan";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

const toastSuccessMock = vi.mocked(toast.success);
const toastInfoMock = vi.mocked(toast.info);
const toastErrorMock = vi.mocked(toast.error);
const toastWarningMock = vi.mocked(toast.warning);

describe("[Toaster module]", () => {
  describe("[openToasterSaga]", () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should call the react-notify with the success method", () => {
      const openToasterAction: ReturnType<typeof openToasterCreator> = {
        payload: {
          content: "message",
          type: ToasterType.SUCCESS,
        },
        type: "TOASTER/OPEN",
      };
      const saga = testSaga(openToasterSaga, openToasterAction);
      saga.next(false).isDone();

      expect(toastSuccessMock).toHaveBeenCalledWith("message", undefined);
      expect(toastInfoMock).toHaveBeenCalledTimes(0);
      expect(toastErrorMock).toHaveBeenCalledTimes(0);
      expect(toastWarningMock).toHaveBeenCalledTimes(0);
    });

    it("should call the react-notify with the info method", () => {
      const openToasterAction: ReturnType<typeof openToasterCreator> = {
        payload: {
          content: "message",
          type: ToasterType.INFO,
        },
        type: "TOASTER/OPEN",
      };
      const saga = testSaga(openToasterSaga, openToasterAction);
      saga.next(false).isDone();

      expect(toastInfoMock).toHaveBeenCalledWith("message", undefined);
      expect(toastSuccessMock).toHaveBeenCalledTimes(0);
      expect(toastErrorMock).toHaveBeenCalledTimes(0);
      expect(toastWarningMock).toHaveBeenCalledTimes(0);
    });

    it("should call the react-notify with the warning method", () => {
      const openToasterAction: ReturnType<typeof openToasterCreator> = {
        payload: {
          content: "message",
          type: ToasterType.WARNING,
        },
        type: "TOASTER/OPEN",
      };
      const saga = testSaga(openToasterSaga, openToasterAction);
      saga.next(false).isDone();

      expect(toastWarningMock).toHaveBeenCalledWith("message", undefined);
      expect(toastSuccessMock).toHaveBeenCalledTimes(0);
      expect(toastErrorMock).toHaveBeenCalledTimes(0);
      expect(toastInfoMock).toHaveBeenCalledTimes(0);
    });

    it("should call the react-notify with the error method", () => {
      const openToasterAction: ReturnType<typeof openToasterCreator> = {
        payload: {
          content: "message",
          type: ToasterType.ERROR,
        },
        type: "TOASTER/OPEN",
      };
      const saga = testSaga(openToasterSaga, openToasterAction);
      saga.next(false).isDone();

      expect(toastErrorMock).toHaveBeenCalledWith("message", undefined);
      expect(toastSuccessMock).toHaveBeenCalledTimes(0);
      expect(toastWarningMock).toHaveBeenCalledTimes(0);
      expect(toastInfoMock).toHaveBeenCalledTimes(0);
    });
  });
});
