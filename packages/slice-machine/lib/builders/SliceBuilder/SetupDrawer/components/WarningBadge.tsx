import React from "react";
import { type ThemeUIStyleObject, Flex } from "theme-ui";
import { RiErrorWarningLine } from "react-icons/ri";

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
