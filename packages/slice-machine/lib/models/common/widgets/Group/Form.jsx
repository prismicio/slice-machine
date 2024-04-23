import { Checkbox, Label, Box } from "theme-ui";

import { Col, Flex as FlexGrid } from "@components/Flex";
import { DefaultFields } from "@lib/forms/defaults";
import WidgetFormField from "@lib/builders/common/EditModal/Field";
import { CheckBox } from "@lib/forms/fields";
import { createFieldNameFromKey } from "@lib/forms";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = {
  ...DefaultFields,
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
