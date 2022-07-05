import { Field } from "formik";
import { Box, Label, Input, Text } from "theme-ui";

const getFieldStyles = (isError, isDisabled, isWarning) => {
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

const FormFieldInput = ({
  sx = {},
  field /* from Formik */,
  meta = {} /* from Formik */,
  formField,
  fieldName,
  fields,
  initialValues,
}) => {
  return (
    <Box sx={sx}>
      <Label
        variant="label.primary"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        htmlFor={fieldName}
      >
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          formField.label || fieldName
        }
        {meta.touched && meta.error ? (
          <Text as="span" variant="text.labelError">
            {meta.error}
          </Text>
        ) : null}
      </Label>
      <Field
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        name={fieldName}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id={fieldName}
        type="text"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
        placeholder={formField.placeholder || formField.label || fieldName}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        {...(formField.fieldLevelValidation
          ? {
              validate: (value) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                formField.fieldLevelValidation({
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                  value,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  fields,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  initialId: initialValues.id,
                }),
            }
          : null)}
        {...field}
        as={Input}
        sx={getFieldStyles(meta.error, false, false)}
      />
    </Box>
  );
};

export default FormFieldInput;
