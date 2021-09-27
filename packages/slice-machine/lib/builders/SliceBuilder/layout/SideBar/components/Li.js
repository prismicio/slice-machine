import { Flex, Box, Heading, Text, useThemeUI } from "theme-ui";
import { MdError } from "react-icons/md";

const Li = ({
  Icon,
  title,
  description,
  bodySx,
  hasError = false,
  sx = {},
  ...rest
}) => {
  const { theme } = useThemeUI();
  return (
    <Flex
      as="li"
      sx={{
        p: 3,
        borderBottom: "1px solid",
        borderColor: "borders",
        alignItems: "center",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        ...sx,
      }}
      {...rest}
    >
      <Box mr={3} sx={{ position: "relative" }}>
        <Icon />
        {hasError ? (
          <Box sx={{ position: "absolute", top: "-8px", right: "-8px" }}>
            <MdError style={{ fontSize: "16px", fill: theme.colors.error }} />
          </Box>
        ) : null}
      </Box>
      <Box sx={bodySx}>
        <Heading as="h5" sx={{ color: hasError ? "error" : "text" }}>
          {title}
        </Heading>
        <Text as="p" variant="xs">
          {description}
        </Text>
      </Box>
    </Flex>
  );
};

export default Li;
