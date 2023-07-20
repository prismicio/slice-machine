import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";
import { VariationSM, WidgetsArea } from "./Slice";
import { FieldsSM } from "./Fields";

import camelCase from "lodash/camelCase";

export const Variation = {
  generateId(str: string): string {
    return camelCase(str);
  },

  reorderWidget(
    variation: VariationSM,
    widgetsArea: WidgetsArea,
    start: number,
    end: number
  ): VariationSM {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const widgets = variation[widgetsArea] || [];
    const reorderedWidget: { key: string; value: NestableWidget } | undefined =
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      widgets && widgets[start];
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!reorderedWidget)
      throw new Error(
        `Unable to reorder the widget at index ${start}. the list of widgets contains only ${widgets.length} elements.`
      );

    const reorderedArea = widgets.reduce<FieldsSM>((acc, widget, index) => {
      const elems = [widget, reorderedWidget];
      switch (index) {
        case start:
          return acc;
        case end:
          return [...acc, ...(end > start ? elems : elems.reverse())];
        default:
          return [...acc, widget];
      }
    }, []);
    return {
      ...variation,
      [widgetsArea]: reorderedArea,
    };
  },

  replaceWidget(
    variation: VariationSM,
    widgetsArea: WidgetsArea,
    previousKey: string,
    newKey: string,
    newValue: NestableWidget
  ): VariationSM {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const widgets = variation[widgetsArea] || [];

    return {
      ...variation,
      [widgetsArea]: widgets.reduce((acc: FieldsSM, { key, value }) => {
        if (key === previousKey) {
          return acc.concat([{ key: newKey, value: newValue }]);
        } else {
          return acc.concat([{ key, value }]);
        }
      }, []),
    };
  },

  addWidget(
    variation: VariationSM,
    widgetsArea: WidgetsArea,
    key: string,
    value: NestableWidget
  ): VariationSM {
    return {
      ...variation,
      [widgetsArea]: variation[widgetsArea]?.concat([{ key, value }]),
    };
  },

  deleteWidget(
    variation: VariationSM,
    widgetsArea: WidgetsArea,
    widgetKey: string
  ): VariationSM {
    return {
      ...variation,
      [widgetsArea]: variation[widgetsArea]?.filter(
        ({ key }) => widgetKey !== key
      ),
    };
  },

  copyValue(variation: VariationSM, key: string, name: string): VariationSM {
    return {
      ...variation,
      id: key,
      name,
    };
  },
};
