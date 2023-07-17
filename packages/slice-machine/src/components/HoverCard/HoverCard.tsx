import React from "react";
import * as RadixHoverCard from "@radix-ui/react-hover-card";

import * as styles from "./HoverCard.css";

export type HoverCardProps = React.PropsWithChildren<
  {
    anchor: React.ReactNode;
    side?: RadixHoverCard.HoverCardContentProps["side"];
    sideOffset?: RadixHoverCard.HoverCardContentProps["sideOffset"];
    arrowSize?: number;
    align?: RadixHoverCard.HoverCardContentProps["align"];
    alignOffset?: RadixHoverCard.HoverCardContentProps["alignOffset"];
  } & RadixHoverCard.HoverCardProps
>;

export const HoverCard: React.FC<HoverCardProps> = ({
  anchor,
  children,
  side,
  sideOffset,
  arrowSize = 12,
  align,
  alignOffset,
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
          align={align}
          alignOffset={alignOffset}
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
