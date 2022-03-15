import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import type Models from "@slicemachine/core/build/src/models";
import {
  ActionType as VariationActions,
  updateWidgetMockConfig,
  deleteWidgetMockConfig,
  generateCustomScreenShot,
  generateScreenShot,
} from "./variation/actions";

import { ActionType as SliceActions, saveSlice, pushSlice } from "./actions";

import Store from "@lib/models/ui/Store";
import { VariationSM } from "@slicemachine/core/build/src/models";

export default class SliceStore implements Store {
  constructor(
    readonly dispatch: ({
      type,
      payload,
    }: {
      type: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload?: any;
    }) => void
  ) {}

  reset = (): void => {
    this.dispatch({ type: SliceActions.Reset });
  };
  save = saveSlice(this.dispatch);
  push = pushSlice(this.dispatch);
  updateMetadata = (value: Models.ComponentMetadata): void =>
    this.dispatch({ type: SliceActions.UpdateMetadata, payload: value });
  copyVariation = (key: string, name: string, copied: VariationSM): void =>
    this.dispatch({
      type: SliceActions.CopyVariation,
      payload: { key, name, copied },
    });

  // eslint-disable-next-line @typescript-eslint/ban-types
  variation = (variationId: string): Record<string, Function> => {
    return {
      generateScreenShot: generateScreenShot(this.dispatch)(variationId),
      generateCustomScreenShot: generateCustomScreenShot(this.dispatch)(
        variationId
      ),
      addWidget: (
        widgetsArea: Models.WidgetsArea,
        key: string,
        value: NestableWidget
      ): void => {
        this.dispatch({
          type: VariationActions.AddWidget,
          payload: { variationId, widgetsArea, key, value },
        });
      },
      replaceWidget: (
        widgetsArea: Models.WidgetsArea,
        previousKey: string,
        newKey: string,
        value: NestableWidget
      ): void => {
        this.dispatch({
          type: VariationActions.ReplaceWidget,
          payload: { variationId, widgetsArea, previousKey, newKey, value },
        });
      },
      reorderWidget: (
        widgetsArea: Models.WidgetsArea,
        start: number,
        end: number
      ): void => {
        this.dispatch({
          type: VariationActions.ReorderWidget,
          payload: { variationId, widgetsArea, start, end },
        });
      },
      removeWidget: (widgetsArea: Models.WidgetsArea, key: string): void => {
        this.dispatch({
          type: VariationActions.RemoveWidget,
          payload: { variationId, widgetsArea, key },
        });
      },
      updateWidgetMockConfig: updateWidgetMockConfig(this.dispatch)(
        variationId
      ),
      deleteWidgetMockConfig: deleteWidgetMockConfig(this.dispatch)(
        variationId
      ),
    };
  };
}
