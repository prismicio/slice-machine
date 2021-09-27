import { Box, Card as ThemeCard } from "theme-ui";

const CardBox = ({
  bg,
  background,
  sx,
  children = null,
  withRadius,
  radius,
}) => (
  <Box
    sx={{
      p: 4,
      bg: bg || background,
      ...(withRadius
        ? {
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
          }
        : null),
      ...sx,
    }}
  >
    {children}
  </Box>
);
const Card = ({
  Header = null,
  SubHeader = null,
  Body = null,
  Footer = null,
  borderFooter = false,
  radius = "6px",
  bodySx = {},
  footerSx = {},
  sx = null,
  bg = null,
  children = null,
  background = null,
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
                borderTop: ({ colors }) => `1px solid ${colors.borders}`,
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
