import React from "react";
import { Flex } from "theme-ui";
import { RiErrorWarningLine } from "react-icons/ri";
import { ThemeUIStyleObject } from "@theme-ui/css";

type WarningBadgeProps = {
  sx: ThemeUIStyleObject;
};

const WarningBadge: React.FunctionComponent<WarningBadgeProps> = ({ sx }) => (
  <Flex
    sx={{
      height: 20,
      width: 20,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50%",
      borderStyle: "solid",
      backgroundColor: "lightOrange",
      borderColor: "lightOrange",
      borderWidth: 1,
      mr: 2,
      ...sx,
    }}
  >
    <RiErrorWarningLine color="#F2994A" />
  </Flex>
);

export default WarningBadge;
