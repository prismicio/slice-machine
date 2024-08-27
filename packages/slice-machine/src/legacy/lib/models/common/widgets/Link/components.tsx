import { Box, Icon, Tooltip } from "@prismicio/editor-ui";
import { Checkbox, Flex, Label } from "theme-ui";

import { Col } from "@/legacy/components/Flex";

type DisplayTextModel = { type: "Text" };

interface DisplayTextCheckboxProps {
  text?: DisplayTextModel;
  height?: 130 | 127;
  setFieldValue: (
    a: string,
    b?: DisplayTextModel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => void | Promise<any>;
}

export function DisplayTextCheckbox(props: DisplayTextCheckboxProps) {
  const { text, height = 130, setFieldValue } = props;

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
                checked={Boolean(text)}
                onChange={(event) => {
                  void setFieldValue(
                    "config.text",
                    event.target.checked ? { type: "Text" } : undefined,
                  );
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
