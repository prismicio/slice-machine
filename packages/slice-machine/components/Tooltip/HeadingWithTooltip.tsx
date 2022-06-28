import ReactTooltip from "react-tooltip";
import React, { useEffect, useRef, useState } from "react";
import { Heading } from "theme-ui";

interface HeadingWithTooltip {
  text: string;
}

export const HeadingWithTooltip: React.FC<HeadingWithTooltip> = ({ text }) => {
  const headingRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState<boolean | null>(null);

  useEffect(() => {
    setShowTooltip(
      headingRef.current &&
        headingRef.current.offsetWidth < headingRef.current.scrollWidth
    );
  }, []);

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
        ref={headingRef}
      >
        {text}
      </Heading>
      {showTooltip ? (
        <ReactTooltip
          id={text}
          type="dark"
          multiline
          border
          borderColor={"black"}
          place="bottom"
          max-width="192"
        >
          {text}
        </ReactTooltip>
      ) : null}
    </>
  );
};
