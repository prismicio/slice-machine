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
    validate: yup
      .array()
      .of(
        yup.object().shape({
          customTypeId: yup.string().required(),
          fetchFields: yup.boolean().optional(),
        })
      )
      .nullable(),
  },
};

type FormProps = {
  config: {
    label: string;
    select: string;
    customtypes?:
      | ({ customTypeId: string } & { fetchFields?: boolean | undefined })[]
      | undefined;
  };
  id: string;
  // type: string; // TODO: this exists in the yup schema but this doesn't seem to be validated by formik
};

const WidgetForm = ({
  initialValues,
  values: formValues,
  fields,
  setFieldValue,
}: FormikProps<FormProps> & { fields: Record<string, unknown> }) => {
  // TODO [CR]: pass this as additional data from CT zone
  const customTypes = useSelector(selectAllCustomTypes).filter(hasLocal);

  const options = customTypes.map((ct) => ({
    value: ct.local.id,
    label: ct.local.label,
  }));

  const selectValues = formValues.config.customtypes
    ? formValues.config.customtypes.map(({ customTypeId }) => {
        const ct = customTypes.find(
          (frontendCustomType) => frontendCustomType.local.id === customTypeId
        );
        return { value: ct?.local.id, label: ct?.local.label };
      })
    : null;

  console.log({
    selectedCts: formValues.config.customtypes,
    options,
    selectValues,
  });

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
              setFieldValue(
                "config.customtypes",
                v.map(({ value }) => ({ customTypeId: value }))
              );
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
