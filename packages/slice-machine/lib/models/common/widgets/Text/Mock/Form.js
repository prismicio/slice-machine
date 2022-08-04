import { Box, Text, Label, Input } from "theme-ui";
import { useFormikContext } from "formik";
import InputDeleteIcon from "components/InputDeleteIcon";

import { MockConfigKey } from "../../../../../consts";
import { DefaultConfig } from "@lib/mock/LegacyMockConfig";

const Form = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const contentValue = values[MockConfigKey]?.content || null;

  const onUpdate = (value) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!value || !value.length) {
      return setFieldValue(MockConfigKey, {});
    }
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      content: value,
    });
  };

  const onDelete = () => {
    setFieldValue(MockConfigKey, {});
  };

  return (
    <Box>
      <Label
        variant="label.primary"
        sx={{ display: "block", maxWidth: "400px" }}
      >
        <Text as="span">Text value</Text>
        <Input
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={contentValue || ""}
          placeholder="A text string for testing (e.g. 'Call me Ishmael')"
          onChange={(e) => onUpdate(e.target.value)}
        />
        <InputDeleteIcon onClick={onDelete} />
      </Label>
    </Box>
  );
};

Form.initialValues = DefaultConfig.Text;

export const MockConfigForm = Form;
