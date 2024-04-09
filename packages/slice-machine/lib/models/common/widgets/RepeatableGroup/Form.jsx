import { Col, Flex as FlexGrid } from "@components/Flex";
import WidgetFormField from "@lib/builders/common/EditModal/Field";
import { createFieldNameFromKey } from "@lib/forms";
import { DefaultFields } from "@lib/forms/defaults";

const Form = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { initialValues, fields } = props;

  return (
    <FlexGrid>
      {Object.entries(DefaultFields).map(([key, field]) => (
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
    </FlexGrid>
  );
};

export default Form;
