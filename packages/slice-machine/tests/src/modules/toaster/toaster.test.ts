import "@testing-library/jest-dom";

import {
  openToasterCreator,
  openToasterSaga,
  ToasterType,
} from "@src/modules/toaster";
import { testSaga } from "redux-saga-test-plan";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

const toastSuccessMock = toast.success as jest.Mock;
const toastInfoMock = toast.info as jest.Mock;
const toastErrorMock = toast.error as jest.Mock;
const toastWarningMock = toast.warning as jest.Mock;

describe("[Toaster module]", () => {
  describe("[openToasterSaga]", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should call the react-notify with the success method", () => {
      const openToasterAction: ReturnType<typeof openToasterCreator> = {
        payload: {
          message: "message",
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
          message: "message",
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
          message: "message",
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
          message: "message",
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
