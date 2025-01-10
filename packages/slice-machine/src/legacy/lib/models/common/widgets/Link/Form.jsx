/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Box } from "@prismicio/editor-ui";
import { useField } from "formik";
import { Flex } from "theme-ui";

import { Col, Flex as FlexGrid } from "@/legacy/components/Flex";
import WidgetFormField from "@/legacy/lib/builders/common/EditModal/Field";
import { createFieldNameFromKey } from "@/legacy/lib/forms";
import { DefaultFields } from "@/legacy/lib/forms/defaults";
import { CheckBox } from "@/legacy/lib/forms/fields";

import {
  DisplayTextCheckbox,
  RepeatableCheckbox,
  Variants as VariantsForm,
} from "./components";

const FormFields = {
  ...DefaultFields,
};

const Form = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { initialValues, values: formValues, fields, setFieldValue } = props;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    config: { allowText, repeat, variants },
  } = formValues;

  return (
    <>
      <FlexGrid>
        {Object.entries(FormFields).map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={createFieldNameFromKey(key)}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              formField={field}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={fields}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              initialValues={initialValues}
            />
          </Col>
        ))}

        <Col key="allowTargetBlank">
          <Flex
            sx={{ gap: 2, marginTop: 3 }}
            style={{
              paddingTop: "1px",
            }}
          >
            <Col>
              <WidgetFormField
                fieldName={createFieldNameFromKey("allowTargetBlank")}
                formField={CheckBox("Allow target blank", false, true)}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                fields={fields}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                initialValues={initialValues}
              />
            </Col>
            <DisplayTextCheckbox
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              checked={allowText}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              setFieldValue={setFieldValue}
            />
          </Flex>
        </Col>
      </FlexGrid>
      <Box height={8} />
      <Box flexDirection="column" gap={16}>
        <RepeatableCheckbox
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          checked={repeat}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          setFieldValue={setFieldValue}
        />
        <Variants variants={variants} setFieldValue={setFieldValue} />
      </Box>
    </>
  );
};

export { FormFields };
export default Form;

export function Variants({ variants, setFieldValue }) {
  const fieldKey = "config.variants";

  const onVariantsChange = (newVariants) =>
    setFieldValue(fieldKey, newVariants);

  const [_, meta] = useField(fieldKey);

  const error = meta.error?.find((err) => err);

  return (
    <VariantsForm
      variants={variants}
      onVariantsChange={onVariantsChange}
      error={error}
    />
  );
}
