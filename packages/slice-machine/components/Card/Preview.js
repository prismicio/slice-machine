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
    sx={{
      mb: 2,
      p: 2,
      bg: "headSection",
      cursor: "pointer",
      "&:hover": {
        border: ({ colors }) => `2px solid ${colors.primary}`,
        boxShadow: "0 0 0 3px rgba(81, 99, 186, 0.2)",
      },
      border: selected
        ? "2px solid rgba(81, 99, 186, 1)"
        : "2px solid rgba(81, 99, 186, 0.2)",
      ...sx,
    }}
    {...rest}
  >
    <Flex sx={{ alignItems: "center", justifyContent: "space-between", p: 2 }}>
      <Heading as="h3" sx={titleSx}>
        {title}
      </Heading>
      <Box
        sx={{
          width: "44px",
          height: "44px",
          backgroundImage: `url("${imageUrl}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      ></Box>
    </Flex>
  </Card>
);

export default PreviewCard;
