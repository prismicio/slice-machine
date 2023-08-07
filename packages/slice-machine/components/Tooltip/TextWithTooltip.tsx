import ReactTooltip from "react-tooltip";
import React, { ElementType, useEffect, useRef, useState } from "react";
import { Text, ThemeUIStyleObject } from "theme-ui";

import { ReactTooltipPortal } from "@components/ReactTooltipPortal";

interface TextWithTooltipProps {
  text: string;
  as: ElementType;
  sx?: ThemeUIStyleObject;
}

export const TextWithTooltip: React.FC<TextWithTooltipProps> = ({
  text,
  as,
  sx = {},
}) => {
  const headingRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState<boolean | null>(null);

  const updateTooltipVisibility = () => {
    setShowTooltip(
      headingRef.current &&
        headingRef.current.offsetWidth < headingRef.current.scrollWidth
    );
  };

  useEffect(() => {
    updateTooltipVisibility();
    window.addEventListener("resize", updateTooltipVisibility);
    return () => {
      window.removeEventListener("resize", updateTooltipVisibility);
    };
  }, []);

  return (
    <>
      <Text
        data-for={text}
        data-tip
        sx={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          ...sx,
        }}
        as={as}
        ref={headingRef}
      >
        {text}
      </Text>
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
      {showTooltip && (
        <ReactTooltipPortal>
          <ReactTooltip
            id={text}
            type="dark"
            multiline
            border
            borderColor="black"
            place="bottom"
            effect="solid"
          >
            {text}
          </ReactTooltip>
        </ReactTooltipPortal>
      )}
    </>
  );
};
