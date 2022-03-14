import type Models from "@slicemachine/core/build/models";
import {
  VariationAsArray,
  VariationAsObject,
} from "@slicemachine/core/build/models";
("./CustomType/fields");

import camelCase from "lodash/camelCase";

export const Variation = {
  generateId(str: string): string {
    return camelCase(str);
  },

  toObject(variation: Models.VariationAsArray): Models.VariationAsObject {
    return {
      ...variation,
      primary: variation.primary?.reduce(
        (acc, { key, value }) => ({ ...acc, [key]: value }),
        {}
      ),
      items: variation.items?.reduce(
        (acc, { key, value }) => ({ ...acc, [key]: value }),
        {}
      ),
    };
  },

  toArray(variation: Models.VariationAsObject): Models.VariationAsArray {
    return {
      ...variation,
      primary: Object.entries(variation.primary || {}).map(([key, value]) => ({
        key,
        value,
      })),
      items: Object.entries(variation.items || {}).map(([key, value]) => ({
        key,
        value,
      })),
    };
  },

  reorderWidget(
    variation: Models.VariationAsArray,
    widgetsArea: Models.WidgetsArea,
    start: number,
    end: number
  ): Models.VariationAsArray {
    const widgets = variation[widgetsArea] || [];
    const reorderedWidget:
      | { key: string; value: Models.CustomType.Fields.Field }
      | undefined = widgets && widgets[start];
    if (!reorderedWidget)
      throw new Error(
        `Unable to reorder the widget at index ${start}. the list of widgets contains only ${widgets.length} elements.`
      );

    const reorderedArea = widgets.reduce<Models.AsArray>(
      (acc, widget, index) => {
        const elems = [widget, reorderedWidget];
        switch (index) {
          case start:
            return acc;
          case end:
            return [...acc, ...(end > start ? elems : elems.reverse())];
          default:
            return [...acc, widget];
        }
      },
      []
    );
    return {
      ...variation,
      [widgetsArea]: reorderedArea,
    };
  },

  replaceWidget(
    variation: Models.VariationAsArray,
    widgetsArea: Models.WidgetsArea,
    previousKey: string,
    newKey: string,
    newValue: Models.CustomType.Fields.Field
  ): Models.VariationAsArray {
    const widgets = variation[widgetsArea] || [];

    return {
      ...variation,
      [widgetsArea]: widgets.reduce((acc: Models.AsArray, { key, value }) => {
        if (key === previousKey) {
          return acc.concat([{ key: newKey, value: newValue }]);
        } else {
          return acc.concat([{ key, value }]);
        }
      }, []),
    };
  },

  addWidget(
    variation: Models.VariationAsArray,
    widgetsArea: Models.WidgetsArea,
    key: string,
    value: Models.CustomType.Fields.Field
  ): Models.VariationAsArray {
    return {
      ...variation,
      [widgetsArea]: variation[widgetsArea]?.concat([{ key, value }]),
    };
  },

  deleteWidget(
    variation: Models.VariationAsArray,
    widgetsArea: Models.WidgetsArea,
    widgetKey: string
  ): Models.VariationAsArray {
    return {
      ...variation,
      [widgetsArea]: variation[widgetsArea]?.filter(
        ({ key }) => widgetKey !== key
      ),
    };
  },

  copyValue<T extends VariationAsObject | VariationAsArray>(
    variation: T,
    key: string,
    name: string
  ): T {
    return {
      ...variation,
      id: key,
      name,
    };
  },
};
