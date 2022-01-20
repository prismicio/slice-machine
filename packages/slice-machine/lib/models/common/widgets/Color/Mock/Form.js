import { useState } from "react";
import { Box, Text, Label, Flex, Radio } from "theme-ui";
import { useFormikContext } from "formik";
import { BlockPicker } from "react-color";

import { initialValues } from ".";

import { MockConfigKey } from "@lib/consts";

const RAND = "random";

export const SelectionCard = ({ name, checked, onSelect, children }) => {
  return (
    <Label
      sx={{
        border: "1px solid",
        borderRadius: "3px",
        borderColor: "borders",
        display: "block",
        position: "relative",
        bg: "headSection",
        mb: 2,
      }}
    >
      <Flex sx={{ p: 2 }}>
        <Radio
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          name={name}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
          onChange={onSelect}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
          checked={checked}
        />
        {children}
      </Flex>
    </Label>
  );
};

const Form = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const contentValue = values[MockConfigKey]?.content || null;
  const [transitionPreserved, preserveTransition] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  const [lastValue, setLastValue] = useState(contentValue);

  const onChange = (color) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    setLastValue(color.hex);
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      content: color.hex,
    });
  };
  const reset = () => {
    setFieldValue(MockConfigKey, {});
  };

  const startPreserveTransition = () => {
    preserveTransition(true);
    setTimeout(() => preserveTransition(false), 1000);
  };

  return (
    <Box>
      <Label variant="label.primary" sx={{ display: "block" }}>
        <Text as="span" mb={1} sx={{ display: "inline-block" }}>
          Color value
        </Text>
        <SelectionCard
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={contentValue}
          name={RAND}
          onSelect={reset}
          checked={contentValue === null}
        >
          Random Color
        </SelectionCard>
        <SelectionCard
          name="custom"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={contentValue}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onSelect={() => onChange({ hex: lastValue || "#111" })}
          checked={contentValue !== null}
        >
          Custom Color
        </SelectionCard>
        {contentValue || transitionPreserved ? (
          <BlockPicker
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
            color={contentValue || lastValue}
            onChangeComplete={onChange}
            onChange={startPreserveTransition}
          />
        ) : null}
      </Label>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Form.initialValues = initialValues;

export const MockConfigForm = Form;
