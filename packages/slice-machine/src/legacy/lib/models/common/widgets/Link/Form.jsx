import { Box, Label } from "theme-ui";

import { Col, Flex as FlexGrid } from "@/legacy/components/Flex";
import WidgetFormField from "@/legacy/lib/builders/common/EditModal/Field";
import { createFieldNameFromKey } from "@/legacy/lib/forms";
import { DefaultFields } from "@/legacy/lib/forms/defaults";
import { CheckBox } from "@/legacy/lib/forms/fields";

import { DisplayTextCheckbox } from "./components";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = {
  ...DefaultFields,
  allowTargetBlank: CheckBox("Allow target blank", false, true),
  repeat: CheckBox("Make this link repeatable", false, true),
};

const Form = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { initialValues, values: formValues, fields, setFieldValue } = props;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    config: { allowText },
  } = formValues;

  return (
    <FlexGrid>
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.entries(DefaultFields).map(([key, field]) => (
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
      <Col />
      <Col key="allowTargetBlank">
        <Box sx={{ mt: 2 }}>
          <Label
            htmlFor="allowTargetBlank"
            variant="label.primary"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            Link properties
          </Label>
          <WidgetFormField
            fieldName={createFieldNameFromKey("allowTargetBlank")}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            formField={FormFields.allowTargetBlank}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            fields={fields}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            initialValues={initialValues}
          />
        </Box>
      </Col>
      <DisplayTextCheckbox
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        allowText={allowText}
        height={127}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setFieldValue={setFieldValue}
      />
      <Col key="repeat">
        <Box sx={{ mt: 2 }}>
          <Label
            htmlFor="repeat"
            variant="label.primary"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            Repeatable
          </Label>
          <WidgetFormField
            fieldName={createFieldNameFromKey("repeat")}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            formField={FormFields.repeat}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            fields={fields}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            initialValues={initialValues}
          />
        </Box>
      </Col>
    </FlexGrid>
  );
};

export { FormFields };
export default Form;
