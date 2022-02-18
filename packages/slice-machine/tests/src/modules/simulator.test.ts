import "@testing-library/jest-dom";

import {
  initialState,
  simulatorReducer,
  openSetupDrawerCreator,
  closeSetupDrawerCreator,
  toggleSetupDrawerStepCreator,
  connectToSimulatorIframeCreator,
  checkSimulatorSetupCreator,
  failCheckSetupSaga,
} from "@src/modules/simulator";
import { SimulatorStoreType, SetupStatus } from "@src/modules/simulator/types";
import { testSaga } from "redux-saga-test-plan";
import {
  getFramework,
  selectIsSimulatorAvailableForFramework,
} from "@src/modules/environment";

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
      const setupStatusResponse: SetupStatus = {
        manifest: "ok",
        iframe: null,
        dependencies: "ko",
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
        setupStatus: {
          ...dummySimulatorState.setupStatus,
          iframe: "ok",
        },
      };

      expect(simulatorReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update the state when given connectToSimulatorIframeCreator.failure action", () => {
      const initialState: SimulatorStoreType = dummySimulatorState;

      const action = connectToSimulatorIframeCreator.failure();

      const expectedState: SimulatorStoreType = {
        ...dummySimulatorState,
        setupStatus: {
          ...dummySimulatorState.setupStatus,
          iframe: "ko",
        },
      };

      expect(simulatorReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update the state when given openSetupDrawerCreator action", () => {
      const initialState: SimulatorStoreType = dummySimulatorState;

      const action = openSetupDrawerCreator({});

      const expectedState: SimulatorStoreType = {
        ...dummySimulatorState,
        setupDrawer: {
          ...dummySimulatorState.setupDrawer,
          isOpen: true,
        },
      };

      expect(simulatorReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update the state when given openSetupDrawerCreator action with a step to open", () => {
      const initialState: SimulatorStoreType = dummySimulatorState;

      const action = openSetupDrawerCreator({ stepToOpen: 2 });

      const expectedState: SimulatorStoreType = {
        ...dummySimulatorState,
        setupDrawer: {
          ...dummySimulatorState.setupDrawer,
          openedStep: 2,
          isOpen: true,
        },
      };

      expect(simulatorReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update the state to false when given closeSetupSimulatorDrawerCreator action", () => {
      const initialState: SimulatorStoreType = {
        ...dummySimulatorState,
        setupDrawer: {
          openedStep: 0,
          isOpen: true,
        },
      };

      const action = closeSetupDrawerCreator();

      expect(simulatorReducer(initialState, action)).toEqual(
        dummySimulatorState
      );
    });

    it("should update the state to false when given toggleSetupDrawerStepCreator action", () => {
      const initialState: SimulatorStoreType = dummySimulatorState;

      const action = toggleSetupDrawerStepCreator({ stepNumber: 1 });

      const expectedState: SimulatorStoreType = {
        ...dummySimulatorState,
        setupDrawer: {
          ...dummySimulatorState.setupDrawer,
          openedStep: 1,
        },
      };

      expect(simulatorReducer(initialState, action)).toEqual(expectedState);
      // We check that if we call again the toggle action we go back to the initial state
      expect(simulatorReducer(expectedState, action)).toEqual(initialState);
    });
  });

  describe("[failCheckSetupSaga]", () => {
    it("should early return if the framework don't support the simulator feature", () => {
      const saga = testSaga(failCheckSetupSaga);

      saga.next().select(getFramework);
      saga.next("next").select(selectIsSimulatorAvailableForFramework);
      saga.next(false).isDone();
    });
    it("should open the fourth step on next", () => {
      const saga = testSaga(failCheckSetupSaga);

      saga.next().select(getFramework);
      saga.next("next").select(selectIsSimulatorAvailableForFramework);
      saga.next(true).put(openSetupDrawerCreator({ stepToOpen: 4 }));
      saga.next().isDone();
    });
    it("should open the fifth step on nuxt", () => {
      const saga = testSaga(failCheckSetupSaga);

      saga.next().select(getFramework);
      saga.next("nuxt").select(selectIsSimulatorAvailableForFramework);
      saga.next(true).put(openSetupDrawerCreator({ stepToOpen: 5 }));
      saga.next().isDone();
    });
  });
});
