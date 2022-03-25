import * as yup from "yup";
import equal from "fast-deep-equal";

import { Widget } from "../models/common/widgets/Widget";
import { Frameworks } from "@slicemachine/core/build/models/Framework";

import { DefaultFields } from "../forms/defaults";
import { createInitialValues, createValidationSchema } from "../forms";
import { VariationSM } from "@slicemachine/core/build/src/models";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

export const removeProp = (obj: { [x: string]: unknown }, prop: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [prop]: __removed, ...rest } = obj;
  return rest;
};

export const ensureDnDDestination = (result: {
  destination?: { droppableId: string; index: number };
  source: { index: number; droppableId: string };
}): result is {
  destination: undefined;
  source: { index: number; droppableId: string };
} => {
  if (!result.destination || result.source.index === result.destination.index) {
    return true;
  }
  if (result.source.droppableId !== result.destination.droppableId) {
    return true;
  }
  return false;
};

export const ensureWidgetTypeExistence = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
  Widgets: { [x: string]: Widget<any, any> },
  type: string
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
  const widget: Widget<any, any> = Widgets[type];
  if (!widget) {
    console.log(`Could not find widget with type name "${type}".`);
    return true;
  }
  return false;
};

export const compareVariations = (
  lhs: ReadonlyArray<VariationSM>,
  rhs: ReadonlyArray<VariationSM>
) => {
  return equal(
    lhs.map((e) => ({ ...e, imageUrl: undefined })),
    rhs.map((e) => ({ ...e, imageUrl: undefined }))
  );
};
export const createDefaultWidgetValues = (TYPE_NAME: WidgetTypes) => ({
  TYPE_NAME,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  FormFields: DefaultFields,
  schema: yup.object().shape({
    type: yup.string().test({
      name: "type",
      test: function (value) {
        return value === TYPE_NAME;
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    config: createValidationSchema(removeProp(DefaultFields, "id")),
  }),
  create: () => ({
    type: TYPE_NAME,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    config: createInitialValues(removeProp(DefaultFields, "id")),
  }),
});

export const createDefaultHandleMockContentFunction = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
  widget: Widget<any, any>,
  TYPE_NAME: string,
  checkFn: ({}, {}) => boolean
) => {
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/ban-types
  return function handleMockContent(mockContent: {}, config: {}) {
    if (!checkFn(mockContent, config)) {
      console.error(
        `Type check for type "${TYPE_NAME}" failed. Using default mock configuration`
      );
      if (widget.handleMockConfig) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return widget.handleMockConfig(null, config);
      }
    }
    return mockContent;
  };
};

export const sanitizeSbId = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const simulatorIsSupported = (framework: Frameworks) => {
  return [
    Frameworks.next,
    Frameworks.nuxt,
    Frameworks.previousNext,
    Frameworks.previousNuxt,
  ].includes(framework);
};
