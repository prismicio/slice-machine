import React from "react";
import * as RadixHoverCard from "@radix-ui/react-hover-card";

import * as styles from "./HoverCard.css";

export type HoverCardProps = React.PropsWithChildren<
  {
    anchor: React.ReactNode;
    side?: RadixHoverCard.HoverCardContentProps["side"];
    sideOffset?: RadixHoverCard.HoverCardContentProps["sideOffset"];
    arrowSize?: number;
  } & RadixHoverCard.HoverCardProps
>;

export const HoverCard: React.FC<HoverCardProps> = ({
  anchor,
  children,
  side,
  sideOffset,
  arrowSize = 12,
  ...rest
}) => {
  const { arrowWidth, arrowHeight } = React.useMemo(() => {
    if (arrowSize === undefined)
      return {
        arrowWidth: 10,
        arrowHeight: 5,
      };

    const arrowWidth = Math.SQRT2 * arrowSize;
    const arrowHeight = arrowWidth / 2;

    return { arrowWidth, arrowHeight };
  }, [arrowSize]);

  return (
    <RadixHoverCard.Root {...rest}>
      <RadixHoverCard.Trigger asChild>{anchor}</RadixHoverCard.Trigger>
      <RadixHoverCard.Portal>
        <RadixHoverCard.Content
          className={styles.container}
          side={side}
          sideOffset={sideOffset}
        >
          {children}
          <RadixHoverCard.Arrow
            className={styles.arrow}
            width={arrowWidth}
            height={arrowHeight}
          />
        </RadixHoverCard.Content>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  );
};
