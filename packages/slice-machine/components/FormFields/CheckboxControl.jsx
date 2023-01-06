import { useState, useEffect } from "react";
import { useFormikContext } from "formik";

import { FormFieldCheckbox } from "./";

const CheckboxControl = ({
  field,
  helpers,
  label,
  defaultValue,
  onChange,
  getFieldControl,
  setControlFromField,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values } = useFormikContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const fieldControl = getFieldControl(values);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const [isChecked, setCheck] = useState(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    defaultValue || field.defaultValue || false
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    helpers.setValue(
      setControlFromField
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-call
          setControlFromField(fieldControl, isChecked)
        : fieldControl
    );
  }, [isChecked, fieldControl]);

  return (
    <FormFieldCheckbox
      meta={{
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value: isChecked,
      }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      fieldName={field.name}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      onChange={(value) => setCheck(value) && onChange && onChange(value)}
      label={
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        typeof label === "function" ? label(fieldControl, isChecked) : label
      }
    />
  );
};

export default CheckboxControl;
