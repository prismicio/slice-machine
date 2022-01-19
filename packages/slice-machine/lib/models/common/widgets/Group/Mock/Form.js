import { Box, Text, Label, Input } from "theme-ui";
import { useFormikContext } from "formik";
import InputDeleteIcon from "components/InputDeleteIcon";

import { initialValues } from ".";

import { MockConfigKey } from "../../../../../consts";

const Form = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const contentValue = values[MockConfigKey]?.content || null;

  const onUpdate = (value) => {
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      content: value,
    });
  };

  const reset = () => {
    setFieldValue(MockConfigKey, {});
  };

  return (
    <Box>
      <Label
        variant="label.primary"
        sx={{ display: "block", maxWidth: "400px" }}
      >
        <Text as="span">Link value</Text>
        <Input
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={contentValue || ""}
          placeholder="https://prismic.io"
          onFocus={(e) => e.target.focus()}
          onChange={(e) => onUpdate(e.target.value)}
        />
        <InputDeleteIcon onClick={reset} />
      </Label>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Form.initialValues = initialValues;

export const MockConfigForm = Form;
