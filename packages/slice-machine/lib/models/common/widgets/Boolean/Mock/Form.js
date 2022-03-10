import { Box, Text, Select, Label } from "theme-ui";
import { useFormikContext } from "formik";

import { DefaultConfig } from "@lib/mock/LegacyMockConfig";

import { MockConfigKey } from "@lib/consts";

const RAND = "RANDOM";

const Form = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const contentValue = values[MockConfigKey]?.content;

  const onSelect = (e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (e.target.value === RAND) {
      return setFieldValue(MockConfigKey, {});
    }
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
      content: e.target.value === (values.placeholder_true || "true"),
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const value = (() => {
    if (contentValue != null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return contentValue === true
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          values.placeholder_true || "true"
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          values.placeholder_false || "false";
    }
    return RAND;
  })();

  return (
    <Box>
      <Label
        variant="label.primary"
        sx={{ display: "block", maxWidth: "400px" }}
      >
        <Text as="p" mb={1}>
          Boolean value
        </Text>
        <Select
          onChange={onSelect}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={value}
        >
          <option value={RAND}>Random</option>
          <option>
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              values.placeholder_true || "true"
            }
          </option>
          <option>
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              values.placeholder_false || "false"
            }
          </option>
        </Select>
      </Label>
    </Box>
  );
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
Form.initialValues = DefaultConfig.Boolean;

export const MockConfigForm = Form;
