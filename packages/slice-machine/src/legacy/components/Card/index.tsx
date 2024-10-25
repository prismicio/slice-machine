import React, { createContext, useContext } from "react";
import { Card as ThemeCard, ThemeUIStyleObject } from "theme-ui";

import { CardBox, CardBoxProps } from "./CardBox";

const CardRadiusContext = createContext<string>("6px");

export const useCardRadius = () => useContext(CardRadiusContext);
interface CardProps extends Omit<CardBoxProps, "withRadius"> {
  Header?: JSX.Element | null;
  SubHeader?: JSX.Element | null;
  Body?: React.FC | null;
  Footer?: React.FC | JSX.Element | null;
  borderFooter?: boolean;
  bodySx?: ThemeUIStyleObject;
  footerSx?: ThemeUIStyleObject;
}

export const Card: React.FC<CardProps> = ({
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
  <CardRadiusContext.Provider value={radius}>
    <ThemeCard
      sx={{
        border: (t) => `1px solid ${String(t.colors?.borders)}`,
        borderRadius: radius,
        ...sx,
      }}
      {...rest}
    >
      {Header ? Header : null}
      {SubHeader ? SubHeader : null}
      <CardBox bg={bg} background={background} sx={bodySx} withRadius={!Footer}>
        {Body ? <Body /> : null}
        {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
        {children ? children : null}
      </CardBox>
      {Footer ? (
        <CardBox
          bg={bg}
          background={background}
          sx={{
            ...(borderFooter
              ? {
                  borderTop: ({ colors }) =>
                    `1px solid ${String(colors?.borders)}`,
                }
              : null),
            ...footerSx,
          }}
          radius={radius}
          withRadius
        >
          {typeof Footer === "object" ? Footer : <Footer />}
        </CardBox>
      ) : null}
    </ThemeCard>
  </CardRadiusContext.Provider>
);
