import { Flex, Box, Label, Radio, Input, Text } from "theme-ui";
import { Patterns } from "@prismicio/mocks/lib/generators/widgets/nestable/RichText/RichTextMockConfig";

export const PatternCard = ({
  patternKey,
  isAllowed,
  currentKey,
  onUpdate,
}) => {
  return (
    <Label
      sx={{
        border: "1px solid",
        borderRadius: "3px",
        borderColor: "borders",
        display: "block",
        position: "relative",
        opacity: isAllowed ? "1" : ".4",
        cursor: isAllowed ? "pointer" : "not-allowed",
        bg: "headSection",
        mb: 3,
      }}
    >
      <Flex sx={{ p: 2 }}>
        <Radio
          name="pattern"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={patternKey}
          disabled={!isAllowed}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          onChange={() => onUpdate(patternKey, false)}
          checked={currentKey === patternKey}
        />
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          Patterns[patternKey].title
        }
      </Flex>
      <Box sx={{ p: 2, pt: 0, mt: 0 }}>
        <Text sx={{ as: "p", fontSize: 1 }}>
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            Patterns[patternKey].description
          }
        </Text>
      </Box>
    </Label>
  );
};

export const NumberOfBlocks = ({ currentValue, onUpdate }) => {
  const _onUpdate = (e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {
      target: { value },
    } = e;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const val = parseInt(value);
    if (val) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      onUpdate(val);
    }
  };
  return (
    <Box>
      <Label variant="label.primary">Block repetitions</Label>
      <Input
        sx={{ maxWidth: "440px", bg: "headSection" }}
        type="number"
        onChange={_onUpdate}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value={currentValue}
      />
    </Box>
  );
};

const PreTab = ({ content }) => (
  <Text
    as="span"
    sx={{
      position: "absolute",
      left: "9px",
      height: "calc(100% - 2px)",
      display: "flex",
      alignItems: "center",
      bg: "borders",
      px: 1,
      fontSize: 1,
    }}
  >
    {content}
  </Text>
);

export const HandleMinMax = ({ title, value, moreInfo, onUpdate }) => {
  const _onUpdate = (key, val) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    onUpdate({
      ...value,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      [key]: parseInt(val),
    });
  };

  return (
    <Box my={3}>
      <Text as="p" mb={2}>
        {title}
      </Text>
      <Flex sx={{ maxWidth: "440px", alignItems: "center" }}>
        <Label
          sx={{ display: "flex", alignItems: "center", position: "relative" }}
        >
          <PreTab content="Min." />
          <Input
            type="number"
            onChange={(e) => _onUpdate("min", e.target.value)}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            value={value.min}
            sx={{
              bg: "backgroundClear",
              p: 1,
              pl: "48px",
              fontSize: 1,
              ml: 2,
            }}
          />
        </Label>
        <Label
          sx={{
            ml: 2,
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <PreTab content="Max." />
          <Input
            type="number"
            onChange={(e) => _onUpdate("max", e.target.value)}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            value={value.max}
            sx={{
              bg: "backgroundClear",
              p: 1,
              pl: "48px",
              fontSize: 1,
              ml: 2,
            }}
          />
        </Label>
      </Flex>
      <Text as="p" sx={{ mt: 2 }}>
        {moreInfo}
      </Text>
    </Box>
  );
};
