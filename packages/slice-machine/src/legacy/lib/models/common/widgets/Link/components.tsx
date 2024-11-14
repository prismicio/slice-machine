import { Box, Icon, Text, Tooltip } from "@prismicio/editor-ui";
import { Checkbox, Flex, Label } from "theme-ui";

import { Col } from "@/legacy/components/Flex";

interface CommonCheckboxProps {
  checked?: boolean;
  height?: 130 | 127;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFieldValue: (name: string, checked?: boolean) => void | Promise<any>;
}

export function DisplayTextCheckbox(props: CommonCheckboxProps) {
  const { checked, height = 130, setFieldValue } = props;

  return (
    <Col>
      <Flex
        sx={{
          mt: 2,
          alignItems: "center",
          height: `${height}%`,
        }}
      >
        <Label variant="label.border">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Flex>
              <Checkbox
                checked={checked}
                onChange={(event) => {
                  void setFieldValue("config.allowText", event.target.checked);
                }}
              />
              Allow display text
            </Flex>
            <Tooltip
              content="Allow editors to customize the link display text"
              align="end"
              zIndexHack
            >
              <Icon name="alert" size="medium" color="grey11" />
            </Tooltip>
          </Box>
        </Label>
      </Flex>
    </Col>
  );
}

export function RepeatableCheckbox(props: CommonCheckboxProps) {
  const { checked, setFieldValue } = props;

  return (
    <Box flexDirection="column">
      <Label
        htmlFor="repeat"
        variant="label.primary"
        sx={{
          mt: 2,
        }}
      >
        Repeatable
      </Label>
      <Label variant="label.border" sx={{ display: "flex" }}>
        <Checkbox
          name="repeat"
          checked={checked}
          onChange={(event) => {
            void setFieldValue("config.repeat", event.target.checked);
          }}
        />
        Make this link repeatable - Allow editors to create lists of links
      </Label>
      <Box alignItems="center" gap={4}>
        <Icon name="alert" size="medium" color="grey11" />
        <Text variant="normal" color="grey11">
          Repeatable link fields are returned as an array of links by the API.{" "}
          <a
            href="https://prismic.io/docs/field"
            style={{ textDecoration: "none" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text variant="normal" color="indigo11">
              See documentation.
            </Text>
          </a>
        </Text>
      </Box>
    </Box>
  );
}
