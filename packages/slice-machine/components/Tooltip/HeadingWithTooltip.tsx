import ReactTooltip from "react-tooltip";
import React from "react";
import { Heading } from "theme-ui";

interface HeadingWithTooltip {
  text: string;
}

export const HeadingWithTooltip: React.FC<HeadingWithTooltip> = ({ text }) => {
  return (
    <>
      <Heading
        data-for={text}
        data-tip
        sx={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        as="h6"
      >
        {text}
      </Heading>
      <ReactTooltip
        id={text}
        type="dark"
        multiline
        border
        borderColor={"black"}
        place="bottom"
      >
        {text}
      </ReactTooltip>
    </>
  );
};
