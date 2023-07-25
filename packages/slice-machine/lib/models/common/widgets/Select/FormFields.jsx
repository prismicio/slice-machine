import * as yup from "yup";
import { useFormikContext } from "formik";

import { FormFieldCheckboxControl } from "@components/FormFields";

import { FormTypes } from "@lib/forms/types";

import { DefaultFields } from "@lib/forms/defaults";
import { FormFieldArray } from "@components/FormFields";

const label = (controlledValue) =>
  `use first value as default ${
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/strict-boolean-expressions
    controlledValue ? `("${controlledValue}")` : ""
  }`;

const buildControlledValue = (controlledValue, isChecked) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
  isChecked ? controlledValue : undefined;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = {
  ...DefaultFields,
  default_value: {
    type: FormTypes.CHECKBOX,
    yupType: "string",
    defaultValue: null,
    validate: function () {
      return yup.string().test({
        name: "default_value",
        message: 'Default value is not part of field "options" in Select',
        test: function (value) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return (
            value === undefined ||
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            (this.parent &&
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
              this.parent.options &&
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              this.parent.options.find((e) => e === value))
          );
        },
      });
    },
    component: (props) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks, @typescript-eslint/no-unsafe-assignment
      const { values } = useFormikContext();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const controlledValue = values.config?.options[0];
      return (
        <FormFieldCheckboxControl
          {...props}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          defaultValue={props.field.value}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          controlledValue={controlledValue}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          setControlledValue={props.helpers.setValue}
          buildControlledValue={buildControlledValue}
          label={label}
        />
      );
    },
  },
  options: {
    yupType: "array",
    defaultValue: ["1", "2"],
    validate: {
      required: ["Select requires a minimum of 2 options"],
      min: [2, "Choose at least 2 options"],
      test: {
        name: "non-empty values",
        message: "Values cannot be empty",
        test(value) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/strict-boolean-expressions
          return !value.some((e) => !e || !e.length);
        },
      },
    },
    component: (props) => {
      return (
        <FormFieldArray
          label="Options"
          inputPlaceholder="Select option output in API (e.g. 'blueTheme')"
          buttonLabel="Add option"
          {...props}
        />
      );
    },
  },
};

export default FormFields;
