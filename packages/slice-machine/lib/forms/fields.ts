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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Input: any = (
  label: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
  conditions: { min: any; max: any; required: any; matches?: any } = {
    min: defaultMin,
    max: defaultMax,
    required: defaultRequired,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any, @typescript-eslint/no-explicit-any
  fieldLevelValidation: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue: any,
  placeholder: string
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
  const { min, max, required, matches } = conditions || {};
  return {
    type: FormTypes.INPUT,
    label,
    validate: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      required: createValidationArgs(required, defaultRequired),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      min: createValidationArgs(min, defaultMin),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
      max: createValidationArgs(max, defaultMax),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      matches,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    defaultValue,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fieldLevelValidation,
    yupType: "string",
    placeholder: placeholder,
  };
};
