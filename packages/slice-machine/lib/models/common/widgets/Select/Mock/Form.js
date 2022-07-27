import { Box, Text, Select, Label } from "theme-ui";
import { useFormikContext } from "formik";

import { DefaultConfig } from "@lib/mock/LegacyMockConfig";

import { MockConfigKey } from "../../../../../consts";

const RAND = "Random";

const Form = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const contentValue =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    values[MockConfigKey]?.content !== null
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        values[MockConfigKey].content
      : null;

  const onSelect = (e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (e.target.value === RAND) {
      return setFieldValue(MockConfigKey, {});
    }
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      content: e.target.value,
    });
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const options = [RAND, ...values.config.options];

  return (
    <Box>
      <Label sx={{ display: "block", maxWidth: "400px" }}>
        <Text as="p" mb={1}>
          Select value
        </Text>
        <Select
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onChange={onSelect}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={contentValue || RAND}
        >
          {options.map((o) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            return <option key={o}>{o}</option>;
          })}
        </Select>
      </Label>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Form.initialValues = DefaultConfig.Select;

export const MockConfigForm = Form;
