import { InputType } from "@lib/forms/fields";
import { Field, FieldMetaProps, GenericFieldHTMLAttributes } from "formik";
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
  field: GenericFieldHTMLAttributes;
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
  const style = meta.error
    ? InputFieldStyles.ERROR
    : isDisabled || formField.disabled
    ? InputFieldStyles.DISABLED
    : undefined;

  return (
    <Box sx={sx}>
      <Label variant="label.primary" htmlFor={fieldName}>
        {formField.label || fieldName}
        {meta.touched && meta.error ? (
          <Text as="span" variant="text.labelError">
            {meta.error}
          </Text>
        ) : null}
      </Label>
      <Field
        id={fieldName}
        type="text"
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
        disabled={isDisabled || formField.disabled}
      />
    </Box>
  );
};
