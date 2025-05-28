import { FormikProps } from "formik";
import { Box } from "theme-ui";
import * as yup from "yup";

import { ContentRelationshipFieldPicker } from "@/features/customTypes/fields/ContentRelationshipFieldPicker";
import { Col, Flex as FlexGrid } from "@/legacy/components/Flex";
import WidgetFormField from "@/legacy/lib/builders/common/EditModal/Field";
import { createFieldNameFromKey } from "@/legacy/lib/forms";
import { DefaultFields } from "@/legacy/lib/forms/defaults";

const FormFields = {
  label: DefaultFields.label,
  id: DefaultFields.id,
  customtypes: {
    validate: () =>
      yup.array(
        yup.object({
          id: yup.string(),
          fields: yup.array(yup.string()),
        }),
      ),
  },
};

type FormProps = {
  config: {
    label: string;
    select: string;
    customtypes?: { id: string; fields: string[] }[];
  };
  id: string;
  // TODO: this exists in the yup schema but this doesn't seem to be validated by formik
};

const WidgetForm = ({
  initialValues,
  setFieldValue,
  fields,
}: FormikProps<FormProps> & { fields: Record<string, unknown> }) => {
  return (
    <>
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
      </FlexGrid>
      <Box mt={20}>
        <ContentRelationshipFieldPicker
          initialValues={initialValues.config.customtypes}
          onChange={(fields) => {
            void setFieldValue("config.customtypes", fields);
          }}
        />
      </Box>
    </>
  );
};

export { FormFields };

export default WidgetForm;
