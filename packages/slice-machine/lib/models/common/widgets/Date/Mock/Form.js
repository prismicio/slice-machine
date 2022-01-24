import TimeConfigForm from "components/TimeConfigForm";

import { initialValues } from ".";

const Form = (props) => {
  return (
    <TimeConfigForm
      {...props}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      initialMockValues={initialValues}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      formatDate={(d) => d.toISOString().split("T")[0]}
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Form.initialValues = initialValues;

export const MockConfigForm = Form;
