import * as yup from "yup";

import { Widget } from "../models/common/widgets/Widget";
import { Frameworks } from "@slicemachine/core/build/models/Framework";

import { DefaultFields } from "../forms/defaults";
import { createInitialValues, createValidationSchema } from "../forms";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import type { DropResult } from "react-beautiful-dnd";

export const removeProp = (obj: { [x: string]: unknown }, prop: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [prop]: __removed, ...rest } = obj;
  return rest;
};

export const ensureDnDDestination = (
  result: Pick<DropResult, "destination" | "source">
): result is {
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
