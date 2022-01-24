import { useState, useEffect } from "react";
import { useFormikContext } from "formik";

import { FormFieldCheckbox } from "./";

const SelectDefaultValue = ({ field, meta, helpers }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const [isChecked, setCheck] = useState(field.defaultValue || false);
  const {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    values: { options },
  } = useFormikContext();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (isChecked && options.length) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      helpers.setValue(options[0]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      helpers.setValue("");
    }
  }, [isChecked]);

  useEffect(() => {
    if (isChecked) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      helpers.setValue(options[0]);
    }
  }, [options]);

  return (
    <FormFieldCheckbox
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      meta={meta}
      onChange={setCheck}
      label={`use first value as default ${
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
        options.length ? `("${options[0]}")` : ""
      }`}
    />
  );
};

export default SelectDefaultValue;
