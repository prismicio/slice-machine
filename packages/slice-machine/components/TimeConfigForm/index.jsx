import { useEffect } from "react";
import { Input, Box, Text, Label } from "theme-ui";
import { useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import InputDeleteIcon from "components/InputDeleteIcon";

import { MockConfigKey } from "../../lib/consts";

const Form = ({ initialValues, initialMockValues, formatDate }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const contentValue = values[MockConfigKey]?.content || null;

  useEffect(() => {
    if (!contentValue) {
      onChange(new Date());
    }
  }, []);

  const onChange = (date) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const formatted = formatDate ? formatDate(date) : date;
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      content: formatted,
    });
  };

  const reset = () => {
    setFieldValue(MockConfigKey, initialMockValues);
  };

  return (
    <Box>
      <Label
        variant="label.primary"
        sx={{ display: "block", maxWidth: "400px" }}
      >
        <Text as="span">Time value</Text>
        <DatePicker
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          selected={contentValue ? new Date(contentValue) : null}
          onChange={onChange}
          placeholderText="mm/dd/yy"
          customInput={<Input p={2} sx={{ width: "100%" }} />}
          className="react-datepicker-wrapper"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          showTimeSelect={initialValues.type === "Timestamp"}
        />
        <InputDeleteIcon onClick={reset} />
      </Label>
    </Box>
  );
};

export default Form;
