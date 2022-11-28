import "@testing-library/jest-dom";

import {
  initialState,
  simulatorReducer,
  connectToSimulatorIframeCreator,
  checkSimulatorSetupCreator,
  failCheckSetupSaga,
  checkSetupSaga,
  trackOpenSetupModalSaga,
} from "@src/modules/simulator";
import { SimulatorStoreType } from "@src/modules/simulator/types";
import { testSaga } from "redux-saga-test-plan";
import {
  getFramework,
  selectIsSimulatorAvailableForFramework,
  updateManifestCreator,
} from "@src/modules/environment";

import { modalOpenCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { checkSimulatorSetup } from "@src/apiClient";

const dummySimulatorState: SimulatorStoreType = initialState;

describe("[Simulator module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(simulatorReducer(dummySimulatorState, {})).toEqual(
        dummySimulatorState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        simulatorReducer(dummySimulatorState, { type: "NO.MATCH" })
      ).toEqual(dummySimulatorState);
    });

    it("should update the state when given checkSimulatorSetupCreator.success action", () => {
      const initialState: SimulatorStoreType = dummySimulatorState;
      const setupStatusResponse: SimulatorStoreType["setupStatus"] = {
        manifest: "ok",
      };

      const action = checkSimulatorSetupCreator.success({
        setupStatus: setupStatusResponse,
      });

      const expectedState: SimulatorStoreType = {
        ...dummySimulatorState,
        setupStatus: {
          ...dummySimulatorState.setupStatus,
          ...setupStatusResponse,
        },
      };

      expect(simulatorReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update the state when given connectToSimulatorIframeCreator.success action", () => {
      const initialState: SimulatorStoreType = dummySimulatorState;

      const action = connectToSimulatorIframeCreator.success();

      const expectedState: SimulatorStoreType = {
        ...dummySimulatorState,
        iframeStatus: "ok",
      };

      expect(simulatorReducer(initialState, action)).toEqual(expectedState);
    });

    it("should set manifest status to ko if checkSimulatorSetupCreator.failure action", () => {
      const initialState: SimulatorStoreType = dummySimulatorState;
      const action = checkSimulatorSetupCreator.failure(new Error("Error"));

      const expectedState: SimulatorStoreType = {
        ...dummySimulatorState,
        setupStatus: {
          manifest: "ko",
        },
      };

      expect(simulatorReducer(initialState, action)).toEqual(expectedState);
    });
    it("should call the api and dispatch the success action", () => {
      const setupSimulatorAction: ReturnType<
        typeof checkSimulatorSetupCreator.request
      > = {
        payload: {},
        type: "SIMULATOR/CHECK_SETUP.REQUEST",
      };
      const saga = testSaga(checkSetupSaga, setupSimulatorAction);
      saga.next().call(checkSimulatorSetup);
      const response = { data: { manifest: "ok" } };
      saga.next(response).put(
        checkSimulatorSetupCreator.success({
          setupStatus: { manifest: "ok" },
        })
      );
      saga.next().put(updateManifestCreator({ value: undefined }));
      saga.next().isDone();
    });
    it("should call the api and dispatch the failure action", () => {
      const setupSimulatorAction: ReturnType<
        typeof checkSimulatorSetupCreator.request
      > = {
        payload: {},
        type: "SIMULATOR/CHECK_SETUP.REQUEST",
      };
      const saga = testSaga(checkSetupSaga, setupSimulatorAction);
      saga.next().call(checkSimulatorSetup);
      const response = { data: { manifest: "ko" } };
      saga.next(response).call(failCheckSetupSaga);
      saga.next().call(trackOpenSetupModalSaga);
      saga.next().isDone();
    });
    it("should open setup modal if checkSimulatorSetupCreator.failure action", () => {
      const saga = testSaga(failCheckSetupSaga);

      saga.next().select(getFramework);
      saga.next("next").select(selectIsSimulatorAvailableForFramework);
      saga.next(true).put(checkSimulatorSetupCreator.failure(new Error()));
      saga
        .next()
        .put(modalOpenCreator({ modalKey: ModalKeysEnum.SIMULATOR_SETUP }));
    });
  });

  describe("[failCheckSetupSaga]", () => {
    it("should early return if the framework doesn't support the simulator feature", () => {
      const saga = testSaga(failCheckSetupSaga);

      saga.next().select(getFramework);
      saga.next("next").select(selectIsSimulatorAvailableForFramework);
      saga.next(false).isDone();
    });
  });
});
