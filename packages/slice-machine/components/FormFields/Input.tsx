import { InputType } from "@lib/forms/fields";
import { Field, FieldMetaProps } from "formik";
import React from "react";
import { Box, Label, Input, Text, ThemeUIStyleObject } from "theme-ui";

export enum InputFieldStyles {
  ERROR,
  DISABLED,
  WARNING,
}

export const getInputFieldStyles = (type?: InputFieldStyles) => {
  const defaultFieldStyles = {
    "&::placeholder": { color: "#C9D0D8" },
  };
  switch (type) {
    case InputFieldStyles.DISABLED: {
      return {
        ...defaultFieldStyles,
        border: "1px solid #E6E6EA",
        backgroundColor: "#F3F5F7",
      };
    }
    case InputFieldStyles.ERROR: {
      return {
        ...defaultFieldStyles,
        border: "1px solid #E26049",
        "&:focus": {
          outline: "none",
          borderColor: "#E26049",
          boxShadow:
            "0 0 0 3px rgba(226, 96, 73, 0.2), inset 0 1px 2px rgba(226, 96, 73, 0.2)",
        },
      };
    }
    case InputFieldStyles.WARNING: {
      return {
        ...defaultFieldStyles,
        border: "1px solid orange",
        "&:focus": {
          outline: "none",
          borderColor: "orange",
          boxShadow:
            "0 0 0 3px rgba(255, 165, 0, 0.2), inset 0 1px 2px rgba(255, 165, 0, 0.2)",
        },
      };
    }
    default: {
      return defaultFieldStyles;
    }
  }
};

interface FormFieldInputProps {
  sx?: ThemeUIStyleObject;
  field: React.InputHTMLAttributes<HTMLInputElement>;
  meta: FieldMetaProps<string> | FieldMetaProps<number>;
  formField: Partial<InputType>;
  fieldName: string;
  fields?: Record<string, unknown>;
  initialValues?: Record<string, string>;
  isDisabled?: boolean;
  variant?: string;
}

export const FormFieldInput = ({
  sx = {},
  field /* from Formik */,
  meta /* from Formik */,
  formField,
  fieldName,
  fields,
  initialValues,
  isDisabled,
}: FormFieldInputProps) => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const style = meta.error
    ? InputFieldStyles.ERROR
    : // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    isDisabled || formField.disabled
    ? InputFieldStyles.DISABLED
    : undefined;

  return (
    <Box sx={sx}>
      <Label variant="label.primary" htmlFor={fieldName}>
        {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing */}
        {formField.label || fieldName}
        {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
        {meta.touched && meta.error ? (
          <Text as="span" variant="text.labelError">
            {meta.error}
          </Text>
        ) : null}
      </Label>
      <Field
        id={fieldName}
        name={fieldName}
        type="text"
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
        placeholder={formField.placeholder || formField.label || fieldName}
        {...(formField.fieldLevelValidation && initialValues
          ? {
              validate: (value: string) =>
                formField.fieldLevelValidation &&
                formField.fieldLevelValidation({
                  value,
                  fields,
                  initialId: initialValues.id,
                }),
            }
          : null)}
        {...field}
        as={Input}
        sx={getInputFieldStyles(style)}
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
        disabled={isDisabled || formField.disabled}
      />
    </Box>
  );
};
