import { Flex } from "theme-ui";

import { Col, Flex as FlexGrid } from "@/legacy/components/Flex";
import WidgetFormField from "@/legacy/lib/builders/common/EditModal/Field";
import { createFieldNameFromKey } from "@/legacy/lib/forms";
import { DefaultFields } from "@/legacy/lib/forms/defaults";
import { CheckBox } from "@/legacy/lib/forms/fields";

import { DisplayTextCheckbox, RepeatableCheckbox } from "./components";

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
      <RepeatableCheckbox
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        checked={repeat}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setFieldValue={setFieldValue}
      />
    </>
  );
};

export { FormFields };
export default Form;
