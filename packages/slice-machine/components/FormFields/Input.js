import { Field } from "formik";
import { Box, Label, Input, Text } from "theme-ui";

const FormFieldInput = ({
  sx = {},
  field /* from Formik */,
  meta = {} /* from Formik */,
  formField,
  fieldName,
  fields,
  initialValues,
}) => (
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
    />
  </Box>
);

export default FormFieldInput;
