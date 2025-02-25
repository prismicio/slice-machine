/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Box } from "@prismicio/editor-ui";

import { Col, Flex as FlexGrid } from "@/legacy/components/Flex";
import WidgetFormField from "@/legacy/lib/builders/common/EditModal/Field";
import { createFieldNameFromKey } from "@/legacy/lib/forms";
import { DefaultFields } from "@/legacy/lib/forms/defaults";

import { DisplayTextCheckbox } from "../Link/components";
import { Variants } from "../Link/Form";

const FormFields = {
  ...DefaultFields,
};

const Form = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { initialValues, values: formValues, fields, setFieldValue } = props;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    config: { allowText, variants },
  } = formValues;

  return (
    <Box flexDirection="column" gap={16}>
      <FlexGrid>
        {Object.entries(FormFields).map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={createFieldNameFromKey(key)}
              formField={field}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={fields}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              initialValues={initialValues}
            />
          </Col>
        ))}
        <DisplayTextCheckbox
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          checked={allowText}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          setFieldValue={setFieldValue}
        />
      </FlexGrid>
      <Variants variants={variants} setFieldValue={setFieldValue} />
    </Box>
  );
};

export { FormFields };
export default Form;
