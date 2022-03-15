import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import type Models from "@slicemachine/core/build/src/models";
import { VariationSM, FieldsSM } from "@slicemachine/core/build/src/models";
("./CustomType/fields");

import camelCase from "lodash/camelCase";

export const Variation = {
  generateId(str: string): string {
    return camelCase(str);
  },

  reorderWidget(
    variation: VariationSM,
    widgetsArea: Models.WidgetsArea,
    start: number,
    end: number
  ): VariationSM {
    const widgets = variation[widgetsArea] || [];
    const reorderedWidget: { key: string; value: NestableWidget } | undefined =
      widgets && widgets[start];
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
    widgetsArea: Models.WidgetsArea,
    previousKey: string,
    newKey: string,
    newValue: NestableWidget
  ): VariationSM {
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
    widgetsArea: Models.WidgetsArea,
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
    widgetsArea: Models.WidgetsArea,
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
