import {
  initialState,
  previewReducer,
  openSetupPreviewDrawerCreator,
  closeSetupPreviewDrawerCreator,
  toggleSetupDrawerStepCreator,
  checkPreviewSetupCreator,
} from "@src/modules/preview";
import { PreviewStoreType, SetupStatus } from "@src/modules/preview/types";

const dummyPreviewState: PreviewStoreType = initialState;

describe("[Preview module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(previewReducer(dummyPreviewState, {})).toEqual(dummyPreviewState);
    });

    it("should return the initial state if no matching action", () => {
      expect(previewReducer(dummyPreviewState, { type: "NO.MATCH" })).toEqual(
        dummyPreviewState
      );
    });

    it("should update the state when given checkPreviewSetupCreator.success action", () => {
      const initialState: PreviewStoreType = dummyPreviewState;
      const setupStatusResponse: SetupStatus = {
        manifest: "ok",
        iframe: null,
        dependencies: "ko",
      };

      const action = checkPreviewSetupCreator.success({
        setupStatus: setupStatusResponse,
      });

      const expectedState: PreviewStoreType = {
        ...dummyPreviewState,
        setupStatus: {
          ...dummyPreviewState.setupStatus,
          ...setupStatusResponse,
        },
      };

      expect(previewReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update the state when given openSetupPreviewDrawerCreator action", () => {
      const initialState: PreviewStoreType = dummyPreviewState;

      const action = openSetupPreviewDrawerCreator({});

      const expectedState: PreviewStoreType = {
        ...dummyPreviewState,
        setupDrawer: {
          ...dummyPreviewState.setupDrawer,
          isOpen: true,
        },
      };

      expect(previewReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update the state when given openSetupPreviewDrawerCreator action with a step to open", () => {
      const initialState: PreviewStoreType = dummyPreviewState;

      const action = openSetupPreviewDrawerCreator({ stepToOpen: 2 });

      const expectedState: PreviewStoreType = {
        ...dummyPreviewState,
        setupDrawer: {
          ...dummyPreviewState.setupDrawer,
          openedStep: 2,
          isOpen: true,
        },
      };

      expect(previewReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update the state to false when given closeSetupPreviewDrawerCreator action", () => {
      const initialState: PreviewStoreType = {
        ...dummyPreviewState,
        setupDrawer: {
          openedStep: 0,
          isOpen: true,
        },
      };

      const action = closeSetupPreviewDrawerCreator();

      expect(previewReducer(initialState, action)).toEqual(dummyPreviewState);
    });

    it("should update the state to false when given toggleSetupDrawerStepCreator action", () => {
      const initialState: PreviewStoreType = dummyPreviewState;

      const action = toggleSetupDrawerStepCreator({ stepNumber: 1 });

      const expectedState: PreviewStoreType = {
        ...dummyPreviewState,
        setupDrawer: {
          ...dummyPreviewState.setupDrawer,
          openedStep: 1,
        },
      };

      expect(previewReducer(initialState, action)).toEqual(expectedState);
      // We check that if we call again the toggle action we go back to the initial state
      expect(previewReducer(expectedState, action)).toEqual(initialState);
    });
  });
});
