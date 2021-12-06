import React from "react";
import { Card as ThemeCard, ThemeUIStyleObject } from "theme-ui";
import { CardBox, CardBoxProps } from "./CardBox";

interface CardProps extends Omit<CardBoxProps, "withRadius"> {
  Header?: React.FC<{ radius: string }>;
  SubHeader?: React.FC<{ radius: string }>;
  Body?: React.FC;
  Footer?: React.FC;
  borderFooter?: boolean;
  bodySx?: ThemeUIStyleObject;
  footerSx?: ThemeUIStyleObject;
}

const Card: React.FC<CardProps> = ({
  Header = null,
  SubHeader = null,
  Body = null,
  Footer = null,
  borderFooter = false,
  radius = "6px",
  bodySx = {},
  footerSx = {},
  sx = null,
  bg,
  background,
  children,
  ...rest
}) => (
  <ThemeCard
    sx={{
      border: (t) => `1px solid ${t.colors?.borders}`,
      borderRadius: radius,
      ...sx,
    }}
    {...rest}
  >
    {Header ? <Header radius={radius} /> : null}
    {SubHeader ? <SubHeader radius={radius} /> : null}
    <CardBox bg={bg} background={background} sx={bodySx} withRadius={!Footer}>
      {Body ? <Body /> : null}
      {children ? children : null}
    </CardBox>
    {Footer ? (
      <CardBox
        bg={bg}
        background={background}
        sx={{
          ...(borderFooter
            ? {
                borderTop: ({ colors }) => `1px solid ${colors?.borders}`,
              }
            : null),
          ...footerSx,
        }}
        withRadius
      >
        {typeof Footer === "object" ? Footer : <Footer />}
      </CardBox>
    ) : null}
  </ThemeCard>
);

export default Card;
