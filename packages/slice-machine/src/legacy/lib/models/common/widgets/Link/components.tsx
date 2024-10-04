import { Box, Icon, Tooltip } from "@prismicio/editor-ui";
import { Checkbox, Flex, Label } from "theme-ui";

import { Col } from "@/legacy/components/Flex";

interface DisplayTextCheckboxProps {
  allowText?: boolean;
  height?: 130 | 127;
  setFieldValue: (
    a: string,
    b?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => void | Promise<any>;
}

export function DisplayTextCheckbox(props: DisplayTextCheckboxProps) {
  const { allowText, height = 130, setFieldValue } = props;

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
                checked={allowText}
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
