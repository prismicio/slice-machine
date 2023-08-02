import * as Yup from "yup";
import { FormTypes } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDefaultValue = (field: { type: FormTypes; defaultValue: any }) => {
  if (field.defaultValue === null) {
    return undefined;
  }
  if (field.defaultValue !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return field.defaultValue;
  }
  if (field.type === FormTypes.CHECKBOX) {
    return true;
  }
  if (field.type === FormTypes.INPUT) {
    return "";
  }
  if (field.type === FormTypes.SELECT) {
    return [];
  }
  return undefined;
};

export const createFieldNameFromKey = (key: string) =>
  key === "id" ? "id" : `config.${key}`;

export const createValidationArgs = (
  args: (string | number)[] | boolean | string | undefined,
  defaultArgs: (string | number)[]
) => {
  if (Array.isArray(args)) {
    return args;
  }
  if (typeof args === "boolean" && args) {
    return defaultArgs;
  }
  return null;
};

export const createInitialValues =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends Record<string, any>>(FormFields: T) => {
    return Object.entries(FormFields).reduce<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key in keyof typeof FormFields]?: any;
    }>((acc, [key, val]) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      const value = handleDefaultValue(val);
      if (value !== undefined) {
        return {
          ...acc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          [key]: value,
        };
      }
      return acc;
    }, {});
  };

export const createValidationSchema = (FormFields: {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  [fieldKey: string]: any;
}): Yup.AnyObjectSchema => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return Yup.object()
    .shape(
      Object.entries(FormFields)
        .filter((e) => e)
        .reduce((acc, [key, formField]) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { validate, yupType } = formField;
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (!validate) {
            return acc;
          }
          if (typeof validate === "function") {
            return {
              ...acc,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
              [key]: validate(key, formField),
            };
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
          let validator = (Yup as any)[yupType]();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          Object.entries(validate)
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            .filter((e) => e && e[1])
            .forEach(([func, args]) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
              if (args && validator[func]) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                validator = validator[func](
                  ...(Array.isArray(args) ? args : [args])
                );
                return;
              }
              console.warn(`Invalid Yup validator for field "${key}"`);
            });
          return {
            ...acc,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            [key]: validator,
          };
        }, {})
    )
    .required()
    .default(undefined)
    .noUnknown(true);
};
