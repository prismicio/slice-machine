import React from "react";
import { Flex, Text } from "theme-ui";
import { FaRegQuestionCircle } from "react-icons/fa";

const Section: React.FC<{
  children: React.ReactNode;
  heading: React.ReactNode;
}> = ({ children, heading }) => (
  <Flex sx={{ padding: "16px 20px" }}>
    <Flex
      sx={{
        padding: 3,
        backgroundColor: (t) => t.colors?.gray,
        borderRadius: 8,
        flexDirection: "column",
      }}
    >
      <Flex sx={{ alignItems: "center", mb: 3 }}>
        <Flex sx={{ mr: 2 }}>
          <FaRegQuestionCircle size={20} color="textGray" />
        </Flex>
        <Text sx={{ fontSize: 2, fontWeight: 500 }}>{heading}</Text>
      </Flex>
      <Text sx={{ color: (t) => t.colors?.textClear }}>{children}</Text>
    </Flex>
  </Flex>
);

export default Section;
