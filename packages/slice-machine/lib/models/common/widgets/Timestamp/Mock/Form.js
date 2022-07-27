import TimeConfigForm from "components/TimeConfigForm";
import { DefaultConfig } from "@lib/mock/LegacyMockConfig";

const Form = (props) => {
  return (
    <TimeConfigForm {...props} initialMockValues={DefaultConfig.Timestamp} />
  );
};

Form.initialValues = DefaultConfig.Timestamp;

export const MockConfigForm = Form;
