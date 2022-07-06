import { Field, FieldInputProps, FieldMetaProps } from "formik";
import { Box, Label, Input, Text, ThemeUIStyleObject } from "theme-ui";

const getFieldStyles = (
  isError: boolean | undefined,
  isDisabled: boolean | undefined,
  isWarning: boolean | undefined
) => {
  const defaultFieldStyles = {
    "&::placeholder": { color: "#C9D0D8" },
  };
  const fieldStyles = isDisabled
    ? {
        ...defaultFieldStyles,
        border: "1px solid #E6E6EA",
        backgroundColor: "#F3F5F7",
      }
    : isError
    ? {
        ...defaultFieldStyles,
        border: "1px solid #E26049",
        "&:focus": {
          outline: "none",
          borderColor: "#E26049",
          boxShadow:
            "0 0 0 3px rgba(226, 96, 73, 0.2), inset 0 1px 2px rgba(226, 96, 73, 0.2)",
        },
      }
    : isWarning
    ? {
        ...defaultFieldStyles,
        border: "1px solid orange",
        "&:focus": {
          outline: "none",
          borderColor: "orange",
          boxShadow:
            "0 0 0 3px rgba(255, 165, 0, 0.2), inset 0 1px 2px rgba(255, 165, 0, 0.2)",
        },
      }
    : defaultFieldStyles;

  return fieldStyles;
};

interface FormFieldInputProps {
  sx: ThemeUIStyleObject;
  field: FieldInputProps<string>;
  meta: FieldMetaProps<string>;
  formField: {
    label: string;
    placeholder: string;
    fieldLevelValidation?: (arg: {
      value: string;
      fields: any;
      initialId: string;
    }) => boolean;
  };
  fieldName: string;
  fields: Record<string, unknown>;
  initialValues?: Record<string, string>;
  isDisabled?: boolean;
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
        sx={getFieldStyles(Boolean(meta.error), Boolean(isDisabled), false)}
        disabled={isDisabled}
      />
    </Box>
  );
};
