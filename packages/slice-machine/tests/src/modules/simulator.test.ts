/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { rest, RestContext, RestRequest, ResponseComposition } from "msw";

import {
  initialState,
  simulatorReducer,
  connectToSimulatorIframeCreator,
  checkSimulatorSetupCreator,
  failCheckSetupSaga,
  saveSliceMockSaga,
  saveSliceMockCreator,
} from "@src/modules/simulator";
import { testSaga, expectSaga } from "redux-saga-test-plan";
import {
  checkSetupSaga,
  trackOpenSetupModalSaga,
} from "@src/modules/simulator";
import { SimulatorStoreType } from "@src/modules/simulator/types";

import {
  selectIsSimulatorAvailableForFramework,
  updateManifestCreator,
} from "@src/modules/environment";
import { SaveMockBody } from "../../../server/src/api/slices/save-mock";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { updateSliceMock } from "@src/modules/slices";

import { modalOpenCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { checkSimulatorSetup } from "@src/apiClient";
import { updateSelectedSliceMocks } from "@src/modules/selectedSlice/actions";

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

      saga.next("vue").select(selectIsSimulatorAvailableForFramework);
      saga.next(false).isDone();
    });
  });

  describe("save mocks saga", () => {
    const server = setupServer();

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    test("success", async () => {
      const saveMockSpy = jest.fn(
        (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return req.json().then((json) => {
            const result = SaveMockBody.decode(json);
            if (result._tag === "Right") {
              return res(ctx.json(json));
            }
            return res(ctx.status(400));
          });
        }
      );

      server.use(rest.post("/api/slices/mock", saveMockSpy));

      const payload = saveSliceMockCreator.request({
        sliceName: "MySlice",
        libraryName: "slices",
        mock: [],
      });

      await expectSaga(saveSliceMockSaga, payload)
        .put(
          openToasterCreator({
            type: ToasterType.SUCCESS,
            message: "Saved",
          })
        )
        .put(updateSliceMock(payload.payload))
        .put(updateSelectedSliceMocks({ mocks: payload.payload.mock }))
        .put(saveSliceMockCreator.success())
        .run();

      await new Promise(process.nextTick);

      expect(saveMockSpy).toHaveBeenCalled();
    });

    test("failure", async () => {
      const saveMockSpy = jest.fn(
        (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
          return res(ctx.status(400));
        }
      );

      server.use(rest.post("/api/slices/mock", saveMockSpy));

      const payload = saveSliceMockCreator.request({
        sliceName: "MySlice",
        libraryName: "slices",
        mock: [],
      });

      const errorMessage = "Request failed with status code 400";

      await expectSaga(saveSliceMockSaga, payload)
        .put(
          openToasterCreator({
            type: ToasterType.ERROR,
            message: errorMessage,
          })
        )
        .put(saveSliceMockCreator.failure())
        .run();

      await new Promise(process.nextTick);

      expect(saveMockSpy).toHaveBeenCalled();
    });
  });
});
