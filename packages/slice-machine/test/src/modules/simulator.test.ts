// @vitest-environment jsdom

import { describe, test, expect, it, vi } from "vitest";

import {
  initialState,
  simulatorReducer,
  connectToSimulatorIframeCreator,
  checkSimulatorSetupCreator,
  failCheckSetupSaga,
  saveSliceMockSaga,
  saveSliceMockCreator,
} from "@src/modules/simulator";
import { select } from "redux-saga/effects";
import { testSaga, expectSaga } from "redux-saga-test-plan";
import { checkSetupSaga } from "@src/modules/simulator";
import { SimulatorStoreType } from "@src/modules/simulator/types";

import {
  selectIsSimulatorAvailableForFramework,
  updateManifestCreator,
} from "@src/modules/environment";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { updateSliceMock } from "@src/modules/slices";

import { modalOpenCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { checkSimulatorSetup, getSimulatorSetupSteps } from "@src/apiClient";
import { updateSelectedSliceMocks } from "@src/modules/selectedSlice/actions";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";

const dummySimulatorState: SimulatorStoreType = initialState;

describe("[Simulator module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(simulatorReducer(dummySimulatorState, {})).toEqual(
        dummySimulatorState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        // @ts-expect-error TS(2322) FIXME: Type '"NO.MATCH"' is not assignable to type '"SIMU... Remove this comment to see the full error message
        simulatorReducer(dummySimulatorState, { type: "NO.MATCH" })
      ).toEqual(dummySimulatorState);
    });

    it("should update the state when given checkSimulatorSetupCreator.success action", () => {
      const initialState: SimulatorStoreType = dummySimulatorState;
      const setupStatusResponse: SimulatorStoreType["setupStatus"] = {
        manifest: "ok",
      };
      const setupStepsResponse = [
        {
          title: "foo",
          body: "bar",
          description: "baz",
          isComplete: true,
          validationMessages: [],
        },
      ];

      const action = checkSimulatorSetupCreator.success({
        setupStatus: setupStatusResponse,
        setupSteps: setupStepsResponse,
      });

      const expectedState: SimulatorStoreType = {
        ...dummySimulatorState,
        setupStatus: {
          ...dummySimulatorState.setupStatus,
          ...setupStatusResponse,
        },
        setupSteps: setupStepsResponse,
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
      // @ts-expect-error TS(2345) FIXME: Argument of type 'Error' is not assignable to para... Remove this comment to see the full error message
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
      const response = { manifest: "ok" } as const;
      saga.next(response).call(getSimulatorSetupSteps);
      const response2 = {
        steps: [
          {
            title: "foo",
            body: "bar",
            description: "baz",
            isComplete: true,
            validationMessages: [],
          },
        ],
        errors: [],
      };
      saga.next(response2).put(
        checkSimulatorSetupCreator.success({
          setupStatus: response,
          setupSteps: response2.steps,
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
      const response = { manifest: "ko" } as const;
      saga.next(response).call(getSimulatorSetupSteps);
      const response2 = {
        steps: [
          {
            title: "foo",
            body: "bar",
            description: "baz",
            isComplete: true,
            validationMessages: [],
          },
        ],
        errors: [],
      };
      saga
        .next(response2)
        .call(failCheckSetupSaga, { setupSteps: response2.steps });
      saga.next().isDone();
    });
    it("should open setup modal if checkSimulatorSetupCreator.failure action", () => {
      const payload = {
        setupSteps: [
          {
            title: "foo",
            body: "bar",
            description: "baz",
            isComplete: true,
            validationMessages: [],
          },
        ],
      };

      const saga = testSaga(failCheckSetupSaga, payload);

      saga.next().select(selectIsSimulatorAvailableForFramework);
      saga.next(true).put(
        checkSimulatorSetupCreator.failure({
          setupSteps: payload.setupSteps,
          error: new Error(),
        })
      );
      saga
        .next()
        .put(modalOpenCreator({ modalKey: ModalKeysEnum.SIMULATOR_SETUP }));
    });
  });

  describe("[failCheckSetupSaga]", () => {
    it("stores setup steps even on failure", async () => {
      const payload = {
        setupSteps: [
          {
            title: "foo",
            body: "bar",
            description: "baz",
            isComplete: true,
            validationMessages: [],
          },
        ],
      };

      await expectSaga(failCheckSetupSaga, payload)
        .provide([[select(selectIsSimulatorAvailableForFramework), true]])
        .put(
          checkSimulatorSetupCreator.failure({
            setupSteps: payload.setupSteps,
            error: new Error(),
          })
        )
        .put(
          modalOpenCreator({
            modalKey: ModalKeysEnum.SIMULATOR_SETUP,
          })
        )
        .run();
    });
    it("should early return if the framework doesn't support the simulator feature", () => {
      const payload = {
        setupSteps: [
          {
            title: "foo",
            body: "bar",
            description: "baz",
            isComplete: true,
            validationMessages: [],
          },
        ],
      };

      const saga = testSaga(failCheckSetupSaga, payload);

      saga.next().select(selectIsSimulatorAvailableForFramework);
      saga.next(false).isDone();
    });
  });

  describe("save mocks saga", () => {
    test("success", async (ctx) => {
      const adapter = createTestPlugin({
        setup: ({ hook }) => {
          hook("slice:asset:update", () => void 0);
        },
      });
      const cwd = await createTestProject({ adapter });
      const manager = createSliceMachineManager({
        nativePlugins: { [adapter.meta.name]: adapter },
        cwd,
      });

      await manager.plugins.initPlugins();

      ctx.msw.use(
        createSliceMachineManagerMSWHandler({
          url: "http://localhost:3000/_manager",
          sliceMachineManager: manager,
        })
      );

      const updateSliceMocksSpy = vi.spyOn(manager.slices, "updateSliceMocks");

      const payload = saveSliceMockCreator.request({
        libraryID: "slices",
        sliceID: "MySlice",
        mocks: [],
      });

      await expectSaga(saveSliceMockSaga, payload)
        .put(
          openToasterCreator({
            type: ToasterType.SUCCESS,
            content: "Saved",
          })
        )
        .put(updateSliceMock(payload.payload))
        .put(updateSelectedSliceMocks({ mocks: payload.payload.mocks }))
        .put(saveSliceMockCreator.success())
        .run();

      await new Promise(process.nextTick);

      expect(updateSliceMocksSpy).toHaveBeenCalledWith({
        libraryID: "slices",
        sliceID: "MySlice",
        mocks: [],
      });
    });

    test("failure", async (ctx) => {
      const adapter = createTestPlugin({
        setup: ({ hook }) => {
          hook("slice:asset:update", () => {
            throw new Error("forced failure");
          });
        },
      });
      const cwd = await createTestProject({ adapter });
      const manager = createSliceMachineManager({
        nativePlugins: { [adapter.meta.name]: adapter },
        cwd,
      });

      await manager.plugins.initPlugins();

      ctx.msw.use(
        createSliceMachineManagerMSWHandler({
          url: "http://localhost:3000/_manager",
          sliceMachineManager: manager,
        })
      );

      const updateSliceMocksSpy = vi.spyOn(manager.slices, "updateSliceMocks");

      const payload = saveSliceMockCreator.request({
        libraryID: "slices",
        sliceID: "MySlice",
        mocks: [],
      });

      const errorMessage = "Error saving content";

      await expectSaga(saveSliceMockSaga, payload)
        .put(
          openToasterCreator({
            type: ToasterType.ERROR,
            content: errorMessage,
          })
        )
        .put(saveSliceMockCreator.failure())
        .run();

      await new Promise(process.nextTick);

      expect(updateSliceMocksSpy).toHaveBeenCalled();
    });
  });
});
