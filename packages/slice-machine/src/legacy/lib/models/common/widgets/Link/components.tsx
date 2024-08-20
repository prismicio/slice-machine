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
          <Checkbox
            checked={allowDisplayText}
            onChange={() => setAllowDisplayText(!allowDisplayText)}
          />
          Allow display text
        </Label>
      </Flex>
    </Col>
  );
}
