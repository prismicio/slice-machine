import { Box, Checkbox, Label } from "theme-ui";

import { Col, Flex as FlexGrid } from "@/legacy/components/Flex";
import WidgetFormField from "@/legacy/lib/builders/common/EditModal/Field";
import { createFieldNameFromKey } from "@/legacy/lib/forms";
import { CommonDefaultFields } from "@/legacy/lib/forms/defaults";
import { CheckBox } from "@/legacy/lib/forms/fields";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = {
  ...CommonDefaultFields,
  repeat: CheckBox("Repeatable", false, true),
};

const Form = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { initialValues, fields, values, setFieldValue } = props;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    config: { repeat },
  } = values;

  return (
    <FlexGrid>
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.entries(FormFields)
          .filter(([key]) => key !== "repeat")
          .map(([key, field]) => (
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
          ))
      }

      <Col>
        <Box
          sx={{
            mt: 2,
            alignItems: "center",
            display: "flex",
            height: "130%",
          }}
        >
          <Label variant="label.border" sx={{ mb: 0 }}>
            <Checkbox
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              checked={repeat}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/strict-boolean-expressions
              onChange={() => setFieldValue("config.repeat", !repeat)}
            />
            Repeatable
          </Label>
        </Box>
      </Col>
    </FlexGrid>
  );
};

export { FormFields };
export default Form;
