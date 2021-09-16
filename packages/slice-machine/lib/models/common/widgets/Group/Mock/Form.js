import { Box, Text, Label, Input } from "theme-ui";
import { useFormikContext } from "formik";
import InputDeleteIcon from "components/InputDeleteIcon";

import { initialValues } from ".";

import { MockConfigKey } from "../../../../../consts";

const Form = () => {
  const { values, setFieldValue } = useFormikContext();

  const contentValue = values[MockConfigKey]?.content || null;

  const onUpdate = (value) => {
    setFieldValue(MockConfigKey, {
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

Form.initialValues = initialValues;

export const MockConfigForm = Form;
