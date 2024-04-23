import { Field } from "formik";
import { Label, Checkbox } from "theme-ui";

const FormFieldCheckbox = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialValues,
  meta,
  label,
  fieldName,
  onChange,
  ...rest
}) => {
  return (
    <Label variant="label.border" {...rest}>
      <Field
        as={Checkbox}
        type="checkbox"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        name={fieldName}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
        onChange={() => onChange(!meta.value)}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        checked={meta.value}
      />
      {label}
    </Label>
  );
};

export default FormFieldCheckbox;
