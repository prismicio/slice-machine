import { Flex, Box, Heading, Card } from "theme-ui";

const PreviewCard = ({
  variant = "primary",
  selected,
  title,
  imageUrl,
  sx,
  titleSx,
  ...rest
}) => (
  <Card
    variant={variant}
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    sx={{
      mb: 2,
      p: 2,
      bg: "headSection",
      cursor: "pointer",
      "&:hover": {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        border: ({ colors }) => `2px solid ${colors.primary}`,
        boxShadow: "0 0 0 3px rgba(81, 99, 186, 0.2)",
      },
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      border: selected
        ? "2px solid rgba(81, 99, 186, 1)"
        : "2px solid rgba(81, 99, 186, 0.2)",
      ...sx,
    }}
    {...rest}
  >
    <Flex sx={{ alignItems: "center", justifyContent: "space-between", p: 2 }}>
      <Heading
        as="h3"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        sx={titleSx}
      >
        {title}
      </Heading>
      <Box
        sx={{
          width: "44px",
          height: "44px",
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          backgroundImage: `url("${imageUrl}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      />
    </Flex>
  </Card>
);

export default PreviewCard;
