import * as yup from "yup";
import { Label, Box } from "theme-ui";

import { DefaultFields } from "@lib/forms/defaults";

import WidgetFormField from "@lib/builders/common/EditModal/Field";

import Select from "react-select";
import { Col, Flex as FlexGrid } from "@components/Flex";
import { createFieldNameFromKey } from "@lib/forms";
import { useSelector } from "react-redux";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { FormikProps } from "formik";
import { hasLocal } from "../../ModelData";

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

const WidgetForm = ({
  initialValues,
  values: formValues,
  fields,
  setFieldValue,
}: FormikProps<FormProps> & { fields: Record<string, unknown> }) => {
  const customTypes = useSelector(selectAllCustomTypes).filter(hasLocal);

  const options = customTypes.map((ct) => ({
    value: ct.local.id,
    label: ct.local.label,
  }));

  const selectValues = formValues.config.customtypes
    ? formValues.config.customtypes.map((id) => {
        const ct = customTypes.find(
          (frontendCustomType) => frontendCustomType.local.id === id
        );
        return { value: ct?.local.id, label: ct?.local.label };
      })
    : null;

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
            Types
          </Label>
          <Select
            isMulti
            name="origin"
            options={options}
            onChange={(v) => {
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              if (v) {
                void setFieldValue(
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
