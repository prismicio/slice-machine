import { Label, Box, Card, Flex, Close } from "theme-ui";

import { DefaultFields } from "@lib/forms/defaults";

import WidgetFormField from "@lib/builders/common/EditModal/Field";

import Select from "react-select";
import { Col, Flex as FlexGrid } from "@components/Flex";
import { createFieldNameFromKey } from "@lib/forms";
import { useSelector } from "react-redux";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { FieldArray, FormikProps } from "formik";
import { hasLocal } from "../../ModelData";
import { Switch } from "@prismicio/editor-ui";

type SelectedValue = {
  value: string;
  label: string;
  fetchFields: boolean;
};

const FormFields = {
  label: DefaultFields.label,
  id: DefaultFields.id,
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
};

const CustomTypesList = ({
  selectedValues,
}: {
  selectedValues: SelectedValue[];
}) => {
  return (
    <Card p={3}>
      <FieldArray
        name="config.customtypes"
        render={({ push, remove, replace }) => (
          <>
            <Box mb={3}>
              {selectedValues.map((v, i) => (
                <Flex
                  key={v.value}
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <p>{v.value}</p>
                  <Flex sx={{ alignItems: "center" }}>
                    <Switch
                      checked={v.fetchFields}
                      onCheckedChange={(s) => {
                        console.log({ s });
                        replace(i, { customTypeId: v.value, fetchFields: s });
                      }}
                    />
                    <Close
                      onClick={() => remove(i)}
                      sx={{
                        ml: 2,
                        width: "26px",
                      }}
                    />
                  </Flex>
                </Flex>
              ))}
            </Box>
          </>
        )}
      />
    </Card>
  );
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

  const selectedValues = (formValues.config.customtypes ?? []).reduce<
    SelectedValue[]
  >((acc, customType) => {
    if (customType === undefined) {
      return acc;
    }
    const { customTypeId, fetchFields } = customType;
    const ct = customTypes.find(
      (frontendCustomType) => frontendCustomType.local.id === customTypeId
    );
    if (ct) {
      return [
        ...acc,
        {
          value: ct.local.id,
          label: ct.local.label,
          fetchFields: fetchFields ?? false,
        },
      ];
    }
    return acc;
  }, [] as SelectedValue[]);

  console.log({
    selectedCts: formValues.config.customtypes,
    options,
    selectedValues,
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
          <CustomTypesList selectedValues={selectedValues} />
          <Select
            isMulti
            name="origin"
            options={options}
            onChange={(v: { value: string; label: string }[]) => {
              setFieldValue(
                "config.customtypes",
                v.map(({ value }) => ({ customTypeId: value }))
              );
            }}
            value={selectedValues}
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
