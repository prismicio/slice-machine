import * as yup from "yup";
import Select from "react-select";
import { Label, Box } from "theme-ui";

import { DefaultFields } from "@lib/forms/defaults";

import WidgetFormField from "@lib/builders/common/EditModal/Field";

import { Col, Flex as FlexGrid } from "components/Flex";
import { createFieldNameFromKey } from "@lib/forms";
import { useSelector } from "react-redux";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { FormikProps } from "formik";
import { useEffect } from "react";

const FormFields = {
  label: DefaultFields.label,
  id: DefaultFields.id,
  customtypes: {
    validate: () => yup.array().of(yup.string()),
  },
};

type FormProps = {
  config: { label: string; select: string; customtypes?: string[] };
  id: string;
  // type: string; // TODO: this exists in the yup schema but this doesn't seem to be validated by formik
};

type SelectValueType = {
  value: string;
  label: string | null | undefined;
};

const WidgetForm = ({
  initialValues,
  values: formValues,
  fields,
  setFieldValue,
}: FormikProps<FormProps> & { fields: Record<string, unknown> }) => {
  const customTypes = useSelector(selectAllCustomTypes);

  const options = customTypes.map((ct) => ({
    value: ct.local.id,
    label: ct.local.label,
  }));

  const selectValues = formValues.config.customtypes
    ? formValues.config.customtypes
        .map((id) => {
          const ct = customTypes.find(
            (frontendCustomType) => frontendCustomType.local.id === id
          );
          return ct ? { value: ct.local.id, label: ct.local.label } : ct;
        })
        .filter((val): val is SelectValueType => val !== undefined)
    : null;

  // removes deleted custom type from initial values on first render
  useEffect(
    () =>
      setFieldValue(
        "config.customtypes",
        selectValues?.map(({ value }) => value)
      ),
    []
  );

  return (
    <FlexGrid>
      {Object.entries(FormFields)
        .filter((e) => e[0] !== "customtypes")
        .map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={createFieldNameFromKey(key)}
              formField={field}
              fields={fields}
              initialValues={initialValues}
            />
          </Col>
        ))}
      <Col>
        <Box
          sx={{
            mt: 2,
            alignItems: "center",
          }}
        >
          <Label htmlFor="origin" mb="1">
            Custom Types
          </Label>
          <Select
            isMulti
            name="origin"
            options={options}
            onChange={(v) => {
              if (v) {
                setFieldValue(
                  "config.customtypes",
                  v.map(({ value }) => value)
                );
              }
            }}
            value={selectValues}
            theme={(theme) => {
              return {
                ...theme,
                colors: {
                  ...theme.colors,
                  text: "text",
                  primary: "background",
                },
              };
            }}
          />
        </Box>
      </Col>
    </FlexGrid>
  );
};

export { FormFields };

export default WidgetForm;
