import { Fragment } from "react";

import { useField } from "formik";

import {
  FormFieldCheckbox,
  FormFieldInput,
} from "../../../../components/FormFields";

import { FormTypes } from "../../../forms/types";

import { Box } from "theme-ui";

const WidgetFormField = ({ fieldName, formField, fields, initialValues }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [field, meta, helpers] = useField(fieldName);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const MaybeCustomComponent = formField.component;

  return (
    <Box
      sx={{
        mt: 2,
        alignItems: "center",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...(formField.type === FormTypes.CHECKBOX
          ? {
              display: "flex",
              height: "130%",
            }
          : null),
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
      {MaybeCustomComponent ? (
        <MaybeCustomComponent
          meta={meta}
          field={field}
          helpers={helpers}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          fieldName={fieldName}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          formField={formField}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          initialValues={initialValues}
        />
      ) : (
        <Fragment>
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            formField.type === FormTypes.INPUT ? (
              <FormFieldInput
                meta={meta}
                field={field}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                fields={fields}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                formField={formField}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                fieldName={fieldName}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                initialValues={initialValues}
              />
            ) : null
          }
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            formField.type === FormTypes.CHECKBOX && (
              <FormFieldCheckbox
                meta={meta}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                label={formField.label}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
                fieldName={fieldName}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                initialValues={initialValues}
                onChange={(value) => helpers.setValue(value)}
              />
            )
          }
        </Fragment>
      )}
    </Box>
  );
};

export default WidgetFormField;
