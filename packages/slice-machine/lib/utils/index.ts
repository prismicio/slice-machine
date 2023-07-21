import * as yup from "yup";

import { Widget } from "../models/common/widgets/Widget";

import { DefaultFields } from "../forms/defaults";
import { createInitialValues, createValidationSchema } from "../forms";
import { FieldType } from "@prismicio/types-internal/lib/customtypes";
import { DropResult } from "react-beautiful-dnd";

export const removeProp = (obj: { [x: string]: unknown }, prop: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [prop]: __removed, ...rest } = obj;
  return rest;
};

export const ensureDnDDestination = (result: DropResult): boolean => {
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
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!widget) {
    console.log(`Could not find widget with type name "${type}".`);
    return true;
  }
  return false;
};

export const createDefaultWidgetValues = (TYPE_NAME: FieldType) => ({
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
