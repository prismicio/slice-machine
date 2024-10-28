import { Box, Close, Flex } from "theme-ui";

import { Card, useCardRadius } from "./";

const DefaultCard = ({
  children,
  FooterContent,
  HeaderContent,
  close,
  sx = {},
}) => (
  <Card
    borderFooter
    footerSx={{ p: 0 }}
    bodySx={{ pt: 2, pb: 4, px: 4 }}
    sx={{ border: "none", ...sx }}
    Header={
      <CardHeader>
        {HeaderContent}
        {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-assignment
          close ? <Close onClick={close} type="button" /> : null
        }
      </CardHeader>
    }
    Footer={
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      FooterContent ? (
        <Flex sx={{ alignItems: "space-between", bg: "headSection", p: 3 }}>
          <Box sx={{ ml: "auto" }} />
          {FooterContent}
        </Flex>
      ) : null
    }
  >
    {children}
  </Card>
);

function CardHeader({ children }) {
  const radius = useCardRadius();
  return (
    <Flex
      sx={{
        p: 3,
        pl: 4,
        bg: "headSection",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        borderBottom: (t) => `1px solid ${t.colors?.borders}`,
      }}
    >
      {children}
    </Flex>
  );
}
export default DefaultCard;
