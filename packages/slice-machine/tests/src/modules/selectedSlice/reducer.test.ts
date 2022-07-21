import "@testing-library/jest-dom";
import { LibStatus } from "@lib/models/common/ComponentUI";
import { selectedSliceReducer } from "@src/modules/selectedSlice/reducer";
import {
  addSliceWidgetCreator,
  copyVariationSliceCreator,
  deleteSliceWidgetMockCreator,
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
  initSliceStoreCreator,
  pushSliceCreator,
  removeSliceWidgetCreator,
  replaceSliceWidgetCreator,
  saveSliceCreator,
  updateSliceWidgetMockCreator,
} from "@src/modules/selectedSlice/actions";
import { Models } from "@slicemachine/core";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { getSelectedSliceDummyData } from "./utils";

const {
  dummyModelVariationID,
  dummyComponentUI,
  dummyMockConfig,
  dummySliceState,
} = getSelectedSliceDummyData();

describe("[Selected Slice module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no matching action", () => {
      expect(
        // @ts-expect-error the NO.MATCH is not a valid action type
        selectedSliceReducer(dummySliceState, { type: "NO.MATCH" })
      ).toEqual(dummySliceState);
      expect(
        // @ts-expect-error the NO.MATCH is not a valid action type
        selectedSliceReducer(null, { type: "NO.MATCH" })
      ).toEqual(null);
    });

    it("should update the selected slice state given SELECTED_SLICE/INIT action", () => {
      expect(
        selectedSliceReducer(null, initSliceStoreCreator(dummySliceState))
      ).toEqual(dummySliceState);
    });
    it("should update the selected slice state given SLICE/ADD_WIDGET action", () => {
      const primaryWidgetsInit =
        dummySliceState.component.model.variations[0].primary || [];

      const newWidget: { key: string; value: NestableWidget } = {
        key: "new-widget-text",
        value: {
          type: WidgetTypes.Text,
          config: {
            label: "newWidgetText",
            placeholder: "",
          },
        },
      };

      const newState = selectedSliceReducer(
        dummySliceState,
        addSliceWidgetCreator({
          variationId: dummyModelVariationID,
          widgetsArea: Models.WidgetsArea.Primary,
          key: newWidget.key,
          value: newWidget.value,
        })
      );
      const primaryWidgets = newState?.component.model.variations[0].primary;
      expect(primaryWidgets?.length).toEqual(primaryWidgetsInit.length + 1);
      expect(primaryWidgets?.at(-1)?.key).toBe(newWidget.key);
      expect(primaryWidgets?.at(-1)?.value).toBe(newWidget.value);
      expect(newState?.component.__status).toBe(LibStatus.NewSlice);
    });
    it("should update the selected slice state given SLICE/REPLACE_WIDGET action if the tab is found", () => {
      const primaryWidgetsInit =
        dummySliceState.component.model.variations[0].primary || [];

      const widgetToReplace = primaryWidgetsInit[0];

      const updatedWidget: { key: string; value: NestableWidget } = {
        key: "new_key",
        value: {
          type: WidgetTypes.Text,
          config: {
            label: "newWidgetText",
            placeholder: "",
          },
        },
      };

      const newState = selectedSliceReducer(
        dummySliceState,
        replaceSliceWidgetCreator({
          variationId: dummyModelVariationID,
          widgetsArea: Models.WidgetsArea.Primary,
          previousKey: widgetToReplace.key,
          newKey: updatedWidget.key,
          value: updatedWidget.value,
        })
      );

      const primaryWidgets = newState?.component.model.variations[0].primary;
      expect(primaryWidgets?.length).toEqual(primaryWidgetsInit.length);
      const replacedWidget = primaryWidgets?.find(
        (w) => w.key === updatedWidget.key
      );
      expect(replacedWidget).toBeTruthy();
      expect(replacedWidget?.value).toBe(updatedWidget.value);
      expect(newState?.component.__status).toBe(LibStatus.NewSlice);
    });
    it("should update the selected slice state given SLICE/REMOVE_WIDGET action", () => {
      const primaryWidgetsInit =
        dummySliceState.component.model.variations[0].primary || [];

      const widgetToDelete = primaryWidgetsInit[0];

      const newState = selectedSliceReducer(
        dummySliceState,
        removeSliceWidgetCreator({
          variationId: dummyModelVariationID,
          widgetsArea: Models.WidgetsArea.Primary,
          key: widgetToDelete.key,
        })
      );

      const primaryWidgets = newState?.component.model.variations[0].primary;
      expect(primaryWidgets?.length).toEqual(0);
      expect(newState?.component.__status).toBe(LibStatus.NewSlice);
    });
    it("should update the selected slice state given SLICE/UPDATE_WIDGET_MOCK action", () => {
      const newState = selectedSliceReducer(
        dummySliceState,
        updateSliceWidgetMockCreator({
          variationId: dummyModelVariationID,
          mockConfig: dummyMockConfig,
          widgetArea: Models.WidgetsArea.Primary,
          previousKey: "section_title",
          newKey: "section_title",
          mockValue: {
            content: "NewContent",
          },
        })
      );

      expect(newState?.component.mockConfig["default-slice"].primary).toEqual({
        section_title: { content: "NewContent" },
      });
      expect(newState?.component.__status).toBe(LibStatus.NewSlice);
    });
    it("should update the selected slice state given SLICE/DELETE_WIDGET_MOCK action", () => {
      const newState = selectedSliceReducer(
        dummySliceState,
        deleteSliceWidgetMockCreator({
          variationId: dummyModelVariationID,
          mockConfig: dummyMockConfig,
          widgetArea: Models.WidgetsArea.Primary,
          newKey: "section_title",
        })
      );

      expect(newState?.component.mockConfig["default-slice"].primary).toEqual({
        section_title: undefined,
      });
      expect(newState?.component.__status).toBe(LibStatus.NewSlice);
    });
    it("should update the selected slice state given SLICE/GENERATE_SCREENSHOT action", () => {
      const screenshots = {
        [dummyModelVariationID]: {
          path: "screenshotPath",
          url: "screenshotUrl",
        },
      };

      const newState = selectedSliceReducer(
        dummySliceState,
        generateSliceScreenshotCreator.success({
          screenshots: screenshots,
          component: dummyComponentUI,
        })
      );

      expect(newState?.component.screenshotUrls).toEqual(screenshots);
      expect(newState?.component.__status).toBe(LibStatus.Modified);
    });
    it("should update the selected slice state given SLICE/GENERATE_CUSTOM_SCREENSHOT action", () => {
      const screenshotUI = { path: "screenshotPath", url: "screenshotUrl" };
      const newState = selectedSliceReducer(
        dummySliceState,
        generateSliceCustomScreenshotCreator.success({
          variationId: dummyModelVariationID,
          screenshot: { path: "screenshotPath", url: "screenshotUrl" },
          component: dummyComponentUI,
        })
      );

      expect(newState?.component.screenshotUrls).toEqual({
        [dummyModelVariationID]: screenshotUI,
      });
      expect(newState?.component.__status).toBe(LibStatus.Modified);
    });
    it("should update the selected slice state given SLICE/SAVE action when variations are the same", () => {
      const newStateToSave = { ...dummySliceState, mockConfig: {} };
      const newState = selectedSliceReducer(
        dummySliceState,
        saveSliceCreator.success({
          extendedComponent: newStateToSave,
          librarySliceVariations: dummySliceState.component.model.variations,
        })
      );

      const expectedState = {
        ...newStateToSave,
        component: { ...newStateToSave.component, __status: LibStatus.Synced },
      };

      expect(newState).not.toEqual(dummySliceState);
      expect(newState).toEqual(expectedState);
    });
    it("should update the selected slice state given SLICE/SAVE action when variations are different", () => {
      const newStateToSave = { ...dummySliceState, mockConfig: {} };
      const newState = selectedSliceReducer(
        dummySliceState,
        saveSliceCreator.success({
          extendedComponent: newStateToSave,
          librarySliceVariations: [],
        })
      );

      const expectedState = {
        ...newStateToSave,
        component: {
          ...newStateToSave.component,
          __status: LibStatus.Modified,
        },
      };

      expect(newState).not.toEqual(dummySliceState);
      expect(newState).toEqual(expectedState);
    });
    it("should update the selected slice state given SLICE/PUSH action", () => {
      const newState = selectedSliceReducer(
        dummySliceState,
        pushSliceCreator.success({ extendedComponent: dummySliceState })
      );

      const expectedState = {
        ...dummySliceState,
        component: { ...dummySliceState.component, __status: LibStatus.Synced },
      };

      expect(newState).toEqual(expectedState);
    });
    it("should update the selected slice state given SLICE/COPY_VARIATION action", () => {
      const preVariations = dummySliceState?.component.model.variations;

      const newState = selectedSliceReducer(
        dummySliceState,
        copyVariationSliceCreator({
          key: "new-variation",
          name: "New Variation",
          copied: dummySliceState.component.model.variations[0],
        })
      );

      const variations = newState?.component.model.variations;

      expect(variations?.length).toEqual(preVariations.length + 1);
      expect(variations?.at(-1)?.id).toEqual("new-variation");
      expect(variations?.at(-1)?.name).toEqual("New Variation");
      expect(newState?.component.__status).toBe(LibStatus.NewSlice);
    });
  });
});
