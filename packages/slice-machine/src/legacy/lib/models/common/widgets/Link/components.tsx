import { Box, Icon, Tooltip } from "@prismicio/editor-ui";
import React, { useEffect, useState } from "react";
import { Checkbox, Flex, Label } from "theme-ui";

import { Col } from "@/legacy/components/Flex";

type DisplayTextModel = { type: string };

interface DisplayTextCheckboxProps {
  text?: DisplayTextModel;
  setFieldValue: (
    a: string,
    b?: DisplayTextModel,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any
  ) => void | Promise<void | any>;
}

export function DisplayTextCheckbox(props: DisplayTextCheckboxProps) {
  const { text, setFieldValue } = props;

  const [allowDisplayText, setAllowDisplayText] = useState(Boolean(text));

  useEffect(() => {
    void setFieldValue(
      "config.text",
      allowDisplayText ? { type: "Text" } : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowDisplayText]);

  return (
    <Col>
      <Flex
        sx={{
          mt: 2,
          alignItems: "center",
          height: "130%",
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
                checked={allowDisplayText}
                onChange={() => setAllowDisplayText(!allowDisplayText)}
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
