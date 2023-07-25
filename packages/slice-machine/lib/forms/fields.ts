import { FormTypes } from "./types";

import { createValidationArgs } from ".";

export const CheckBox = (
  label: string,
  required = true,
  defaultValue = true
) => ({
  type: FormTypes.CHECKBOX,
  validate: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    required: createValidationArgs(required, defaultRequired),
  },
  required,
  label,
  defaultValue,
  yupType: "boolean",
});

export const Select = (
  label: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any,
  required = true,
  multi = true,
  defaultValue = true
) => ({
  type: FormTypes.SELECT,
  required,
  label,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  options,
  multi,
  defaultValue,
  yupType: "array",
});

const defaultMin = [3, "String is too short. Min: 3"];
const defaultMax = [35, "String is too long. Max: 35"];
const defaultRequired = ["Field is required"];

type FieldLevelValidationFn = (arg: {
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: any;
  initialId: string;
}) => boolean | string | undefined;

export interface InputType {
  type: FormTypes.INPUT;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate: any;
  defaultValue: string | undefined;
  fieldLevelValidation: FieldLevelValidationFn | undefined | null;
  yupType: "string";
  placeholder: string;
  disabled?: boolean;
}

export const Input = (
  label: string,
  conditions: {
    min?: (string | number)[] | boolean;
    max?: (string | number)[] | boolean;
    required?: string[] | string | boolean;
    matches?: (string | RegExp)[] | string;
  } = {
    min: defaultMin,
    max: defaultMax,
    required: defaultRequired,
  },
  fieldLevelValidation: FieldLevelValidationFn | undefined | null,
  defaultValue: string | undefined,
  placeholder: string
): InputType => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const { min, max, required, matches } = conditions || {};
  return {
    type: FormTypes.INPUT,
    label,
    validate: {
      required: createValidationArgs(required, defaultRequired),
      min: createValidationArgs(min, defaultMin),
      max: createValidationArgs(max, defaultMax),
      matches,
    },
    defaultValue,
    fieldLevelValidation,
    yupType: "string",
    placeholder: placeholder,
  };
};
