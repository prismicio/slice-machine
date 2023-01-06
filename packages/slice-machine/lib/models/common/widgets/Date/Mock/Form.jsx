import TimeConfigForm from "components/TimeConfigForm";
import { DefaultConfig } from "@lib/mock/LegacyMockConfig";

const Form = (props) => {
  return (
    <TimeConfigForm
      {...props}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      initialMockValues={DefaultConfig.Date}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      formatDate={(d) => d.toISOString().split("T")[0]}
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Form.initialValues = DefaultConfig.Date;

export const MockConfigForm = Form;
