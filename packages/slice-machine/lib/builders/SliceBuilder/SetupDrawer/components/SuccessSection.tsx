import React from "react";

import { Flex, Text } from "theme-ui";

import { MdCheck } from "react-icons/md";

const SuccessSection: React.FunctionComponent = () => {
  return (
    <Flex
      sx={{
        p: 3,
        bg: "lightGreen",
        alignItems: "center",
      }}
    >
      <MdCheck color="#3AB97A" />
      <Text
        sx={{
          ml: 1,
        }}
      >
        Successfully configured
      </Text>
    </Flex>
  );
};

export default SuccessSection;
