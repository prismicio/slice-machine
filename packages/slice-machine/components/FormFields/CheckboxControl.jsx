import { useState, useEffect } from "react";

import { FormFieldCheckbox } from "./";

/**
 * This components allows to set/unset the value of an arbitrary field via
 * checking/unchecking the box
 *
 * @param field - The controlled Formik field that we want to manipulate
 * @param label - A function of text displayed next to the checkbox. Can be
 *   either a string or a function
 * @param controlledValue - The value of the field being controlled
 * @param setControlledValue - Function to update the value of the controlled
 *   value in
 * @param buildControlledValue - Formik function to build the new value based on
 *   the current controlled value and the state of the checkbox
 */
const CheckboxControl = ({
  field,
  label,
  defaultValue,
  onChange,
  controlledValue,
  setControlledValue,
  buildControlledValue,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const [isChecked, setCheck] = useState(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
    defaultValue || field.defaultValue || false
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/strict-boolean-expressions
    buildControlledValue
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        setControlledValue(buildControlledValue(controlledValue, isChecked))
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        setControlledValue(buildControlledValue);
    // Adding the missing dependency to this hook triggers an infinite loop
    // We decided to leave it for now, waiting for a bigger refactor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecked, controlledValue, buildControlledValue]);

  return (
    <FormFieldCheckbox
      meta={{
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value: isChecked,
      }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      fieldName={field.name}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/strict-boolean-expressions
      onChange={(value) => setCheck(value) && onChange && onChange(value)}
      label={
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        typeof label === "function" ? label(controlledValue, isChecked) : label
      }
    />
  );
};

export default CheckboxControl;
