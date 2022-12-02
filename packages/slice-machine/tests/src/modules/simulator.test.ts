/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { rest, RestContext, RestRequest, ResponseComposition } from "msw";

import {
  initialState,
  simulatorReducer,
  openSetupDrawerCreator,
  closeSetupDrawerCreator,
  toggleSetupDrawerStepCreator,
  connectToSimulatorIframeCreator,
  checkSimulatorSetupCreator,
  failCheckSetupSaga,
  saveSliceMockSaga,
  saveSliceMockCreator,
} from "@src/modules/simulator";
import { SimulatorStoreType, SetupStatus } from "@src/modules/simulator/types";
import { testSaga, expectSaga } from "redux-saga-test-plan";
import {
  getFramework,
  selectIsSimulatorAvailableForFramework,
} from "@src/modules/environment";
import { SaveMockBody } from "../../../server/src/api/slices/save-mock";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";

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
              return res(ctx.json(json.mock));
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
            message: "🎉",
          })
        )
        .put(saveSliceMockCreator.success(payload.payload.mock))
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

      await expectSaga(saveSliceMockSaga, payload)
        .put(
          openToasterCreator({
            type: ToasterType.ERROR,
            message: "💩",
          })
        )
        .put(
          saveSliceMockCreator.failure("Request failed with status code 400")
        )
        .run();

      await new Promise(process.nextTick);

      expect(saveMockSpy).toHaveBeenCalled();
    });
  });
});
