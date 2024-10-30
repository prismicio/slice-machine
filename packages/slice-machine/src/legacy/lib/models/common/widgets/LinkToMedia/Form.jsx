import { Col, Flex as FlexGrid } from "@/legacy/components/Flex";
import WidgetFormField from "@/legacy/lib/builders/common/EditModal/Field";
import { createFieldNameFromKey } from "@/legacy/lib/forms";
import { DefaultFields } from "@/legacy/lib/forms/defaults";

import { DisplayTextCheckbox, RepeatableCheckbox } from "../Link/components";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = {
  ...DefaultFields,
};

const Form = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { initialValues, values: formValues, fields, setFieldValue } = props;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    config: { allowText, repeat },
  } = formValues;

  return (
    <FlexGrid>
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.entries(FormFields).map(([key, field]) => (
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
      <DisplayTextCheckbox
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        allowText={allowText}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setFieldValue={setFieldValue}
      />
      <RepeatableCheckbox
        label="Make this link repeatable"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        checked={repeat}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setFieldValue={setFieldValue}
      />
    </FlexGrid>
  );
};

export { FormFields };
export default Form;
