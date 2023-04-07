import { describe, expect, it } from "vitest";
import { selectedSliceReducer } from "@src/modules/selectedSlice/reducer";
import {
  addSliceWidgetCreator,
  copyVariationSliceCreator,
  initSliceStoreCreator,
  removeSliceWidgetCreator,
  replaceSliceWidgetCreator,
} from "@src/modules/selectedSlice/actions";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";
import { getSelectedSliceDummyData } from "./__testutils__/getSelectedSliceDummyData";
import { getRefreshStateCreatorPayloadData } from "./__testutils__/getRefreshStateCreatorPayloadData";
import { refreshStateCreator } from "@src/modules/environment";
import { WidgetsArea } from "@lib/models/common/Slice";

const { dummyModelVariationID, dummySliceState } = getSelectedSliceDummyData();

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
        dummySliceState.model.variations[0].primary || [];

      const newWidget: { key: string; value: NestableWidget } = {
        key: "new-widget-text",
        value: {
          type: "Text",
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
          widgetsArea: WidgetsArea.Primary,
          key: newWidget.key,
          value: newWidget.value,
        })
      );
      const primaryWidgets = newState?.model.variations[0].primary;
      expect(primaryWidgets?.length).toEqual(primaryWidgetsInit.length + 1);
      expect(primaryWidgets?.at(-1)?.key).toBe(newWidget.key);
      expect(primaryWidgets?.at(-1)?.value).toBe(newWidget.value);
    });
    it("should update the selected slice state given SLICE/REPLACE_WIDGET action if the tab is found", () => {
      const primaryWidgetsInit =
        dummySliceState.model.variations[0].primary || [];

      const widgetToReplace = primaryWidgetsInit[0];

      const updatedWidget: { key: string; value: NestableWidget } = {
        key: "new_key",
        value: {
          type: "Text",
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
          widgetsArea: WidgetsArea.Primary,
          previousKey: widgetToReplace.key,
          newKey: updatedWidget.key,
          value: updatedWidget.value,
        })
      );

      const primaryWidgets = newState?.model.variations[0].primary;
      expect(primaryWidgets?.length).toEqual(primaryWidgetsInit.length);
      const replacedWidget = primaryWidgets?.find(
        (w) => w.key === updatedWidget.key
      );
      expect(replacedWidget).toBeTruthy();
      expect(replacedWidget?.value).toBe(updatedWidget.value);
    });
    it("should update the selected slice state given SLICE/REMOVE_WIDGET action", () => {
      const primaryWidgetsInit =
        dummySliceState.model.variations[0].primary || [];

      const widgetToDelete = primaryWidgetsInit[0];

      const newState = selectedSliceReducer(
        dummySliceState,
        removeSliceWidgetCreator({
          variationId: dummyModelVariationID,
          widgetsArea: WidgetsArea.Primary,
          key: widgetToDelete.key,
        })
      );

      const primaryWidgets = newState?.model.variations[0].primary;
      expect(primaryWidgets?.length).toEqual(0);
    });
    it("should update the selected slice state given SLICE/COPY_VARIATION action", () => {
      const preVariations = dummySliceState?.model.variations;

      const newState = selectedSliceReducer(
        dummySliceState,
        copyVariationSliceCreator({
          key: "new-variation",
          name: "New Variation",
          copied: dummySliceState.model.variations[0],
        })
      );

      const variations = newState?.model.variations;

      expect(variations?.length).toEqual(preVariations.length + 1);
      expect(variations?.at(-1)?.id).toEqual("new-variation");
      expect(variations?.at(-1)?.name).toEqual("New Variation");
    });

    it("should update the selected slice screenshots given STATE/REFRESH.RESPONSE action if the component is found", () => {
      const action = refreshStateCreator(
        getRefreshStateCreatorPayloadData(
          dummySliceState.from,
          dummySliceState.model.id
        )
      );

      const newState = selectedSliceReducer(dummySliceState, action);

      expect(newState?.screenshots).toEqual({
        "default-slice": {
          hash: "f92c69c60df8fd8eb42902bfb6574776",
          url: "http://localhost:9999/api/__preview?q=default-slice",
        },
      });
    });

    it("should do nothing given STATE/REFRESH.RESPONSE action if the component is not found", () => {
      const action = refreshStateCreator(
        getRefreshStateCreatorPayloadData(
          "unknown-livrary",
          dummySliceState.model.id
        )
      );

      const newState = selectedSliceReducer(dummySliceState, action);

      expect(newState?.screenshots).toEqual({});
      expect(newState).toEqual(dummySliceState);
    });
  });
});
